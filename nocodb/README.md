# NocoDB on Hostess

This example runs NocoDB with Hostess-managed Postgres and Redis.

The Hostess config uses `DATABASE_URL: ${db.url}` for Postgres and `NC_REDIS_URL: ${cache.url}` for Redis.

## Hostess

```sh
hostess validate
hostess deploy
```

Required secrets:

- `NOCODB_AUTH_JWT_SECRET`
    - Hint: `hostess secrets set NOCODB_AUTH_JWT_SECRET --value "$(openssl rand -base64 32)"`
- `NOCODB_CONNECTION_ENCRYPT_KEY`
    - Hint: `hostess secrets set NOCODB_CONNECTION_ENCRYPT_KEY --value "$(openssl rand -base64 32)"`
- `NOCODB_ADMIN_EMAIL`
- `NOCODB_ADMIN_PASSWORD`
    - Hint: `hostess secrets set NOCODB_ADMIN_PASSWORD --value "$(openssl rand -base64 18)"`

Use the admin email address you want to sign in with for `NOCODB_ADMIN_EMAIL`.

## Local Compose

```sh
docker compose up
```

The local app listens on `http://localhost:8080`.
