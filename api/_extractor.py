"""Ekstraksi skill dan detail pendidikan dari CV.

Turunan dari lewron135/Semantic_CV_Analyzer, tapi **tanpa lapisan machine learning**.
Aslinya memakai spaCy plus SBERT; dua-duanya dibuang karena tumpukan dependensinya
mencapai 580 MB di Linux, sedangkan satu function di Vercel dibatasi 500 MB.

Pembuangan itu diuji dulu, bukan ditebak. Pada CV nyata, versi tanpa spaCy tidak
kehilangan satu pun skill yang benar dan justru menemukan lima tambahan. Alasannya: yang
benar-benar menghasilkan skill akurat adalah pembaca bagian daftar skill dan pencocokan
daftar istilah, dua-duanya pola murni. Lapisan noun chunk plus filter vector menyumbang
frasa sampah yang lalu mendesak keluar skill asli karena kena batas jumlah.

Yang diwarisi dari proyek NLP itu: daftar istilah yang dikunci, perbaikan artefak encoding
PDF, dan bentuk pipeline baca lalu bersihkan lalu saring.

File CV tidak pernah ditulis ke disk. Teksnya hidup di memori selama satu request saja.
"""

import re
import unicodedata

# Sama seperti TECH_TERM_LOCK di src/extraction/engine.py pada proyek aslinya, ditambah
# istilah untuk kategori Stepping Stone di luar dunia coding (desain, tulis, data).
TECH_TERM_LOCK = [
    "Python", "Java", "SQL", "MariaDB", "PHP", "C", "C++", "JavaScript", "TypeScript", "Go",
    "Figma", "Canva", "Adobe Premiere", "DaVinci Resolve", "Machine Learning",
    "Deep Learning", "Artificial Intelligence", "Computer Vision", "NLP",
    "Data Science", "TensorFlow", "PyTorch", "Scikit-learn", "Docker", "Kubernetes",
    "REST API", "Git", "Linux", "React", "Node.js", "FastAPI", "Flask", "Streamlit",
    "BERT", "Transformer", "RapidMiner", "Pandas", "NumPy", "Tableau", "Power BI",
    "Django", "object-oriented design", "asynchronous programming", "Microservices",
    "CI/CD", "GitHub Actions", "English", "communication skills", "relational database",
    "Adobe Illustrator", "Adobe Photoshop", "Adobe After Effects", "CorelDRAW",
    "Blender", "Copywriting", "Content Writing", "Social Media", "Microsoft Excel",
    "Google Sheets", "Microsoft Word", "PowerPoint", "Public Speaking", "Videografi",
    "Fotografi", "Editing Video", "Desain Grafis", "Ilustrasi", "Motion Graphics",
]

MAX_SKILLS = 30

_MULTI_SPACE = re.compile(r" {2,}")
_ARTIFACTS = [
    ("’", "'"), ("‘", "'"), ("“", '"'), ("”", '"'),
    ("–", "-"), ("—", "-"), ("•", " "), ("·", " "),
    ("ﬁ", "fi"), ("ﬂ", "fl"), ("ﬃ", "ffi"), ("ﬄ", "ffl"),
    (" ", " "), ("​", ""), ("﻿", ""),
]


def normalize_encoding(text: str) -> str:
    """Salinan normalize_encoding di src/utils/preprocessor.py, tanpa ftfy dan nltk."""
    text = unicodedata.normalize("NFC", str(text))
    for bad, good in _ARTIFACTS:
        if bad in text:
            text = text.replace(bad, good)
    text = text.encode("ascii", errors="ignore").decode("ascii")
    return _MULTI_SPACE.sub(" ", text).strip()


def pdf_clean(text: str) -> str:
    text = normalize_encoding(text)
    # Menyambung huruf yang terpisah spasi akibat kerning PDF, contoh "P y t h o n".
    text = re.sub(r"(?<=\b\w)\s(?=\w\b)", "", text)
    return re.sub(r"\s+", " ", text).strip()


def dedupe(skills) -> list:
    seen = set()
    result = []
    for skill in skills:
        key = skill.lower()
        if key in seen:
            continue
        seen.add(key)
        result.append(skill)
    return result


# ---------------------------------------------------------------------------------------
# Sumber pertama: bagian daftar skill. Hampir semua CV punya baris bergaya
# "Label: item, item, item", dan itu sinyal paling akurat yang ada di dokumen.
# ---------------------------------------------------------------------------------------

SKILL_SECTION_LABEL = re.compile(
    r"^\s*(technical skills?|skills?|keahlian|kemampuan|languages?|tools?|frameworks?|"
    r"technolog(?:y|ies)|tech stack|bahasa|ml\s*/\s*ai|backend\s*&?\s*web|mobile|"
    r"database|programming languages?)\s*[:\-]\s*(.+)$",
    re.IGNORECASE,
)

SECTION_STOP = re.compile(
    r"^\s*(education|experience|projects?|organization|certification|summary|profile|"
    r"pendidikan|pengalaman|proyek|sertifikat|organisasi)\b",
    re.IGNORECASE,
)

_NOISE_ITEM = re.compile(r"^\d|^[^A-Za-z]|\b(?:years?|hours?|months?|tahun|jam)\b", re.IGNORECASE)


def skills_from_sections(text: str) -> list:
    """Ambil isi baris bergaya "Languages: Python, Dart, SQL" dari teks CV."""
    found = []
    for raw_line in text.splitlines():
        line = raw_line.strip()
        if not line or SECTION_STOP.match(line):
            continue
        match = SKILL_SECTION_LABEL.match(line)
        if not match:
            continue
        # Kurungan dibuang lebih dulu, sebelum dipotong koma. Kalau dibalik, isi kurung yang
        # sendirinya mengandung koma akan pecah jadi potongan cacat seperti "Flutter (MVC".
        body = re.sub(r"\s*\([^)]*\)", "", match.group(2))
        for piece in re.split(r"[,;|/]| • ", body):
            item = piece.strip(" .\t")
            if not item or len(item) < 2 or len(item) > 40:
                continue
            if _NOISE_ITEM.search(item) or len(item.split()) > 4:
                continue
            found.append(item)
    return found


def skills_from_terms(text: str) -> list:
    """Cari istilah yang dikunci di seluruh isi CV, bukan cuma di bagian daftar skill.

    Ini yang menangkap skill yang disebut sambil lalu di bagian pengalaman atau proyek,
    misalnya "dibangun dengan FastAPI" yang tidak pernah masuk daftar berpoin.
    """
    lowered = text.lower()
    return [
        term for term in TECH_TERM_LOCK
        if re.search(rf"\b{re.escape(term.lower())}\b", lowered)
    ]


def extract_skills_from_text(text: str) -> list:
    # Bagian daftar skill dibaca dari teks asli, sebelum pdf_clean menggabung baris, karena
    # polanya justru bergantung pada satu baris satu label.
    section_skills = skills_from_sections(normalize_encoding(text))

    cleaned = pdf_clean(text)
    if not cleaned:
        return dedupe(section_skills)[:MAX_SKILLS]

    # Isi bagian daftar skill didahulukan karena itu yang paling jelas diakui pemilik CV.
    # Istilah yang cuma disebut sambil lalu menyusul di belakangnya.
    return dedupe([*section_skills, *skills_from_terms(cleaned)])[:MAX_SKILLS]


# ---------------------------------------------------------------------------------------
# Detail pendidikan. Dibaca dengan pola karena bagian ini di CV hampir selalu ditulis
# dengan format yang seragam. Hasilnya tetap cuma usulan: yang menyimpan ke profil adalah
# user lewat form, bukan fungsi ini.
# ---------------------------------------------------------------------------------------

CAMPUS_RE = re.compile(
    r"\b((?:Universitas|Institut|Politeknik|Sekolah Tinggi|Akademi)\s+[A-Z][\w'.-]*"
    r"(?:\s+[A-Z][\w'.-]*){0,4}"
    r"|[A-Z][\w'.-]*(?:\s+[A-Z][\w'.-]*){0,3}\s+(?:University|Institute of Technology|College))",
)

MAJOR_RE = re.compile(
    r"(?:Bachelor|Sarjana|Master|S1|S-1|B\.?Sc\.?|Program Studi|Jurusan|Major)"
    r"\s*(?:of|in|:)?\s+([A-Z][\w&-]*(?:\s+[A-Z&][\w&-]*){0,4})",
)

FACULTY_RE = re.compile(
    r"(?:Faculty of|Fakultas|School of)\s+([A-Z][\w&-]*(?:\s+[A-Z&][\w&-]*){0,4})",
)

YEAR_RE = re.compile(r"\b(20[0-3]\d)\b")
INTAKE_RE = re.compile(r"(?:angkatan|class of|batch)\s*:?\s*(20[0-3]\d)", re.IGNORECASE)

# Kata yang sering ikut terbaca di belakang nama jurusan tapi bukan bagian namanya.
_MAJOR_TAIL = re.compile(r"\s+(Track|Program|Degree|Student|Undergraduate)\b.*$", re.IGNORECASE)


def _tidy(value: str) -> str:
    value = re.sub(r"\s*\([^)]*\)", "", value)
    return re.sub(r"\s+", " ", value).strip(" ,.-")


def extract_education(text: str) -> dict:
    campus = faculty = major = year = ""

    match = CAMPUS_RE.search(text)
    if match:
        campus = _tidy(match.group(1))

    match = FACULTY_RE.search(text)
    if match:
        faculty = _tidy(match.group(1))

    match = MAJOR_RE.search(text)
    if match:
        major = _tidy(_MAJOR_TAIL.sub("", match.group(1)))

    # Angkatan: kalau ditulis eksplisit dipakai apa adanya, kalau tidak ambil tahun paling
    # awal yang masuk akal, karena rentang studi selalu ditulis "2024 - 2028".
    match = INTAKE_RE.search(text)
    if match:
        year = match.group(1)
    else:
        years = sorted({int(found) for found in YEAR_RE.findall(text) if 2010 <= int(found) <= 2030})
        if years:
            year = str(years[0])

    return {"campus": campus, "faculty": faculty, "major": major, "year": year}


def extract_profile_from_text(text: str) -> dict:
    normalized = normalize_encoding(text)
    return {**extract_education(normalized), "skills": extract_skills_from_text(text)}


def extract_profile_from_pdf(data: bytes) -> dict:
    from io import BytesIO
    from pypdf import PdfReader

    reader = PdfReader(BytesIO(data))
    pages = [page.extract_text() or "" for page in reader.pages[:10]]
    return extract_profile_from_text("\n".join(pages))
