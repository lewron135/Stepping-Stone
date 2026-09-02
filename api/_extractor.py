"""Ekstraksi skill dari CV.

Port ringan dari lewron135/Semantic_CV_Analyzer supaya bisa jalan sebagai serverless
function. Yang berubah dari aslinya cuma mesin penghitung kemiripan: SBERT
(all-MiniLM-L6-v2) diganti word vector bawaan spaCy en_core_web_md. Alasannya SBERT
menyeret torch yang ukurannya jauh melewati batas 250 MB satu function di Vercel.

Yang TIDAK berubah: daftar istilah yang dikunci, cara noun chunk diambil, dan gagasan
filter relevansi yang membandingkan tiap frasa ke dua kelompok anchor. Ambang batasnya
diturunkan karena skala kemiripan word vector rata-rata memang lebih tinggi daripada
cosine similarity SBERT.

File CV tidak pernah ditulis ke disk. Teksnya hidup di memori selama satu request saja.
"""

import re
import unicodedata
from functools import lru_cache

import spacy

# Sama persis dengan TECH_TERM_LOCK di src/extraction/engine.py, ditambah istilah yang
# relevan untuk kategori Stepping Stone di luar dunia coding (desain, copywriting, data).
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

TECHNICAL_ANCHORS = [
    "programming language skill",
    "machine learning algorithm",
    "data analysis and visualization tool",
    "database management system",
    "software development framework",
    "computer science fundamental",
    "cloud infrastructure platform",
    "API design and integration",
    "statistical modeling technique",
    "version control system",
    "deep learning neural network",
    "software engineering methodology",
    "graphic design and illustration tool",
    "writing and content creation skill",
]

ADMINISTRATIVE_ANCHORS = [
    "employee benefit and compensation",
    "work schedule and time off",
    "office location and remote work policy",
    "salary range and pay",
    "health insurance and medical coverage",
    "employment terms and conditions",
    "company policy and compliance",
    "job perks and incentives",
    "equal opportunity employment statement",
    "background check requirement",
    "personal contact information",
    "date of birth and address",
]

TECH_THRESHOLD = 0.42
MAX_SKILLS = 30

_MULTI_SPACE = re.compile(r" {2,}")
_ARTIFACTS = [
    ("’", "'"), ("‘", "'"), ("“", '"'), ("”", '"'),
    ("–", "-"), ("—", "-"), ("•", " "), ("·", " "),
    ("ﬁ", "fi"), ("ﬂ", "fl"), ("ﬃ", "ffi"), ("ﬄ", "ffl"),
    (" ", " "), ("​", ""), ("﻿", ""),
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


@lru_cache(maxsize=1)
def load_nlp():
    nlp = spacy.load("en_core_web_md")
    if "entity_ruler" not in nlp.pipe_names:
        ruler = nlp.add_pipe("entity_ruler", before="ner")
        ruler.add_patterns([
            {
                "label": "SKILL",
                "pattern": [{"LOWER": token.lower()} for token in term.split()],
                "id": term,
            }
            for term in TECH_TERM_LOCK
        ])
    return nlp


@lru_cache(maxsize=1)
def anchor_docs():
    nlp = load_nlp()
    tech = [nlp(text) for text in TECHNICAL_ANCHORS]
    admin = [nlp(text) for text in ADMINISTRATIVE_ANCHORS]
    return tech, admin


def semantic_relevance_filter(phrases: set, nlp) -> set:
    """Versi filters.semantic_relevance_filter yang memakai word vector spaCy.

    Frasa yang lebih dekat ke kelompok administratif dibuang, sama seperti aslinya.
    Frasa tanpa vector sama sekali juga dibuang, karena itu tanda kata asing yang
    tidak dikenal model dan hampir selalu sampah hasil pembacaan PDF.
    """
    if not phrases:
        return set()

    tech_docs, admin_docs = anchor_docs()
    kept = set()

    for phrase in phrases:
        doc = nlp(phrase)
        if not doc.has_vector or doc.vector_norm == 0:
            continue
        max_tech = max(doc.similarity(anchor) for anchor in tech_docs)
        max_admin = max(doc.similarity(anchor) for anchor in admin_docs)
        if max_tech >= TECH_THRESHOLD and max_tech > max_admin:
            kept.add(phrase)

    return kept


def _chunk_text(chunk) -> str:
    """Buang kata sandang di depan noun chunk, supaya "a REST API" jadi "REST API"."""
    tokens = list(chunk)
    while tokens and tokens[0].pos_ in {"DET", "PRON", "ADJ"} and tokens[0].is_stop:
        tokens = tokens[1:]
    return " ".join(token.text for token in tokens).strip()


# Hampir semua CV punya bagian daftar skill dengan pola "Label: item, item, item".
# Bagian itu sinyal paling akurat yang ada di dokumen, jauh lebih bersih daripada menebak
# lewat noun chunk, jadi isinya diambil apa adanya tanpa ikut disaring.
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
        for piece in re.split(r"[,;|/]| \u2022 ", body):
            item = piece.strip(" .\t")
            if not item or len(item) < 2 or len(item) > 40:
                continue
            if _NOISE_ITEM.search(item) or len(item.split()) > 4:
                continue
            found.append(item)
    return found


def extract_features(doc, nlp) -> set:
    """Sama seperti engine.extract_features: entitas terkunci digabung noun chunk."""
    locked = {term.lower() for term in TECH_TERM_LOCK}

    # Rentang teks yang dikenali sebagai nama orang dibuang lebih dulu. Tanpa ini, baris nama
    # di kepala CV ikut terbaca sebagai frasa dan lolos jadi "skill".
    person_spans = [
        (ent.start, ent.end) for ent in doc.ents if ent.label_ in {"PERSON", "GPE", "LOC"}
    ]

    def touches_person(span) -> bool:
        return any(span.start < end and start < span.end for start, end in person_spans)

    entities = {
        ent.text.strip()
        for ent in doc.ents
        if ent.label_ in {"SKILL", "PRODUCT", "WORK_OF_ART"} and len(ent.text.strip()) > 1
    }
    chunks = set()
    for chunk in doc.noun_chunks:
        if touches_person(chunk):
            continue
        text = _chunk_text(chunk)
        words = text.split()
        if len(words) < 2 or len(words) > 4 or len(text) <= 3 or text.isdigit():
            continue
        if "'s" in text or _NOISE_ITEM.search(text):
            continue
        if chunk.root.is_stop:
            continue
        chunks.add(text)

    # Istilah yang memang ada di daftar kunci tidak perlu ikut disaring, dia sudah pasti skill.
    certain = {item for item in entities if item.lower() in locked}
    uncertain = (entities | chunks) - certain

    # Frasa yang cuma membungkus istilah terkunci dengan kata lain ("SKILLS Python") dibuang,
    # karena versi bersihnya sudah pasti ikut terambil.
    def wraps_locked(phrase: str) -> bool:
        lowered = phrase.lower()
        return any(
            term != lowered and re.search(rf"\b{re.escape(term)}\b", lowered)
            for term in locked
        )

    uncertain = {phrase for phrase in uncertain if not wraps_locked(phrase)}

    return certain | semantic_relevance_filter(uncertain, nlp)


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
# Detail pendidikan. Dibaca dengan pola, bukan ditebak model, karena bagian ini di CV
# hampir selalu ditulis dengan format yang seragam. Hasilnya tetap cuma usulan: yang
# menyimpan ke profil adalah user lewat form, bukan fungsi ini.
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


def extract_skills_from_text(text: str) -> list:
    # Bagian daftar skill dibaca dari teks asli, sebelum pdf_clean menggabung baris, karena
    # polanya justru bergantung pada satu baris satu label.
    section_skills = skills_from_sections(normalize_encoding(text))

    cleaned = pdf_clean(text)
    if not cleaned:
        return dedupe(section_skills)[:MAX_SKILLS]

    nlp = load_nlp()
    doc = nlp(cleaned[:120_000])
    found = extract_features(doc, nlp)

    locked = {term.lower() for term in TECH_TERM_LOCK}
    certain = sorted(
        (item for item in found if item.lower() in locked),
        key=lambda item: item.lower(),
    )
    guessed = sorted(
        (item for item in found if item.lower() not in locked),
        key=lambda item: item.lower(),
    )

    # Yang paling bisa dipercaya ditaruh duluan supaya kalau kena batas MAX_SKILLS, yang
    # terpotong adalah tebakan, bukan skill yang jelas tertulis di CV.
    return dedupe([*section_skills, *certain, *guessed])[:MAX_SKILLS]


def extract_profile_from_text(text: str) -> dict:
    normalized = normalize_encoding(text)
    skills = extract_skills_from_text(text)
    education = extract_education(normalized)
    return {**education, "skills": skills}


def extract_profile_from_pdf(data: bytes) -> dict:
    from io import BytesIO
    from pypdf import PdfReader

    reader = PdfReader(BytesIO(data))
    pages = [page.extract_text() or "" for page in reader.pages[:10]]
    return extract_profile_from_text("\n".join(pages))
