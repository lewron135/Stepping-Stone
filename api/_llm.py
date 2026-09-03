"""Pemanggilan Claude, verifikasi user, dan batas pemakaian.

Dipakai bersama oleh `api/draft-brief.py` dan `api/parse-search.py`. Modul ini yang memegang
`ANTHROPIC_API_KEY`; key itu tidak pernah sampai ke browser.

Sengaja memakai `urllib` dan bukan SDK Anthropic. API Messages cuma satu POST JSON, sementara
menambah dependensi berarti menambah ukuran function, dan batas ukuran itu sudah pernah jadi
masalah nyata di proyek ini waktu spaCy dibuang dari ekstraksi CV.
"""

import json
import os
import time
import urllib.error
import urllib.request
from collections import defaultdict, deque

MODEL = "claude-haiku-4-5-20251001"
ANTHROPIC_URL = "https://api.anthropic.com/v1/messages"
ANTHROPIC_VERSION = "2023-06-01"
ANTHROPIC_TIMEOUT = 20
SUPABASE_TIMEOUT = 10

# Lapis penjaga ketiga. Angkanya dipilih supaya pemakaian wajar tidak pernah menyentuhnya,
# tapi satu orang tidak bisa menghabiskan credit tim sendirian.
MAX_INPUT_CHARS = 500
RATE_LIMIT_CALLS = 10
RATE_LIMIT_WINDOW = 10 * 60

# Catatan jujur soal batas ini: penyimpanannya di memori instance, jadi ikut hilang saat
# Vercel mendaur ulang instance-nya. Cukup untuk menahan pemakaian berlebihan yang biasa,
# bukan untuk menahan penyerang yang niat. Versi persisten butuh tabel di Supabase.
_calls = defaultdict(deque)


class LlmError(Exception):
    """Kegagalan yang sudah punya status HTTP dan pesan yang aman ditampilkan ke user."""

    def __init__(self, status: int, message: str):
        super().__init__(message)
        self.status = status
        self.message = message


def clean_text(raw) -> str:
    """Membersihkan teks dari user dan memotongnya di batas yang sudah ditetapkan."""
    if not isinstance(raw, str):
        raise LlmError(400, "Teks permintaan tidak terbaca.")
    text = raw.strip()
    if not text:
        raise LlmError(400, "Tulis dulu yang mau kamu minta.")
    return text[:MAX_INPUT_CHARS]


def verify_user(auth_header) -> str:
    """Menukar token Supabase dari browser jadi id user, atau menolak.

    Anon key dan URL Supabase bukan rahasia, jadi tidak ada secret baru yang perlu didaftarkan
    untuk ini. Yang dijaga di sini bukan kerahasiaan, tapi supaya endpoint berbayar cuma
    melayani orang yang benar-benar punya akun.
    """
    header = auth_header or ""
    token = header[7:].strip() if header.lower().startswith("bearer ") else ""
    if not token:
        raise LlmError(401, "Masuk dulu untuk memakai asisten.")

    base = os.environ.get("SUPABASE_URL") or os.environ.get("VITE_SUPABASE_URL")
    key = os.environ.get("SUPABASE_ANON_KEY") or os.environ.get("VITE_SUPABASE_ANON_KEY")
    if not base or not key:
        raise LlmError(503, "Server belum dikonfigurasi untuk memeriksa sesi.")

    request = urllib.request.Request(
        base.rstrip("/") + "/auth/v1/user",
        headers={"apikey": key, "Authorization": "Bearer " + token},
    )
    try:
        with urllib.request.urlopen(request, timeout=SUPABASE_TIMEOUT) as response:
            profile = json.load(response)
    except urllib.error.HTTPError:
        raise LlmError(401, "Sesimu sudah berakhir. Masuk lagi untuk memakai asisten.")
    except urllib.error.URLError:
        raise LlmError(503, "Tidak bisa memeriksa sesi sekarang. Coba lagi sebentar lagi.")

    user_id = profile.get("id") if isinstance(profile, dict) else None
    if not user_id:
        raise LlmError(401, "Masuk dulu untuk memakai asisten.")
    return user_id


def enforce_rate_limit(user_id: str):
    now = time.monotonic()
    seen = _calls[user_id]
    while seen and now - seen[0] > RATE_LIMIT_WINDOW:
        seen.popleft()
    if len(seen) >= RATE_LIMIT_CALLS:
        raise LlmError(429, "Terlalu banyak permintaan ke asisten. Coba lagi beberapa menit lagi.")
    seen.append(now)


def authorize(headers) -> str:
    """Lapis penjaga ketiga, satu panggilan: harus login, dan harus di bawah batas pemakaian."""
    user_id = verify_user(headers.get("Authorization"))
    enforce_rate_limit(user_id)
    return user_id


def call_claude(system: str, user_text: str, tool: dict, max_tokens: int = 700) -> dict:
    """Memanggil Claude dengan satu tool yang dipaksa, lalu mengembalikan isinya sebagai dict.

    `tool_choice` mengunci model supaya wajib memakai tool itu, jadi balasannya selalu objek
    yang mengikuti skema. Ini jauh lebih kuat daripada meminta model menulis JSON di prosa,
    karena bentuk keluarannya jadi kontrak, bukan harapan.
    """
    key = os.environ.get("ANTHROPIC_API_KEY")
    if not key:
        raise LlmError(503, "Asisten AI belum diaktifkan di server ini.")

    payload = json.dumps({
        "model": MODEL,
        "max_tokens": max_tokens,
        "system": system,
        "messages": [{"role": "user", "content": user_text}],
        "tools": [tool],
        "tool_choice": {"type": "tool", "name": tool["name"]},
    }).encode("utf-8")

    request = urllib.request.Request(
        ANTHROPIC_URL,
        data=payload,
        headers={
            "content-type": "application/json",
            "x-api-key": key,
            "anthropic-version": ANTHROPIC_VERSION,
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=ANTHROPIC_TIMEOUT) as response:
            data = json.load(response)
    except urllib.error.HTTPError as error:
        # Detail error dari Anthropic cuma dicatat di log server, tidak dibocorkan ke browser.
        print("anthropic error", error.code, error.read()[:400])
        if error.code in (429, 529):
            raise LlmError(429, "Asisten sedang sibuk. Coba lagi sebentar lagi.")
        raise LlmError(502, "Asisten sedang tidak bisa dihubungi.")
    except urllib.error.URLError:
        raise LlmError(502, "Asisten sedang tidak bisa dihubungi.")

    for block in data.get("content", []):
        if block.get("type") == "tool_use":
            result = block.get("input")
            if isinstance(result, dict):
                return result
    raise LlmError(502, "Asisten membalas dengan bentuk yang tidak dikenali.")


def text_field(value, limit: int) -> str:
    """Mengambil satu kolom teks dari keluaran model, dipotong di batas kolom formnya."""
    if not isinstance(value, str):
        return ""
    return " ".join(value.split())[:limit].strip()
