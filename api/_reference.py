"""Cermin dari daftar kategori di `src/data/reference.ts`.

Dua daftar ini harus tetap sama isinya dengan yang di frontend. Kalau kategori ditambah di
satu sisi saja, model masih boleh mengusulkannya tapi form akan menolaknya, atau sebaliknya.
"""

KERJA_CEPAT_CATEGORIES = [
    "Antar & Ambil",
    "Titip Beli",
    "Pindah Barang",
    "Bantu Acara",
    "Cetak & Fotokopi",
]

PROYEK_CATEGORIES = [
    "Desain Grafis",
    "Video & Motion",
    "Coding & Web",
    "Data & Riset",
    "Copywriting",
    "Sosial Media",
]

ALL_CATEGORIES = KERJA_CEPAT_CATEGORIES + PROYEK_CATEGORIES


def type_of_category(category: str):
    """Jenis pekerjaan yang memiliki kategori ini, atau None kalau kategorinya tidak dikenal."""
    if category in KERJA_CEPAT_CATEGORIES:
        return "kerja-cepat"
    if category in PROYEK_CATEGORIES:
        return "proyek"
    return None
