# Plane on Hostess

This example runs Plane with Hostess-managed Postgres and Redis, RabbitMQ, and Garage-backed S3 upload storage.

## Hostess

```sh
hostess validate
hostess deploy
```

Required secrets:

- `PLANE_SECRET_KEY`
    - Hint: `hostess secrets set PLANE_SECRET_KEY --value "$(openssl rand -base64 32)"`
- `LIVE_SERVER_SECRET_KEY`
    - Hint: `hostess secrets set LIVE_SERVER_SECRET_KEY --value "$(openssl rand -base64 32)"`
- `RABBITMQ_PASSWORD`
    - Hint: `hostess secrets set RABBITMQ_PASSWORD --value "$(openssl rand -base64 18)"`
- `GARAGE_RPC_SECRET`
    - Hint: `hostess secrets set GARAGE_RPC_SECRET --value "$(openssl rand -hex 32)"`
- `GARAGE_ADMIN_TOKEN`
    - Hint: `hostess secrets set GARAGE_ADMIN_TOKEN --value "$(openssl rand -base64 32)"`
- `GARAGE_METRICS_TOKEN`
    - Hint: `hostess secrets set GARAGE_METRICS_TOKEN --value "$(openssl rand -base64 32)"`
- `AWS_ACCESS_KEY_ID`
    - Hint: `hostess secrets set AWS_ACCESS_KEY_ID --value "plane"`
- `AWS_SECRET_ACCESS_KEY`
    - Hint: `hostess secrets set AWS_SECRET_ACCESS_KEY --value "$(openssl rand -base64 32)"`


## Local Compose

```sh
docker compose up
```

The local app listens on `http://localhost:8080`.
