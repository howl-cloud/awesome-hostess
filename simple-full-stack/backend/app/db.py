import os
from contextlib import contextmanager
from typing import Iterator

import psycopg2
from psycopg2.extras import RealDictCursor


def database_url() -> str:
    url = os.getenv("DATABASE_URL")
    if not url:
        raise RuntimeError("DATABASE_URL is not set")
    return url


@contextmanager
def get_connection() -> Iterator[psycopg2.extensions.connection]:
    connection = psycopg2.connect(database_url(), cursor_factory=RealDictCursor)
    try:
        yield connection
    finally:
        connection.close()
