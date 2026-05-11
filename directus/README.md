# Directus on Hostess

This example runs Directus CMS/API with Hostess-managed Postgres and persistent local uploads.

Directus stores uploaded files under `/data/uploads` in the Hostess custom service.

## Hostess

```sh
hostess validate
hostess deploy
```

Required secrets:

- `DIRECTUS_SECRET`
    - Hint: `hostess secrets set DIRECTUS_SECRET --value "$(openssl rand -base64 32)"`
- `DIRECTUS_ADMIN_EMAIL`
- `DIRECTUS_ADMIN_PASSWORD`
    - Hint: `hostess secrets set DIRECTUS_ADMIN_PASSWORD --value "$(openssl rand -base64 18)"`

Use the admin email address you want to sign in with for `DIRECTUS_ADMIN_EMAIL`.

## Local Compose

```sh
docker compose up
```

The local app listens on `http://localhost:8055`.
