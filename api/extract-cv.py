"""POST /api/extract-cv

Body-nya file PDF mentah, bukan multipart, supaya tidak perlu parser tambahan.
Balasannya {"skills": [...], "campus", "faculty", "major", "year"}.

Tidak ada API key di sini, tapi tetap butuh sesi Supabase yang sah. Membaca PDF sampai
10 halaman itu pekerjaan CPU dengan batas 60 detik, dan endpoint terbuka berarti siapa pun
yang menemukan alamatnya bisa menyuruhnya bekerja berulang kali tanpa punya akun. Formulir
yang memanggilnya pun cuma hidup di halaman Profil yang sudah di balik login, jadi tidak
ada alur sah yang ikut tertutup.
"""

import json
import os
import sys
from http.server import BaseHTTPRequestHandler

# Folder function ikut dimasukkan ke jalur impor supaya `_extractor` tetap ketemu, apa pun
# direktori kerja yang dipakai runtime Vercel saat menjalankan file ini.
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from _extractor import extract_profile_from_pdf  # noqa: E402
from _llm import LlmError, authorize  # noqa: E402

MAX_BYTES = 4 * 1024 * 1024


class handler(BaseHTTPRequestHandler):
    def _send(self, status: int, payload: dict):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        # 204 tidak boleh punya body. Sebelumnya balasan ini menyertakan "{}" beserta
        # Content-Length, dan browser menolak preflight seperti itu sehingga POST-nya tidak
        # pernah terkirim. Curl tidak rewel soal ini, jadi bugnya cuma terlihat dari browser.
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Max-Age", "86400")
        self.end_headers()

    def do_POST(self):
        # Penjaga yang sama persis dengan dua asisten: harus punya sesi, dan harus di bawah
        # batas pemakaian. Ditaruh paling awal supaya body-nya tidak sempat dibaca, apalagi
        # diurai, oleh pemanggil yang tidak berhak.
        try:
            authorize(self.headers)
        except LlmError as error:
            self._send(error.status, {"error": error.message})
            return

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
