-- Task #9B: satpam boleh registrasi/cari profil tamu dan mencatat kunjungan.
-- Tetap least privilege: hanya SELECT/INSERT pada guests & guest_visits, dan
-- SELECT pada houses untuk memilih rumah tujuan. Tidak ada UPDATE/DELETE,
-- dan policy admin yang sudah ada tidak diubah.

drop policy if exists guests_satpam_select on guests;
create policy guests_satpam_select on guests
  for select to smartgate_app
  using (current_setting('app.role', true) in ('admin', 'satpam'));

drop policy if exists guests_satpam_insert on guests;
create policy guests_satpam_insert on guests
  for insert to smartgate_app
  with check (current_setting('app.role', true) in ('admin', 'satpam'));

drop policy if exists guest_visits_satpam_select on guest_visits;
create policy guest_visits_satpam_select on guest_visits
  for select to smartgate_app
  using (current_setting('app.role', true) in ('admin', 'satpam'));

drop policy if exists guest_visits_satpam_insert on guest_visits;
create policy guest_visits_satpam_insert on guest_visits
  for insert to smartgate_app
  with check (current_setting('app.role', true) in ('admin', 'satpam'));

-- Satpam hanya perlu melihat rumah tujuan. API-nya membatasi kolom yang dibaca.
drop policy if exists houses_satpam_select on houses;
create policy houses_satpam_select on houses
  for select to smartgate_app
  using (current_setting('app.role', true) in ('admin', 'satpam'));
