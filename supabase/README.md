# Supabase on Hostess

This example is the lightweight Supabase-style Postgres dashboard shape:
- Hostess-managed Postgres
- Postgres Meta
- PostgREST
- Supabase Studio

It intentionally does not model the full Supabase self-hosting stack. Auth, Realtime, Storage, Kong, Edge Functions, Supavisor, and bootstrap SQL are left out so the example stays image-only and easy to test.

Before deploying, create the referenced Hostess secrets in `hostess.yml`:

- `PG_META_CRYPTO_KEY`
    - Hint: `hostess secrets set PG_META_CRYPTO_KEY --value "$(openssl rand -base64 32)"`
- `JWT_SECRET`
    - Hint: `hostess secrets set JWT_SECRET --value "$(openssl rand -base64 32)"`
- `ANON_KEY`
    - Hint: `hostess secrets set ANON_KEY --value "$(openssl rand -base64 32)"`
- `SERVICE_ROLE_KEY`
    - Hint: `hostess secrets set SERVICE_ROLE_KEY --value "$(openssl rand -base64 32)"`

## Hostess

```sh
hostess validate
hostess deploy
```

## Local Compose

```sh
docker compose up
```

The local Studio app listens on `http://localhost:3000`.
PostgREST listens on `http://localhost:3001`.
Postgres Meta listens on `http://localhost:8080`.
