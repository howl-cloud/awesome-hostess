# Flowise on Hostess

This example runs Flowise with Hostess-managed Postgres and a Garage-backed S3 object store.

## Hostess

```sh
hostess validate
hostess deploy
```

Required secrets:

- `GARAGE_RPC_SECRET`
    - Hint: `hostess secrets set GARAGE_RPC_SECRET --value "$(openssl rand -hex 32)"`
- `GARAGE_ADMIN_TOKEN`
    - Hint: `hostess secrets set GARAGE_ADMIN_TOKEN --value "$(openssl rand -base64 32)"`
- `GARAGE_METRICS_TOKEN`
    - Hint: `hostess secrets set GARAGE_METRICS_TOKEN --value "$(openssl rand -base64 32)"`
- `FLOWISE_S3_ACCESS_KEY_ID`
    - Hint: `hostess secrets set FLOWISE_S3_ACCESS_KEY_ID --value "flowise"`
- `FLOWISE_S3_SECRET_ACCESS_KEY`
    - Hint: `hostess secrets set FLOWISE_S3_SECRET_ACCESS_KEY --value "$(openssl rand -base64 32)"`
- `FLOWISE_USERNAME`
- `FLOWISE_PASSWORD`
    - Hint: `hostess secrets set FLOWISE_PASSWORD --value "$(openssl rand -base64 18)"`
- `FLOWISE_JWT_AUTH_TOKEN_SECRET`
    - Hint: `hostess secrets set FLOWISE_JWT_AUTH_TOKEN_SECRET --value "$(openssl rand -base64 32)"`
- `FLOWISE_JWT_REFRESH_TOKEN_SECRET`
    - Hint: `hostess secrets set FLOWISE_JWT_REFRESH_TOKEN_SECRET --value "$(openssl rand -base64 32)"`
- `FLOWISE_EXPRESS_SESSION_SECRET`
    - Hint: `hostess secrets set FLOWISE_EXPRESS_SESSION_SECRET --value "$(openssl rand -base64 32)"`
- `FLOWISE_SECRET_KEY`
    - Hint: `hostess secrets set FLOWISE_SECRET_KEY --value "$(openssl rand -base64 32)"`

Use any login name you want for `FLOWISE_USERNAME`.

## Local Compose

```sh
docker compose up
```

The local Flowise app listens on `http://localhost:3000`.
