# Metabase on Hostess

This example runs Metabase with Hostess-managed Postgres for the application database.

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

## Local Compose

```sh
docker compose up
```

The local app listens on `http://localhost:3000`.
