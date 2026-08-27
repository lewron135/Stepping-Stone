export const manifest = {
  screens: {
    scr_qsl5jk: { name: "Landing", route: "/", position: { "x": 160, "y": 220 }, viewport: { width: 375, height: 667 } },
    scr_83el2s: { name: "Beranda", route: "/home", position: { "x": 160, "y": 2200 }, viewport: { width: 375, height: 667 } },
    scr_iy8e2j: { name: "Kerja Cepat", route: "/kerja-cepat", position: { "x": 1560, "y": 2200 }, viewport: { width: 375, height: 667 } },
    scr_ul0hud: { name: "Proyek", route: "/proyek", position: { "x": 2960, "y": 2200 }, viewport: { width: 375, height: 667 } },
    scr_zh2f7g: { name: "Detail Proyek", route: "/pekerjaan/pr1", position: { "x": 160, "y": 4180 }, viewport: { width: 375, height: 667 } },
    scr_fnpq76: { name: "Detail Kerja Cepat", route: "/pekerjaan/kc1", position: { "x": 1560, "y": 4180 }, viewport: { width: 375, height: 667 } },
    scr_bmnd6v: { name: "Pasang Pekerjaan", route: "/pasang-pekerjaan", position: { "x": 160, "y": 6160 }, viewport: { width: 375, height: 667 } },
    scr_31z95h: { name: "Daftar Chat", route: "/chat", position: { "x": 160, "y": 8140 }, viewport: { width: 375, height: 667 } },
    scr_7odnq1: { name: "Negosiasi Chat", route: "/chat/t1", position: { "x": 1560, "y": 8140 }, viewport: { width: 375, height: 667 } },
    scr_hipfb1: { name: "Menunggu Persetujuan", route: "/kesepakatan/a1", position: { "x": 160, "y": 10120 }, viewport: { width: 375, height: 667 } },
    scr_9mneor: { name: "Kesepakatan Terkunci", route: "/kesepakatan/a2", position: { "x": 1560, "y": 10120 }, viewport: { width: 375, height: 667 } },
    scr_143as5: { name: "Selesai & Testimoni", route: "/kesepakatan/a3", position: { "x": 2960, "y": 10120 }, viewport: { width: 375, height: 667 } },
    scr_947viu: { name: "Kesepakatan Batal", route: "/kesepakatan/a5", position: { "x": 4360, "y": 10120 }, viewport: { width: 375, height: 667 } },
    scr_jyfhr1: { name: "Aktivitas — Pekerja", route: "/aktivitas", state: { "perspective": "worker" }, position: { "x": 160, "y": 12100 }, viewport: { width: 375, height: 667 } },
    scr_bvpgis: { name: "Aktivitas — Klien", route: "/aktivitas", state: { "perspective": "client" }, position: { "x": 1560, "y": 12100 }, viewport: { width: 375, height: 667 } },
    scr_ggjt8g: { name: "Profil — Portfolio", route: "/profil", state: { "tab": "portfolio" }, position: { "x": 160, "y": 14080 }, viewport: { width: 375, height: 667 } },
    scr_l4lmbh: { name: "Profil — Track Record", route: "/profil", state: { "tab": "track-record" }, position: { "x": 1560, "y": 14080 }, viewport: { width: 375, height: 667 } },
    scr_774rq2: { name: "Profil Publik", route: "/u/fajarng", position: { "x": 2960, "y": 14080 }, viewport: { width: 375, height: 667 } },
    scr_8mdda6: { name: "Career Compass", route: "/career-compass", position: { "x": 1560, "y": 16060 }, viewport: { width: 375, height: 667 } },
    scr_k5czix: { name: "Settings", route: "/pengaturan", position: { "x": 160, "y": 16060 }, viewport: { width: 375, height: 667 } },
    scr_amdrkj: { name: "Syarat & Ketentuan", route: "/syarat-ketentuan", position: { "x": 2960, "y": 16060 }, viewport: { width: 375, height: 667 } }
  },
  sections: {
    sec_56vfk7: { name: "Onboarding", x: 0, y: 0, width: 1520, height: 1180 },
    sec_2dl4p4: { name: "Browse Jobs", x: 0, y: 1980, width: 4320, height: 1180 },
    sec_75czza: { name: "Job Details", x: 0, y: 3960, width: 2920, height: 1180 },
    sec_gnjxsf: { name: "Post a Job", x: 0, y: 5940, width: 1520, height: 1180 },
    sec_xpg4kk: { name: "Chat & Negotiation", x: 0, y: 7920, width: 2920, height: 1180 },
    sec_gqbn66: { name: "Deal Agreement Flow", x: 0, y: 9900, width: 5720, height: 1180 },
    sec_3s7nfy: { name: "Activity", x: 0, y: 11880, width: 2920, height: 1180 },
    sec_g5nhpi: { name: "Profile", x: 0, y: 13860, width: 4320, height: 1180 },
    sec_0ltdri: { name: "Settings & Info", x: 0, y: 15840, width: 4320, height: 1180 }
  },
  layers: [
  { kind: "section", id: "sec_56vfk7", children: [
    { kind: "screen", id: "scr_qsl5jk" }]
  },
  { kind: "section", id: "sec_2dl4p4", children: [
    { kind: "screen", id: "scr_83el2s" },
    { kind: "screen", id: "scr_iy8e2j" },
    { kind: "screen", id: "scr_ul0hud" }]
  },
  { kind: "section", id: "sec_75czza", children: [
    { kind: "screen", id: "scr_zh2f7g" },
    { kind: "screen", id: "scr_fnpq76" }]
  },
  { kind: "section", id: "sec_gnjxsf", children: [
    { kind: "screen", id: "scr_bmnd6v" }]
  },
  { kind: "section", id: "sec_xpg4kk", children: [
    { kind: "screen", id: "scr_31z95h" },
    { kind: "screen", id: "scr_7odnq1" }]
  },
  { kind: "section", id: "sec_gqbn66", children: [
    { kind: "screen", id: "scr_hipfb1" },
    { kind: "screen", id: "scr_9mneor" },
    { kind: "screen", id: "scr_143as5" },
    { kind: "screen", id: "scr_947viu" }]
  },
  { kind: "section", id: "sec_3s7nfy", children: [
    { kind: "screen", id: "scr_jyfhr1" },
    { kind: "screen", id: "scr_bvpgis" }]
  },
  { kind: "section", id: "sec_g5nhpi", children: [
    { kind: "screen", id: "scr_ggjt8g" },
    { kind: "screen", id: "scr_l4lmbh" },
    { kind: "screen", id: "scr_774rq2" }]
  },
  { kind: "section", id: "sec_0ltdri", children: [
    { kind: "screen", id: "scr_k5czix" },
    { kind: "screen", id: "scr_8mdda6" },
    { kind: "screen", id: "scr_amdrkj" }]
  }]

};