# Awesome Hostess

Example stacks you can deploy with [Hostess](https://hostess.sh), the Docker Compose for production. Each directory is a self-contained module with a `hostess.yml` for deployment and a `docker-compose.yml` for local smoke testing.

Read the [Hostess documentation](https://docs.hostess.sh/docs) for more information.

## Quick start

Pick a stack, `cd` into its directory, then:

```sh
hostess validate
hostess deploy
```

To run the same layout locally:

```sh
docker compose up
```

Most stacks require secrets (API keys, passwords, encryption keys). Each module's README lists what to set with `hostess secrets set` [command](https://docs.hostess.sh/docs/cli/secrets).

## Stacks

### Tutorials

| Stack | Description | Projects |
| --- | --- | --- |
| [simple-next-app](./simple-next-app/) | Minimal Next.js app from the [Deploy Your First App](https://docs.hostess.sh/guides/deploy-your-first-app) guide | [Next.js](https://nextjs.org) |
| [simple-fastapi-app](./simple-fastapi-app/) | FastAPI product catalog with traffic generation from the [Deploy Your Second App](https://docs.hostess.sh/guides/deploy-your-second-app) guide | [FastAPI](https://fastapi.tiangolo.com) |
| [simple-full-stack](./simple-full-stack/) | Next.js frontend, FastAPI backend, and Postgres from the [Deploy Next.js + FastAPI + Postgres](https://docs.hostess.sh/guides/nextjs-fastapi-postgres) guide | [Next.js](https://nextjs.org), [FastAPI](https://fastapi.tiangolo.com), [PostgreSQL](https://www.postgresql.org) |

### Apps & platforms

| Stack | Description | Projects |
| --- | --- | --- |
| [supabase](./supabase/) | Self-hosted Supabase from the [Supabase stack guide](https://docs.hostess.sh/guides/supabase-stack) | [Supabase](https://supabase.com) |
| [metabase](./metabase/) | Metabase with Postgres from the [Metabase stack guide](https://docs.hostess.sh/guides/metabase-stack) | [Metabase](https://www.metabase.com) |
| [calcom](./calcom/) | Calendar scheduling from the [Cal.com stack guide](https://docs.hostess.sh/guides/calcom-stack) | [Cal.com](https://cal.com) |
| [n8n](./n8n/) | Workflow automation from the [n8n stack guide](https://docs.hostess.sh/guides/n8n-stack) | [n8n](https://n8n.io) |
| [flowise](./flowise/) | Visual LLM workflow builder | [Flowise](https://flowiseai.com) |
| [directus](./directus/) | Headless CMS and API | [Directus](https://directus.io) |
| [meilisearch](./meilisearch/) | Meilisearch from the [Meilisearch stack guide](https://docs.hostess.sh/guides/meilisearch-stack) | [Meilisearch](https://www.meilisearch.com) |
| [open-webui-llama](./open-webui-llama/) | Gemma 4 E2B on Hostess from the [Open LLM guide](https://docs.hostess.sh/guides/open-llm) | [Open WebUI](https://openwebui.com), [llama.cpp](https://github.com/ggml-org/llama.cpp) |
| [buzz](./buzz/) | Block's open-source Slack alternative with Postgres, Redis, and MinIO | [Buzz](https://github.com/block/buzz) |

## Layout

Every stack follows the same pattern:

- **`hostess.yml`** — services, databases, jobs, and secrets for Hostess
- **`docker-compose.yml`** — local mirror for development and smoke tests
- **`README.md`** — required secrets, deploy steps, and local URLs

Some stacks add seed jobs, custom images, or extra config (for example `supabase/kong.yml` or `flowise/garage.toml`). See the module README for details.

## Contributing

Add a new directory with `hostess.yml`, `docker-compose.yml`, and a README that documents required secrets and how to run locally.
