# Metabase on Hostess

This example runs Metabase with Hostess-managed Postgres for the application database. Seed jobs also create a `business` schema with demo customers, products, orders, support tickets, and marketing campaigns, then register that schema as a Metabase data source.

## Hostess

```sh
hostess validate
hostess deploy
```

Required secrets:

- `METABASE_ENCRYPTION_SECRET_KEY`
    - Hint: `hostess secrets set METABASE_ENCRYPTION_SECRET_KEY --value "$(openssl rand -base64 32)"`
- `METABASE_ADMIN_EMAIL`
    - Hint: `hostess secrets set METABASE_ADMIN_EMAIL --value "admin@example.com"`
- `METABASE_ADMIN_PASSWORD`
    - Hint: `hostess secrets set METABASE_ADMIN_PASSWORD --value "$(openssl rand -base64 24)"`

The `seed-business-data` job runs once after Postgres is healthy and before Metabase starts. It loads `db/business-seed.sql` into the same Postgres database that Metabase uses for its application metadata. The `register-business-db` job then waits for Metabase, creates the first admin account if needed, registers the `business` schema as `Business Demo`, and triggers a schema sync. This keeps the demo compact, but for production you should connect Metabase to a separate analytics database.

## Local Compose

```sh
docker compose up
```

The local app listens on `http://localhost:3000`. The Compose `seed-business-data` and `register-business-db` services mirror the Hostess jobs. The local Metabase admin login is:

```text
Email: admin@example.com
Password: MetabaseLocalDemo2026
```
