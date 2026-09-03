"""Server lokal untuk menguji seluruh folder api/ tanpa perlu deploy ke Vercel.

Menjalankan handler yang sama persis dengan yang nanti dijalankan Vercel, jadi tidak ada
logika yang ditulis dua kali. Menggantikan scripts/dev_cv_server.py yang cuma melayani satu
rute.

Jalankan dengan: python3 scripts/dev_api_server.py
Lalu di .env isi:
  VITE_CV_EXTRACT_URL=http://localhost:8787/api/extract-cv
  VITE_AI_BASE_URL=http://localhost:8787
"""

import importlib.util
import os
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "api"))

PORT = 8787


def load_env(path: Path):
    """Memuat .env ke os.environ supaya handler menemukan key seperti saat di Vercel."""
    if not path.exists():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        name, value = line.split("=", 1)
        os.environ.setdefault(name.strip(), value.strip())


def load_route(filename: str):
    """Memuat satu file rute. Namanya bertanda hubung, jadi tidak bisa diimpor biasa."""
    spec = importlib.util.spec_from_file_location(filename.replace("-", "_"), ROOT / "api" / filename)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module.handler


load_env(ROOT / ".env")

ROUTES = {
    "/api/extract-cv": load_route("extract-cv.py"),
    "/api/draft-brief": load_route("draft-brief.py"),
    "/api/parse-search": load_route("parse-search.py"),
}


class Router(BaseHTTPRequestHandler):
    def _delegate(self, method: str):
        target_class = ROUTES.get(self.path.split("?")[0])
        if target_class is None:
            self.send_error(404, "Rute tidak dikenal")
            return
        # Handler Vercel adalah kelas BaseHTTPRequestHandler yang seluruh kerjanya bergantung
        # pada atribut instance: rfile, wfile, headers, path. Membuat instance tanpa __init__
        # lalu meminjamkan atribut milik router ini membuat yang dijalankan benar-benar handler
        # produksi, bukan tiruannya.
        target = target_class.__new__(target_class)
        target.__dict__.update(self.__dict__)
        getattr(target, method)()

    def do_POST(self):
        self._delegate("do_POST")

    def do_OPTIONS(self):
        self._delegate("do_OPTIONS")


if __name__ == "__main__":
    for path in ROUTES:
        print(f"siap  http://localhost:{PORT}{path}")
    if not os.environ.get("ANTHROPIC_API_KEY"):
        print("catatan: ANTHROPIC_API_KEY belum ada, dua rute asisten akan membalas 503.")
    print("Tekan Ctrl+C untuk berhenti.")
    ThreadingHTTPServer(("127.0.0.1", PORT), Router).serve_forever()
