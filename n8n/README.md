# n8n on Hostess

This example runs n8n with Hostess-managed Postgres.

## Hostess

```sh
hostess validate
hostess deploy
```

Required secret:

- `N8N_ENCRYPTION_KEY`
    - Hint: `hostess secrets set N8N_ENCRYPTION_KEY --value "$(openssl rand -base64 32)"`

## Local Compose

```sh
docker compose up
```

The local app listens on `http://localhost:5678`.
