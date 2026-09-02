"""POST /api/extract-cv

Body-nya file PDF mentah, bukan multipart, supaya tidak perlu parser tambahan.
Balasannya {"skills": [...], "campus", "faculty", "major", "year"}.

Tidak ada rahasia apa pun di sini, jadi boleh dipanggil langsung dari browser. Yang
memegang API key cuma /api/parse-search nanti, dan itu urusan Search Assistant.
"""

import json
from http.server import BaseHTTPRequestHandler

from _extractor import extract_profile_from_pdf

MAX_BYTES = 4 * 1024 * 1024


class handler(BaseHTTPRequestHandler):
    def _send(self, status: int, payload: dict):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self._send(204, {})

    def do_POST(self):
        length = int(self.headers.get("Content-Length") or 0)
        if length <= 0:
            self._send(400, {"error": "File CV tidak terkirim."})
            return
        if length > MAX_BYTES:
            self._send(413, {"error": "Ukuran file maksimal 4 MB."})
            return

        data = self.rfile.read(length)
        if not data.startswith(b"%PDF"):
            self._send(415, {"error": "File harus berformat PDF."})
            return

        try:
            profile = extract_profile_from_pdf(data)
        except Exception:
            # Pesan errornya sengaja tidak dibocorkan ke browser, cuma dicatat di log server.
            self._send(500, {"error": "CV gagal dibaca. Coba file lain atau isi manual."})
            return

        self._send(200, profile)
