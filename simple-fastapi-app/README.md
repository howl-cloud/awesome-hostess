# KickOff Sports API on Hostess

This is the example app used by the Hostess "Deploy Your Second App" guide.

It includes:

- `api` — FastAPI product catalog with sports equipment data, instrumented with `hostess-python` for route-level metrics
- `traffic` — HTTP service that fires synthetic requests at `api` to populate the Metrics tab
- `hostess.yml` — Hostess config for both services using zero-config `source:` builds (no Dockerfiles)

Related Hostess docs:

- [Deploy Your Second App](https://docs.hostess.sh/guides/deploy-your-second-app)
- [FastAPI on Hostess](https://docs.hostess.sh/docs/service-types/fastapi)
- [Insights](https://docs.hostess.sh/docs/insights)

## Deploy with Hostess

```sh
hostess validate
hostess deploy
```

## Generate traffic

Once deployed, hit the traffic endpoint to send a burst of requests to the API:

```sh
curl https://<traffic-url>/run
curl https://<traffic-url>/run?count=100
```

Then open Studio → your deployment → **api** → **Metrics** to see per-route traffic, latency, and status codes.

## Run locally

```sh
# api
cd api && uv run fastapi dev app/main.py

# traffic (in a second terminal)
cd traffic && API_URL=http://localhost:8000 uv run fastapi dev app/main.py --port 8001
```
