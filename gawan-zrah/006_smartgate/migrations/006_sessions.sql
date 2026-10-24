-- Sesi login untuk web admin (lokal). Token disimpan ter-hash di DB,
-- nilai mentah hanya di cookie httpOnly.

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  profile_id uuid not null references profiles(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_sessions_profile_id on sessions(profile_id);
create index if not exists idx_sessions_expires_at on sessions(expires_at);

alter table sessions enable row level security;

-- Akses sesi hanya lewat fungsi server (security definer) / kode aplikasi
-- dengan setting peran; jangan biarkan role aplikasi membaca langsung.
grant usage on schema public to smartgate_app;
grant select, insert, delete on sessions to smartgate_app;
grant usage, select on all sequences in schema public to smartgate_app;
grant execute on all functions in schema public to smartgate_app;

-- Fungsi untuk membuat sesi (mengembalikan token mentah sekali saja)
create or replace function app_create_session(p_profile_id uuid, p_ttl_hours int default 24)
returns table (token text, expires_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_token text := encode(gen_random_bytes(32), 'hex');
  v_hash text := encode(digest(v_token, 'sha256'), 'hex');
  v_exp timestamptz := now() + (p_ttl_hours || ' hours')::interval;
begin
  insert into sessions (token_hash, profile_id, expires_at) values (v_hash, p_profile_id, v_exp);
  delete from sessions s where s.expires_at < now();
  return query select v_token, v_exp;
end;
$$;

-- Fungsi untuk validasi sesi dan mendapatkan profil
create or replace function app_get_session(p_token text)
returns table (profile_id uuid, role text, email text, nama text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_hash text := encode(digest(coalesce(p_token,''), 'sha256'), 'hex');
begin
  delete from sessions s where s.expires_at < now();
  return query
    select s.profile_id, pr.role, pr.email, pr.nama
    from sessions s
    join profiles pr on pr.id = s.profile_id
    where s.token_hash = v_hash and s.expires_at > now();
end;
$$;

revoke execute on function app_create_session(uuid,int) from public;
revoke execute on function app_get_session(text) from public;
grant execute on function app_create_session(uuid,int) to smartgate_app;
grant execute on function app_get_session(text) to smartgate_app;

-- Logout: hapus sesi di server supaya token tidak bisa dipakai lagi.
create or replace function app_delete_session(p_token text)
returns void
language sql
security definer
set search_path = public
as $$
  delete from sessions s
  where s.token_hash = encode(digest(coalesce(p_token, ''), 'sha256'), 'hex');
$$;

revoke execute on function app_delete_session(text) from public;
grant execute on function app_delete_session(text) to smartgate_app;
