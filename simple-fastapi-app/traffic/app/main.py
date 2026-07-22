import os
import random

import httpx
from fastapi import FastAPI
from pydantic import BaseModel

API_URL = os.getenv("API_URL", "http://localhost:8000")

_GET_ENDPOINTS = [
    "/health",
    "/products",
    "/products?category=football",
    "/products?category=running",
    "/products?category=basketball",
    "/products/1",
    "/products/2",
    "/products/3",
    "/products/4",
    "/products/5",
    "/products/6",
    "/products/99",  # 404
    "/categories",
]

_ORDERS = [
    {"product_id": 1, "quantity": 1},
    {"product_id": 2, "quantity": 2},
    {"product_id": 3, "quantity": 1},
    {"product_id": 5, "quantity": 3},
    {"product_id": 99, "quantity": 1},  # 404
]


class HealthResponse(BaseModel):
    status: str


class RunResponse(BaseModel):
    sent: int
    ok: int
    errors: int


app = FastAPI(title="KickOff Traffic Generator")


@app.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    return HealthResponse(status="ok")


@app.get("/run", response_model=RunResponse)
async def run(count: int = 20) -> RunResponse:
    count = max(1, min(count, 500))
    ok = errors = 0

    async with httpx.AsyncClient(base_url=API_URL, timeout=10.0) as client:
        for _ in range(count):
            try:
                if random.random() < 0.2:
                    resp = await client.post("/orders", json=random.choice(_ORDERS))
                else:
                    resp = await client.get(random.choice(_GET_ENDPOINTS))
                if resp.status_code < 500:
                    ok += 1
                else:
                    errors += 1
            except Exception:
                errors += 1

    return RunResponse(sent=count, ok=ok, errors=errors)
