# Supabase on Hostess

This example maps the core Supabase self-hosting stack onto Hostess:

- Kong as the single public endpoint
- Hostess-managed Postgres
- Postgres Meta
- PostgREST
- Supabase Studio
- Supabase Auth
- Supabase Storage API backed by Garage S3-compatible storage
- imgproxy for Storage image transformations
- Supabase Realtime
- Supabase Edge Runtime with a mounted starter function
- Supabase Analytics backed by Logflare
- Vector as the log forwarder service

Kong is the public service. Studio, Auth, REST, Storage, Realtime, and Functions stay private and are reached through Kong paths:

- `/` -> Studio
- `/auth/v1` -> Auth
- `/rest/v1` -> PostgREST
- `/storage/v1` -> Storage
- `/realtime/v1` -> Realtime
- `/functions/v1` -> Edge Runtime

Studio is protected with HTTP Basic Auth through Kong.

## Current limitations

This is closer to the upstream Supabase Docker stack, but it is not a full hosted-Supabase clone.

- Edge Functions are served by `supabase/edge-runtime` from `functions/main/index.ts`. They are not viewable or editable through Studio because Hostess does not currently model a shared writable functions volume between Studio and the Functions runtime.
- Realtime is wired against Hostess-managed Postgres and the bootstrap creates the `supabase_realtime` publication. This should be treated as the Hostess mapping to validate, especially around RLS/publication behavior.
- The config uses Supabase's newer opaque `sb_publishable_...` and `sb_secret_...` API keys at the gateway and Studio/API-client layer. The legacy `ANON_KEY`, `SERVICE_ROLE_KEY`, and `JWT_SECRET` are still required because self-hosted Supabase uses them for backwards compatibility and as part of the `JWT_KEYS`/`JWT_JWKS` signing configuration.
- Vector is present as a Hostess service, but it does not yet mirror upstream Docker socket log collection. Hostess/Kubernetes log collection needs either a first-class Hostess log source or extra Kubernetes RBAC for pod log access.

Before deploying, create the referenced Hostess secrets in `hostess.yml`:

- `PG_META_CRYPTO_KEY`
    - Hint: `hostess secrets set PG_META_CRYPTO_KEY --value "$(openssl rand -base64 32)"`
- `JWT_SECRET`
    - Hint: `hostess secrets set JWT_SECRET --value "$(openssl rand -base64 32)"`
- `ANON_KEY`
    - Legacy HS256 JWT for the `anon` role, generated from `JWT_SECRET`; run `sh utils/generate-keys.sh` and use its `ANON_KEY` output.
- `SERVICE_ROLE_KEY`
    - Legacy HS256 JWT for the `service_role` role, generated from `JWT_SECRET`; run `sh utils/generate-keys.sh` and use its `SERVICE_ROLE_KEY` output.
- `SUPABASE_PUBLISHABLE_KEY`
    - Format: `sb_publishable_<random>_<checksum>`
- `SUPABASE_SECRET_KEY`
    - Format: `sb_secret_<random>_<checksum>`
- `ANON_KEY_ASYMMETRIC`
    - Internal ES256 JWT for the `anon` role. Do not use in application code.
- `SERVICE_ROLE_KEY_ASYMMETRIC`
    - Internal ES256 JWT for the `service_role` role. Do not use in application code.
- `JWT_KEYS`
    - JSON array of signing JWKs for Auth.
- `JWT_JWKS`
    - JWKS JSON used by PostgREST, Realtime, and Storage to verify tokens.
- `SUPABASE_PUBLISHABLE_KEYS`
    - Hint: `hostess secrets set SUPABASE_PUBLISHABLE_KEYS --value '{"default":"sb_publishable_..."}'`
- `SUPABASE_SECRET_KEYS`
    - Hint: `hostess secrets set SUPABASE_SECRET_KEYS --value '{"default":"sb_secret_..."}'`
- `DASHBOARD_USERNAME`
    - Hint: `hostess secrets set DASHBOARD_USERNAME --value admin`
- `DASHBOARD_PASSWORD`
    - Hint: `hostess secrets set DASHBOARD_PASSWORD --value "$(openssl rand -base64 24)"`
- `SECRET_KEY_BASE`
    - Hint: `hostess secrets set SECRET_KEY_BASE --value "$(openssl rand -base64 64)"`
- `REALTIME_DB_ENC_KEY`
    - Hint: `hostess secrets set REALTIME_DB_ENC_KEY --value "$(openssl rand -hex 8)"` (must be exactly **16 bytes** as an ASCII string; Realtime uses AES-128-ECB. A `base64`-length secret is often the wrong size.)
- `GARAGE_RPC_SECRET`
    - Hint: `hostess secrets set GARAGE_RPC_SECRET --value "$(openssl rand -hex 32)"`
- `GARAGE_ADMIN_TOKEN`
    - Hint: `hostess secrets set GARAGE_ADMIN_TOKEN --value "$(openssl rand -base64 32)"`
- `GARAGE_METRICS_TOKEN`
    - Hint: `hostess secrets set GARAGE_METRICS_TOKEN --value "$(openssl rand -base64 32)"`
- `SUPABASE_STORAGE_S3_ACCESS_KEY`
    - Hint: `hostess secrets set SUPABASE_STORAGE_S3_ACCESS_KEY --value "$(openssl rand -hex 16)"`
- `SUPABASE_STORAGE_S3_SECRET_KEY`
    - Hint: `hostess secrets set SUPABASE_STORAGE_S3_SECRET_KEY --value "$(openssl rand -base64 32)"`
- `LOGFLARE_PUBLIC_ACCESS_TOKEN`
    - Hint: `hostess secrets set LOGFLARE_PUBLIC_ACCESS_TOKEN --value "$(openssl rand -base64 32)"`
- `LOGFLARE_PRIVATE_ACCESS_TOKEN`
    - Hint: `hostess secrets set LOGFLARE_PRIVATE_ACCESS_TOKEN --value "$(openssl rand -base64 32)"`

Supabase's upstream self-hosting guide generates the new key material with `utils/add-new-auth-keys.sh`. For Hostess, put the generated values into Hostess secrets instead of a local `.env` file.

## Hostess

```sh
hostess validate
hostess deploy
```

## Local Compose

```sh
docker compose up
```

The local Compose file mirrors the Hostess service layout. Kong is exposed at `http://localhost:8000`; Studio and the Supabase APIs are reached through the same Kong paths listed above.
