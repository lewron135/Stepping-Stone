-- Migrasi 3/4: trigger yang mengisi tabel notifications
--
-- Trigger bekerja di level tabel, jadi berlaku otomatis untuk perubahan data lewat RPC
-- manapun yang menyentuh tabel itu, tanpa perlu tahu isi fungsinya.
--
-- Semua fungsi di sini `security definer` supaya insert ke notifications melewati RLS
-- (tabel itu sengaja tidak punya policy insert untuk user biasa, lihat migrasi 0001).

-- Penawaran baru masuk: yang perlu tahu adalah pemasang pekerjaan.
create or replace function trg_offer_notify()
returns trigger as $$
declare
  v_job jobs;
begin
  select * into v_job from jobs where id = new.job_id;
  if v_job.id is null then
    return new;
  end if;

  insert into notifications (user_id, type, text, href)
  values (
    v_job.poster_id,
    'offer_received',
    'Ada yang tertarik nih sama kerjaanmu, cek penawarannya',
    '/pekerjaan/' || v_job.id
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists offer_notify on offers;
create trigger offer_notify
after insert on offers
for each row execute function trg_offer_notify();


-- Siklus hidup kesepakatan. Satu fungsi menangani semua transisi supaya lookup job dan
-- profil cuma dilakukan sekali per perubahan baris.
create or replace function trg_agreement_notify()
returns trigger as $$
declare
  v_job jobs;
  v_client_name text;
  v_worker_name text;
  v_actor uuid;
begin
  select * into v_job from jobs where id = new.job_id;
  select name into v_client_name from profiles where id = new.client_id;
  select name into v_worker_name from profiles where id = new.worker_id;

  if tg_op = 'INSERT' then
    insert into notifications (user_id, type, text, href)
    values (
      new.worker_id,
      'offer_selected',
      'Kabar baik! ' || v_client_name || ' pilih penawaranmu buat "' || v_job.title ||
        '", klik Setuju biar bisa mulai',
      '/kesepakatan/' || new.id
    );
    return new;
  end if;

  -- Siapa yang barusan bertindak diturunkan dari perubahan kolom agreed, bukan dari
  -- auth.uid(). Lebih andal karena tetap benar walau perubahannya datang dari jalur yang
  -- tidak membawa JWT (misal perbaikan manual lewat SQL Editor).
  v_actor := case
    when new.worker_agreed and not coalesce(old.worker_agreed, false) then new.worker_id
    when new.client_agreed and not coalesce(old.client_agreed, false) then new.client_id
    else coalesce(auth.uid(), new.worker_id)
  end;

  if new.status = 'locked' and old.status is distinct from 'locked' then
    insert into notifications (user_id, type, text, href)
    values (
      case when v_actor = new.client_id then new.worker_id else new.client_id end,
      'agreement_locked',
      'Deal! Kesepakatan sama ' ||
        (case when v_actor = new.client_id then v_client_name else v_worker_name end) ||
        ' buat "' || v_job.title || '" udah terkunci',
      '/kesepakatan/' || new.id
    );
  end if;

  if new.status = 'waiting-confirmation'
     and old.status is distinct from 'waiting-confirmation' then
    insert into notifications (user_id, type, text, href)
    values (
      new.client_id,
      'proof_submitted',
      v_worker_name || ' bilang "' || v_job.title ||
        '" udah kelar, cek hasilnya dan kasih testimoni',
      '/kesepakatan/' || new.id
    );
  end if;

  if new.status = 'completed' and old.status is distinct from 'completed' then
    insert into notifications (user_id, type, text, href)
    values (
      new.worker_id,
      'completion_confirmed',
      v_client_name || ' baru aja kasih testimoni buat kerjaanmu di "' || v_job.title || '"',
      '/kesepakatan/' || new.id
    );
  end if;

  if new.status = 'completed-unconfirmed'
     and old.status is distinct from 'completed-unconfirmed' then
    insert into notifications (user_id, type, text, href)
    values (
      new.worker_id,
      'completion_timeout',
      'Yah, ' || v_client_name || ' tidak merespons dalam 2 hari buat "' || v_job.title ||
        '". Statusnya jadi Selesai (Belum Dikonfirmasi), tanpa rating.',
      '/kesepakatan/' || new.id
    );
  end if;

  if new.status = 'cancelled' and old.status is distinct from 'cancelled' then
    insert into notifications (user_id, type, text, href)
    values (
      case when new.cancelled_by = new.client_id then new.worker_id else new.client_id end,
      'agreement_cancelled',
      'Yah, ' ||
        (case when new.cancelled_by = new.client_id then v_client_name else v_worker_name end) ||
        ' batalin kesepakatan "' || v_job.title || '"',
      '/kesepakatan/' || new.id
    );
  end if;

  if new.unpaid_reported and not coalesce(old.unpaid_reported, false) then
    insert into notifications (user_id, type, text, href)
    values (
      new.client_id,
      'unpaid_reported',
      v_worker_name || ' melaporkan pembayaran belum diterima untuk "' || v_job.title || '"',
      '/kesepakatan/' || new.id
    );
  end if;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists agreement_notify on agreements;
create trigger agreement_notify
after insert or update on agreements
for each row execute function trg_agreement_notify();
