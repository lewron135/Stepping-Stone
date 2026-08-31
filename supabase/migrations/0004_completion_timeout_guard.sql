-- Migrasi 4/4: pagar batas 2 hari di sisi server
--
-- Sesuai masterplan bagian 11.2, batas 2 hari dihitung saat halaman dibuka, bukan cron job.
-- Artinya yang memanggil `close_without_confirmation` adalah browser klien. Kalau syarat 2
-- hari cuma dicek di frontend, klien yang nakal bisa memanggil RPC itu lebih awal lewat
-- console dan menutup kesepakatan tanpa memberi rating maupun testimoni ke pekerja.
--
-- Trigger ini menutup celah itu di level tabel, jadi berlaku apapun isi RPC-nya. Kalau RPC
-- ternyata sudah memvalidasi sendiri, trigger ini cuma jadi lapis kedua yang tidak berefek.

create or replace function trg_agreement_timeout_guard()
returns trigger as $$
declare
  v_submitted_at timestamptz;
begin
  if new.status = 'completed-unconfirmed'
     and old.status is distinct from 'completed-unconfirmed' then

    if old.status <> 'waiting-confirmation' then
      raise exception 'Kesepakatan belum menunggu konfirmasi, tidak bisa ditutup tanpa konfirmasi';
    end if;

    v_submitted_at := (old.proof ->> 'submittedAt')::timestamptz;

    if v_submitted_at is null then
      raise exception 'Bukti kerja belum ada, tidak bisa ditutup tanpa konfirmasi';
    end if;

    if now() - v_submitted_at < interval '2 days' then
      raise exception 'Batas 2 hari konfirmasi belum terlewat';
    end if;
  end if;

  return new;
end;
$$ language plpgsql;

drop trigger if exists agreement_timeout_guard on agreements;
create trigger agreement_timeout_guard
before update on agreements
for each row execute function trg_agreement_timeout_guard();
