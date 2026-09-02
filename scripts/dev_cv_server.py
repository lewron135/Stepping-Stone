"""Server lokal untuk menguji ekstraksi CV tanpa perlu deploy ke Vercel.

Menjalankan handler yang sama persis dengan api/extract-cv.py, jadi tidak ada logika
yang ditulis dua kali. Jalankan dengan: python3 scripts/dev_cv_server.py
Lalu set VITE_CV_EXTRACT_URL=http://localhost:8787/api/extract-cv di .env
"""

import sys
from http.server import HTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "api"))

import importlib.util

spec = importlib.util.spec_from_file_location("extract_cv", ROOT / "api" / "extract-cv.py")
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

if __name__ == "__main__":
    port = 8787
    print(f"Ekstraksi CV siap di http://localhost:{port}/api/extract-cv")
    print("Tekan Ctrl+C untuk berhenti.")
    HTTPServer(("127.0.0.1", port), module.handler).serve_forever()
