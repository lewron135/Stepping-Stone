"""Kelas dasar untuk function JSON di folder ini.

`api/extract-cv.py` sengaja tidak dipindahkan ke kelas ini walau `_send`-nya jadi kembar.
Kodenya sudah terbukti jalan di produksi, dan menukarnya menjelang tenggat submit bukan
pertukaran yang bagus. Dirapikan setelah lomba.
"""

import json
from http.server import BaseHTTPRequestHandler

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
}


class JsonHandler(BaseHTTPRequestHandler):
    """Membaca body JSON, menyerahkannya ke `handle_json`, lalu membalas JSON.

    Turunannya cuma perlu mengisi `handle_json` dan mengembalikan `(status, payload)`.
    """

    max_body_bytes = 16 * 1024

    def send_json(self, status: int, payload: dict):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        for name, value in CORS.items():
            self.send_header(name, value)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        # 204 tidak boleh punya body. Preflight dengan Content-Length ditolak browser,
        # dan itu bug yang cuma kelihatan dari browser, tidak dari curl.
        self.send_response(204)
        for name, value in CORS.items():
            self.send_header(name, value)
        self.send_header("Access-Control-Max-Age", "86400")
        self.end_headers()

    def do_POST(self):
        length = int(self.headers.get("Content-Length") or 0)
        if length <= 0:
            self.send_json(400, {"error": "Permintaan kosong."})
            return
        if length > self.max_body_bytes:
            self.send_json(413, {"error": "Permintaan terlalu besar."})
            return

        try:
            body = json.loads(self.rfile.read(length).decode("utf-8"))
        except (ValueError, UnicodeDecodeError):
            self.send_json(400, {"error": "Body harus JSON yang sah."})
            return
        if not isinstance(body, dict):
            self.send_json(400, {"error": "Body harus objek JSON."})
            return

        status, payload = self.handle_json(body)
        self.send_json(status, payload)

    def handle_json(self, body: dict):
        raise NotImplementedError
