# Meilisearch on Hostess

This example runs Meilisearch with a small Next.js search console.

The search engine uses the official `getmeili/meilisearch:v1.37` image. The UI is custom app code in `ui/`, published as `ghcr.io/howl-cloud/awesome-hostess/meilisearch-ui` for the Hostess config and built locally by the Compose mirror.

## Hostess

```sh
hostess validate
hostess deploy
```

Required secrets:

- `MEILI_MASTER_KEY`
    - Hint: `hostess secrets set MEILI_MASTER_KEY --value "$(openssl rand -base64 32)"`

## Local Compose

```sh
docker compose up
```

The local UI listens on `http://localhost:3000`; Meilisearch listens on `http://localhost:7700`.
