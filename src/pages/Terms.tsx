import React from 'react';

const SECTIONS = [
{
  title: 'Peran Stepping Stone',
  body: 'Stepping Stone adalah forum kerja antar mahasiswa. Kami mencatat kesepakatan, bukan memproses pembayaran. Tidak ada rekening bersama, escrow, maupun gerbang pembayaran di dalam aplikasi.'
},
{
  title: 'Kesepakatan terkunci',
  body: 'Kesepakatan menjadi terkunci setelah klien dan pekerja menekan Setuju. Setelah terkunci, harga dan tenggat tidak dapat diubah. Kedua pihak tercatat, dan pembatalan meninggalkan jejak permanen pada track record.'
},
{
  title: 'Pembayaran',
  body: 'Pembayaran dilakukan langsung antara klien dan pekerja. Biaya admin yang tampil pada rincian transaksi hanya catatan kesepakatan. Pekerjaan yang tidak dibayar dapat dilaporkan, dan laporan tersebut tampil permanen pada track record klien.'
},
{
  title: 'Konfirmasi dan testimoni',
  body: 'Klien memiliki waktu dua hari untuk mengonfirmasi hasil kerja, memberi rating, dan menulis testimoni. Tanpa respons, pekerjaan ditandai Selesai (Belum Dikonfirmasi), tetap masuk track record, tanpa rating maupun testimoni.'
},
{
  title: 'Batasan pekerjaan',
  body: 'Pekerjaan akademik yang menggantikan tugas atau ujian tidak diizinkan. Pekerjaan data dan analisis hanya untuk kebutuhan nyata seperti UMKM, komunitas, atau kegiatan kampus.'
},
{
  title: 'Data dan privasi',
  body: 'Profil publik hanya menampilkan nama, informasi akademik, portofolio, testimoni, dan track record. Nomor telepon, lokasi presisi, dan data pribadi lain tidak ditampilkan. File CV yang diunggah ke Career Compass dihapus segera setelah skill diambil.'
},
{
  title: 'Sengketa',
  body: 'Sengketa diselesaikan antara kedua pihak. Stepping Stone tidak memutuskan sengketa secara otomatis; kami hanya menampilkan fakta aktivitas seperti jumlah pekerjaan selesai, batal, dan laporan tidak dibayar.'
}];


export function Terms() {
  return (
    <div className="max-w-2xl py-6">
      <h1 className="text-[24px] font-bold tracking-tightest text-ink sm:text-[30px]">
        Syarat &amp; Ketentuan
      </h1>
      <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">
        Ringkas dan apa adanya, supaya semua pihak tahu batasannya sebelum kesepakatan dikunci.
      </p>

      <div className="mt-8 divide-y divide-line border-y border-line">
        {SECTIONS.map((section, index) =>
        <section key={section.title} className="flex gap-4 py-5">
            <span className="w-6 shrink-0 text-[12px] font-bold tabular-nums text-faint">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div>
              <h2 className="text-[15px] font-bold tracking-tight text-ink">{section.title}</h2>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">{section.body}</p>
            </div>
          </section>
        )}
      </div>
    </div>);

}