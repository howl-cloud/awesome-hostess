-- Hostess Supabase bootstrap.
-- This creates the roles and schemas needed by the services in hostess.yml.
-- The service images still own their own application migrations where supported.

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon noinherit nologin;
  end if;

  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated noinherit nologin;
  end if;

  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role noinherit nologin bypassrls;
  end if;

  if not exists (select 1 from pg_roles where rolname = 'authenticator') then
    create role authenticator noinherit login password 'placeholder';
  end if;

  if not exists (select 1 from pg_roles where rolname = 'supabase_admin') then
    create role supabase_admin noinherit login createdb createrole replication bypassrls password 'placeholder';
  end if;

  if not exists (select 1 from pg_roles where rolname = 'supabase_auth_admin') then
    create role supabase_auth_admin noinherit login password 'placeholder';
  end if;

  if not exists (select 1 from pg_roles where rolname = 'supabase_storage_admin') then
    create role supabase_storage_admin noinherit login password 'placeholder';
  end if;

  if not exists (select 1 from pg_roles where rolname = 'supabase_functions_admin') then
    create role supabase_functions_admin noinherit login password 'placeholder';
  end if;
end
$$;

alter role authenticator with password :'pgpass';
alter role supabase_admin with password :'pgpass';
alter role supabase_auth_admin with createrole;
alter role supabase_auth_admin with password :'pgpass';
alter role supabase_storage_admin with password :'pgpass';
alter role supabase_functions_admin with password :'pgpass';

grant anon, authenticated, service_role to authenticator;
grant all privileges on database :"dbname" to supabase_admin;
grant all privileges on schema public to supabase_admin;
grant usage on schema public to anon, authenticated, service_role;
grant all privileges on all tables in schema public to anon, authenticated, service_role;
grant all privileges on all routines in schema public to anon, authenticated, service_role;
grant all privileges on all sequences in schema public to anon, authenticated, service_role;

create schema if not exists auth authorization supabase_auth_admin;
create schema if not exists storage authorization supabase_storage_admin;
create schema if not exists _realtime authorization supabase_admin;
create schema if not exists realtime authorization supabase_admin;
create schema if not exists extensions authorization supabase_admin;
create schema if not exists _analytics authorization supabase_admin;

alter role supabase_auth_admin set search_path = auth;

grant all privileges on schema auth to supabase_auth_admin;
grant all privileges on all tables in schema auth to supabase_auth_admin;
grant all privileges on all sequences in schema auth to supabase_auth_admin;
grant usage on schema auth to postgres, anon, authenticated, service_role;
grant usage on schema storage to postgres, anon, authenticated, service_role;
grant usage on schema _realtime to postgres, anon, authenticated, service_role;
grant usage on schema realtime to postgres, anon, authenticated, service_role;
grant usage on schema extensions to postgres, anon, authenticated, service_role;
grant usage on schema _analytics to postgres, supabase_admin;

alter default privileges for role supabase_auth_admin in schema auth
  grant all on tables to postgres, anon, authenticated, service_role;
alter default privileges for role supabase_storage_admin in schema storage
  grant all on tables to postgres, anon, authenticated, service_role;
alter default privileges for role supabase_admin in schema _realtime
  grant all on tables to postgres, anon, authenticated, service_role;
alter default privileges for role supabase_admin in schema realtime
  grant all on tables to postgres, anon, authenticated, service_role;
alter default privileges for role supabase_admin in schema _analytics
  grant all on tables to postgres, supabase_admin;

do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end
$$;

alter database :"dbname" set "app.jwt_secret" to :'jwt_secret';
alter database :"dbname" set "app.jwt_exp" to :'jwt_exp';
