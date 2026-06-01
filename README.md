# Awesome Hostess

Example stacks you can deploy with [Hostess](https://hostess.sh), the Docker Compose for production. Each directory is a self-contained module with a `hostess.yml` for deployment and a `docker-compose.yml` for local smoke testing.

Read the [Hostess documentation](https://docs.hostess.sh) for more information.

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

Most stacks require secrets (API keys, passwords, encryption keys). Each module's README lists what to set with `hostess secrets set`.

## Stacks

### Tutorials

| Stack | Description | Projects |
| --- | --- | --- |
| [simple-next-app](./simple-next-app/) | Minimal Next.js app from the [Deploy Your First App](https://docs.hostess.sh) guide | [Next.js](https://nextjs.org) |
| [simple-full-stack](./simple-full-stack/) | Next.js frontend, FastAPI backend, and Postgres from the [Deploy Next.js + FastAPI + Postgres](https://docs.hostess.sh) guide | [Next.js](https://nextjs.org), [FastAPI](https://fastapi.tiangolo.com), [PostgreSQL](https://www.postgresql.org) |

### Apps & platforms

| Stack | Description | Projects |
| --- | --- | --- |
| [supabase](./supabase/) | Self-hosted Supabase | [Supabase](https://supabase.com) |
| [metabase](./metabase/) | Metabase with Postgres | [Metabase](https://www.metabase.com) |
| [calcom](./calcom/) | Calendar scheduling | [Cal.com](https://cal.com) |
| [n8n](./n8n/) | Workflow automation | [n8n](https://n8n.io) |
| [flowise](./flowise/) | Visual LLM workflow builder | [Flowise](https://flowiseai.com) |
| [directus](./directus/) | Headless CMS and API | [Directus](https://directus.io) |
| [meilisearch](./meilisearch/) | Meilisearch | [Meilisearch](https://www.meilisearch.com) |
| [open-webui-llama](./open-webui-llama/) | Gemma 4 E2B on Hostess | [Open WebUI](https://openwebui.com), [llama.cpp](https://github.com/ggml-org/llama.cpp) |

## Layout

Every stack follows the same pattern:

- **`hostess.yml`** — services, databases, jobs, and secrets for Hostess
- **`docker-compose.yml`** — local mirror for development and smoke tests
- **`README.md`** — required secrets, deploy steps, and local URLs

Some stacks add seed jobs, custom images, or extra config (for example `supabase/kong.yml` or `flowise/garage.toml`). See the module README for details.

## Contributing

Add a new directory with `hostess.yml`, `docker-compose.yml`, and a README that documents required secrets and how to run locally.
