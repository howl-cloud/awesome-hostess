# Open WebUI + llama.cpp on Hostess

This example runs Open WebUI with Hostess-managed Postgres and a CPU-only `llama.cpp` server.

The model server uses `gguf-org/gemma-4-e2b-it-gguf:Q4_0` through the `ghcr.io/ggml-org/llama.cpp:server` image. This example is intentionally CPU-only.

**If you want to use GPUs on Hostess, express interest in Hostess prioritizing GPU support!**

## Hostess

```sh
hostess validate
hostess deploy
```

Required secrets:

- `WEBUI_SECRET_KEY`
    - Hint: `hostess secrets set WEBUI_SECRET_KEY --value "$(openssl rand -base64 32)"`

## Local Compose

```sh
docker compose up
```

The local Open WebUI app listens on `http://localhost:3000`.
The llama.cpp API listens on `http://localhost:8081`.
