# n8n on Hostess

This example runs n8n with Hostess-managed Postgres.

Related Hostess docs:

- [Deploy the n8n Stack](https://docs.hostess.sh/guides/n8n-stack)
- [Managing Secrets](https://docs.hostess.sh/guides/managing-secrets)
- [Postgres on Hostess](https://docs.hostess.sh/docs/service-types/postgres)

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
