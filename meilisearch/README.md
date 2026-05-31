# Meilisearch on Hostess

This example runs Meilisearch with a small Next.js search console and a seed job that loads demo data into a `books` index.

The search engine uses the official `getmeili/meilisearch:v1.37` image. The UI is custom app code in `ui/`, published as `ghcr.io/howl-cloud/awesome-hostess/meilisearch-ui` for the Hostess config and built locally by the Compose mirror.

## Hostess

```sh
hostess validate
hostess deploy
```

Required secrets:

- `MEILI_MASTER_KEY`
    - Hint: `hostess secrets set MEILI_MASTER_KEY --value "$(openssl rand -base64 32)"`

The `seed-meilisearch` job runs once per environment, after Meilisearch is healthy. It imports `seed/books.json` through the Meilisearch HTTP API, then the UI starts with searchable demo data. If you change the seed files, Hostess treats the job definition as changed and runs it again on the next deploy.

## Local Compose

```sh
docker compose up
```

The local UI listens on `http://localhost:3000`; Meilisearch listens on `http://localhost:7700`.

The Compose `seed` service mirrors the Hostess job and loads the same `books` index before the UI starts. In the UI, paste the default local key and choose `books`, unless you set `MEILI_MASTER_KEY`:

```text
meili-local-master-key
```
