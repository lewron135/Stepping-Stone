"""POST /api/draft-brief

Menerima satu kalimat niat dari pemberi kerja, mengembalikan draf brief yang mengisi form
Pasang Pekerjaan. Semuanya usulan. Yang memutuskan tetap user lewat form, sama seperti pola
yang sudah dipakai ekstraksi CV.
"""

import os
import sys
from datetime import datetime, timedelta, timezone

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from _json_http import JsonHandler  # noqa: E402
from _llm import LlmError, authorize, call_claude, clean_text, text_field  # noqa: E402
from _reference import (  # noqa: E402
    ALL_CATEGORIES,
    KERJA_CEPAT_CATEGORIES,
    PROYEK_CATEGORIES,
    type_of_category,
)

# Waktu Indonesia bagian barat. Server Vercel berjalan di UTC, sementara "besok" yang dimaksud
# user adalah besok menurut jamnya sendiri.
WIB = timezone(timedelta(hours=7))
MAX_DEADLINE_DAYS = 180

# Jam tenggat bawaan kalau model cuma menyebut tanggal. Sore dipilih karena tenggat pekerjaan
# kampus praktisnya jatuh di akhir hari, bukan tengah malam.
DEFAULT_DEADLINE_HOUR = 17

SYSTEM = """Kamu asisten penyusun brief di Stepping Stone, forum kerja antar mahasiswa dalam satu kampus.

Tugasmu satu saja: mengubah kalimat pemberi kerja jadi draf brief pekerjaan. Kamu tidak menjawab
pertanyaan lain, tidak mengobrol, tidak memberi saran karier, dan tidak menulis apa pun di luar
kolom brief.

Ada dua jenis pekerjaan:
- kerja-cepat: tugas singkat sekali jalan di sekitar kampus, biasanya di bawah satu hari.
  Kategorinya: {kerja_cepat}
- proyek: pekerjaan berbasis keahlian dengan hasil yang diserahkan. Kategorinya: {proyek}

Aturan menulis:
- Bahasa Indonesia yang wajar, seperti mahasiswa menulis ke sesama mahasiswa. Tanpa emoji dan
  tanpa tanda pisah panjang.
- Ruang lingkup minimal 20 karakter, menjelaskan apa yang dikerjakan, batasannya, dan materi
  yang disediakan pemberi kerja. Jangan mengarang detail yang tidak disebut user; kalau
  informasinya kurang, tulis lingkup yang wajar dan umum, bukan angka yang dikarang.
- Hasil akhir harus berbentuk konkret dan bisa diserahkan, misalnya "1 poster A3 (PDF) dan
  3 feed Instagram (PNG)".
- Jangan pernah mengusulkan harga. Harga itu urusan tawar menawar antar orang, bukan urusanmu.

Hari ini {today} di Indonesia bagian barat. Kalau user menyebut waktu secara relatif seperti
"minggu depan", hitung dari tanggal itu.

Isi kolom intent dengan jujur:
- "pekerjaan" kalau user memang sedang menjelaskan pekerjaan yang mau dipasang.
- "di-luar-topik" kalau permintaannya bukan soal memasang pekerjaan.
- "tidak-pantas" kalau permintaannya melanggar hukum, membahayakan, atau meminta joki tugas
  kuliah dan ujian.
Kalau intent bukan "pekerjaan", kosongkan kolom lainnya."""

TOOL = {
    "name": "susun_draf_brief",
    "description": "Menyusun draf brief pekerjaan dari kalimat niat pemberi kerja.",
    "input_schema": {
        "type": "object",
        "properties": {
            "intent": {
                "type": "string",
                "enum": ["pekerjaan", "di-luar-topik", "tidak-pantas"],
                "description": "Penilaianmu atas maksud user.",
            },
            "type": {
                "type": "string",
                "enum": ["kerja-cepat", "proyek"],
                "description": "Jenis pekerjaan yang paling cocok.",
            },
            "category": {
                "type": "string",
                "enum": ALL_CATEGORIES,
                "description": "Kategori yang paling cocok, harus dari daftar.",
            },
            "title": {
                "type": "string",
                "description": "Judul singkat untuk feed, minimal 8 karakter.",
            },
            "scope": {"type": "string", "description": "Ruang lingkup, minimal 20 karakter."},
            "deliverable": {"type": "string", "description": "Hasil akhir yang diserahkan."},
            "deadline": {
                "type": "string",
                "description": "Tanggal tenggat yang wajar, format YYYY-MM-DD.",
            },
        },
        "required": ["intent"],
    },
}


def parse_deadline(value, today):
    """Tanggal dari model, dipakai hanya kalau masuk akal. Formatnya untuk input datetime-local."""
    if not isinstance(value, str):
        return ""
    try:
        parsed = datetime.strptime(value.strip()[:10], "%Y-%m-%d").date()
    except ValueError:
        return ""
    if parsed < today or parsed > today + timedelta(days=MAX_DEADLINE_DAYS):
        return ""
    return f"{parsed.isoformat()}T{DEFAULT_DEADLINE_HOUR:02d}:00"


def build_draft(result: dict, today) -> dict:
    """Menyaring keluaran model jadi kolom form. Yang tidak lolos dibuang, bukan ditampilkan."""
    category = result.get("category")
    category = category if category in ALL_CATEGORIES else ""

    # Jenis diturunkan dari kategori kalau keduanya bentrok, karena kategori yang dipakai
    # form untuk menentukan isi dropdown.
    job_type = type_of_category(category) if category else result.get("type")
    if job_type not in ("kerja-cepat", "proyek"):
        job_type = ""

    # Kolom pendek dibuang daripada dikirim, karena kolom yang langsung ditolak validasi form
    # terlihat seperti fitur yang rusak.
    title = text_field(result.get("title"), 80)
    scope = text_field(result.get("scope"), 600)
    return {
        "type": job_type,
        "category": category,
        "title": title if len(title) >= 8 else "",
        "scope": scope if len(scope) >= 20 else "",
        "deliverable": text_field(result.get("deliverable"), 200),
        "deadline": parse_deadline(result.get("deadline"), today),
    }


class handler(JsonHandler):
    def handle_json(self, body: dict):
        try:
            authorize(self.headers)
            text = clean_text(body.get("text"))
            today = datetime.now(WIB).date()
            result = call_claude(
                SYSTEM.format(
                    kerja_cepat=", ".join(KERJA_CEPAT_CATEGORIES),
                    proyek=", ".join(PROYEK_CATEGORIES),
                    today=today.isoformat(),
                ),
                text,
                TOOL,
            )
        except LlmError as error:
            return error.status, {"error": error.message}

        # Lapis penjaga kedua. Penolakan ditegakkan di sini, bukan diserahkan ke model untuk
        # menuliskannya sendiri, karena penolakan yang dijalankan kode jauh lebih sulit dijebol.
        intent = result.get("intent")
        if intent == "tidak-pantas":
            return 422, {"error": "Permintaan itu tidak bisa dibantu di sini."}
        if intent != "pekerjaan":
            return 422, {"error": "Coba ceritakan pekerjaan yang mau kamu pasang."}

        return 200, build_draft(result, datetime.now(WIB).date())
