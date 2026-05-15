from app.db import get_connection


def run() -> None:
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS deployment_events (
                  id SERIAL PRIMARY KEY,
                  message TEXT NOT NULL,
                  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                )
                """
            )
            cursor.execute(
                """
                INSERT INTO deployment_events (message)
                SELECT 'First full-stack deployment'
                WHERE NOT EXISTS (SELECT 1 FROM deployment_events)
                """
            )
        connection.commit()


if __name__ == "__main__":
    run()
