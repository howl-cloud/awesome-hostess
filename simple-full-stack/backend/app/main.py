import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.db import get_connection


class HealthResponse(BaseModel):
    status: str


class StatusResponse(BaseModel):
    api: str
    database: str
    event_count: int
    latest_event: str | None


class EventCreate(BaseModel):
    message: str


class EventResponse(BaseModel):
    id: int
    message: str


def cors_origins() -> list[str]:
    raw = os.getenv("CORS_ORIGINS", "")
    return [origin.strip() for origin in raw.split(",") if origin.strip()]


app = FastAPI(title="Simple Full Stack API")

origins = cors_origins()
if origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_methods=["GET", "POST"],
        allow_headers=["*"],
    )


@app.get("/health")
async def health() -> HealthResponse:
  return HealthResponse(status="ok")


@app.get("/api/status")
async def status() -> StatusResponse:
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT COUNT(*) AS event_count,
                       MAX(message) AS latest_event
                FROM deployment_events
                """
            )
            row = cursor.fetchone()

    return StatusResponse(
        api="ok",
        database="ok",
        event_count=row["event_count"],
        latest_event=row["latest_event"],
    )


@app.post("/api/events")
async def create_event(event: EventCreate) -> EventResponse:
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO deployment_events (message)
                VALUES (%s)
                RETURNING id, message
                """,
                (event.message,),
            )
            row = cursor.fetchone()
        connection.commit()

    return EventResponse(id=row["id"], message=row["message"])
