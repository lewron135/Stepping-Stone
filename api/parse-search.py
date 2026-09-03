"""POST /api/parse-search

Menerjemahkan kalimat pencarian jadi filter terstruktur. Model tidak pernah menyortir atau
mengembalikan daftar pekerjaan; itu tetap dikerjakan kode filter yang sudah ada di feed
(masterplan bagian 19). Yang diterjemahkan di sini cuma niatnya jadi kolom filter.
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from _json_http import JsonHandler  # noqa: E402
from _llm import LlmError, authorize, call_claude, clean_text, text_field  # noqa: E402
from _reference import (  # noqa: E402
    ALL_CATEGORIES,
    KERJA_CEPAT_CATEGORIES,
    PROYEK_CATEGORIES,
    type_of_category,
)

MAX_AREAS = 30
MAX_HARGA = 1_000_000_000

SYSTEM = """Kamu asisten pencarian di Stepping Stone, forum kerja antar mahasiswa dalam satu kampus.

Tugasmu satu saja: mengubah kalimat pencari kerja jadi filter. Kamu tidak menjawab pertanyaan
lain, tidak mengobrol, dan tidak pernah menyebut atau memilihkan pekerjaan tertentu. Yang
menyaring daftar pekerjaan adalah aplikasinya, bukan kamu.

Ada dua tab:
- kerja-cepat: tugas singkat sekali jalan di sekitar kampus. Kategorinya: {kerja_cepat}
- proyek: pekerjaan berbasis keahlian dengan hasil yang diserahkan. Kategorinya: {proyek}

Aturan mengisi filter:
- Isi kolom hanya kalau kalimat user memang menyebutnya. Kolom yang tidak disebut biarkan
  kosong. Filter yang dikarang membuat hasil pencarian jadi kosong tanpa alasan.
- hargaMaks dalam rupiah, angka saja. "50 ribu" berarti 50000, "50rb" berarti 50000.
  Isi hanya kalau user menyebut batas atas harga.
- area hanya boleh diisi dari daftar area yang tersedia: {areas}
  Kalau yang disebut user tidak ada di daftar itu, biarkan kosong.

Isi kolom intent dengan jujur:
- "cari-kerja" kalau user memang sedang mencari pekerjaan.
- "di-luar-topik" kalau permintaannya bukan soal mencari pekerjaan di forum ini.
- "tidak-pantas" kalau permintaannya melanggar hukum, membahayakan, atau mencari joki tugas
  kuliah dan ujian.
Kalau intent bukan "cari-kerja", kosongkan kolom lainnya."""

TOOL = {
    "name": "susun_filter_pencarian",
    "description": "Menerjemahkan kalimat pencarian jadi filter feed.",
    "input_schema": {
        "type": "object",
        "properties": {
            "intent": {
                "type": "string",
                "enum": ["cari-kerja", "di-luar-topik", "tidak-pantas"],
                "description": "Penilaianmu atas maksud user.",
            },
            "tab": {
                "type": "string",
                "enum": ["semua", "kerja-cepat", "proyek"],
                "description": "Tab yang paling cocok.",
            },
            "kategori": {
                "type": "string",
                "enum": ALL_CATEGORIES,
                "description": "Kategori yang disebut user, harus dari daftar.",
            },
            "area": {"type": "string", "description": "Area yang disebut user."},
            "hargaMaks": {
                "type": "integer",
                "description": "Batas atas harga dalam rupiah, kalau disebut user.",
            },
        },
        "required": ["intent"],
    },
}


def allowed_areas(raw) -> list:
    if not isinstance(raw, list):
        return []
    return [text_field(item, 60) for item in raw[:MAX_AREAS] if text_field(item, 60)]


def build_filters(result: dict, areas: list) -> dict:
    kategori = result.get("kategori")
    kategori = kategori if kategori in ALL_CATEGORIES else ""

    # Tab diturunkan dari kategori kalau keduanya bentrok. Kategori Desain Grafis di tab
    # Kerja Cepat tidak akan pernah cocok dengan apa pun.
    tab = type_of_category(kategori) if kategori else result.get("tab")
    if tab not in ("semua", "kerja-cepat", "proyek"):
        tab = ""

    area = text_field(result.get("area"), 60)
    harga = result.get("hargaMaks")
    valid_harga = isinstance(harga, int) and not isinstance(harga, bool) and 0 < harga <= MAX_HARGA

    return {
        "tab": tab,
        "kategori": kategori,
        # Area yang tidak ada di feed dibuang, karena memasangnya cuma menghasilkan
        # daftar kosong yang terlihat seperti fitur rusak.
        "area": area if area in areas else "",
        "hargaMaks": harga if valid_harga else None,
    }


class handler(JsonHandler):
    def handle_json(self, body: dict):
        try:
            authorize(self.headers)
            text = clean_text(body.get("text"))
            areas = allowed_areas(body.get("areas"))
            result = call_claude(
                SYSTEM.format(
                    kerja_cepat=", ".join(KERJA_CEPAT_CATEGORIES),
                    proyek=", ".join(PROYEK_CATEGORIES),
                    areas=", ".join(areas) if areas else "(belum ada area di feed)",
                ),
                text,
                TOOL,
                max_tokens=300,
            )
        except LlmError as error:
            return error.status, {"error": error.message}

        # Lapis penjaga kedua, ditegakkan kode. Lihat catatan yang sama di draft-brief.py.
        intent = result.get("intent")
        if intent == "tidak-pantas":
            return 422, {"error": "Pencarian itu tidak bisa dibantu di sini."}
        if intent != "cari-kerja":
            return 422, {"error": "Coba tulis pekerjaan seperti apa yang kamu cari."}

        return 200, build_filters(result, areas)
