import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Tanpa penjagaan ini, `.env` yang belum diisi bikin createClient melempar "supabaseUrl is
// required" jauh di dalam pustaka, dan yang terlihat cuma layar putih. Pesannya diarahkan ke
// penyebab yang sebenarnya, karena inilah yang pertama menimpa siapa pun yang baru clone repo.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY belum diisi. ' +
    'Salin .env.example jadi .env, isi keduanya dari Supabase Dashboard (Project Settings > API), ' +
    'lalu jalankan ulang dev server.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
