# Simple Next App on Hostess

This is the example app used by the Hostess "Deploy Your First App" guide.

Related Hostess docs:

- [Deploy Your First App](https://docs.hostess.sh/guides/deploy-your-first-app)
- [Next.js on Hostess](https://docs.hostess.sh/docs/service-types/nextjs)
- [CLI deploy reference](https://docs.hostess.sh/docs/cli/deploy)

## Deploy with Hostess

```sh
hostess validate
hostess deploy
```

## Test with Docker Compose

```sh
docker compose up --build
```

The local app listens on `http://localhost:3000`.
