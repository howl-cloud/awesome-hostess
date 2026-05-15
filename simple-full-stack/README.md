# Simple Full Stack on Hostess

This is the example app used by the Hostess "Deploy Next.js + FastAPI + Postgres" guide.

It includes:

- `frontend` - Next.js app rendered with data from the API
- `backend` - FastAPI app with a small Postgres migration
- `hostess.yml` - Hostess config for all three services
- `docker-compose.yml` - local mirror for smoke testing

## Deploy with Hostess

```sh
hostess validate
hostess deploy
```

## Test with Docker Compose

```sh
docker compose up --build
```

The local frontend listens on `http://localhost:3000`, and the local API listens on `http://localhost:8000`.
