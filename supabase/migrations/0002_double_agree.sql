-- Migrasi 2/4: hilangkan klik Setuju kedua dari klien
--
-- Memilih satu penawaran dari sekian yang masuk sudah merupakan tindakan yang tidak ambigu,
-- jadi klik Setuju terpisah dari pihak yang sama cuma menambah friksi. Baris `agreements`
-- cuma pernah dibuat sebagai akibat langsung klien memilih penawaran, jadi memaksa kolom
-- client_agreed jadi true di level tabel berlaku untuk RPC manapun yang membuat baris itu,
-- tanpa perlu mengedit isi fungsi RPC yang sudah berjalan.

create or replace function trg_agreement_client_autoagree()
returns trigger as $$
begin
  new.client_agreed := true;
  return new;
end;
$$ language plpgsql;

drop trigger if exists agreement_client_autoagree on agreements;
create trigger agreement_client_autoagree
before insert on agreements
for each row execute function trg_agreement_client_autoagree();

-- Penguncian juga dipindah ke level tabel, bukan diserahkan ke isi `agree_to_agreement`.
--
-- Alasannya: source RPC yang sudah berjalan tidak ada di repo ini, jadi kita tidak bisa
-- memastikan fungsi itu benar-benar mengunci begitu kedua kolom agreed bernilai true.
-- Dengan trigger ini, satu klik Setuju dari pekerja pasti mengunci kesepakatan, apapun isi
-- fungsi RPC-nya. Kalau RPC ternyata sudah melakukannya sendiri, trigger ini cuma jadi
-- no-op karena statusnya sudah locked duluan.

create or replace function trg_agreement_autolock()
returns trigger as $$
begin
  if new.status = 'waiting-approval'
     and new.client_agreed
     and new.worker_agreed then
    new.status := 'locked';
    new.locked_at := coalesce(new.locked_at, now());
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists agreement_autolock on agreements;
create trigger agreement_autolock
before update on agreements
for each row execute function trg_agreement_autolock();
