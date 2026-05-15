export const dynamic = "force-dynamic";

type ApiStatus = {
  api: string;
  database: string;
  event_count: number;
  latest_event: string | null;
};

const apiUrl = process.env.API_URL ?? "http://localhost:8000";

const checks = [
  "Next.js renders data from FastAPI",
  "FastAPI reads and writes Postgres",
  "Hostess wires service URLs and database secrets",
];

const commands = ["docker compose up --build", "hostess deploy"];

async function loadStatus(): Promise<ApiStatus | null> {
  try {
    const response = await fetch(`${apiUrl}/api/status`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch {
    return null;
  }
}

export default async function Home() {
  const status = await loadStatus();
  const apiOnline = status?.api === "ok";

  return (
    <main
      className="min-h-screen relative"
      style={{ background: "var(--bg)", color: "var(--text)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-[120px] opacity-[0.06]"
        style={{ background: "var(--accent)" }}
      />

      <header
        className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-8 sm:px-12 py-5"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <span
          className="font-mono text-[11px] tracking-[0.25em] uppercase font-medium"
          style={{ color: "var(--accent)" }}
        >
          Hostess
        </span>
        <div
          className="flex items-center gap-2 font-mono text-[11px] tracking-wide"
          style={{ color: "var(--muted)" }}
        >
          <span
            className="h-[7px] w-[7px] rounded-full dot-breathe"
            style={{ background: apiOnline ? "var(--accent)" : "#f97316" }}
          />
          <span>{apiOnline ? "api + db live" : "api reconnecting"}</span>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-8 sm:px-12 pt-32 pb-24 flex flex-col justify-center min-h-screen">
        <p
          className="fade-up font-mono text-[11px] tracking-[0.35em] uppercase mb-10"
          style={{ animationDelay: "0ms", color: "var(--muted)" }}
        >
          Full-stack ready
        </p>

        <div className="fade-up mb-10" style={{ animationDelay: "80ms" }}>
          <h1
            className="font-extrabold leading-[0.88] tracking-tight"
            style={{
              fontSize: "clamp(3.75rem, 11vw, 9.5rem)",
              color: "var(--text)",
            }}
          >
            Next.js<br />
            FastAPI<br />
            <span style={{ color: "var(--accent)" }}>Postgres</span>
            <span className="cursor-blink" style={{ color: "var(--accent)" }}>
              .
            </span>
          </h1>
        </div>

        <p
          className="fade-up text-lg leading-relaxed max-w-md mb-16"
          style={{ animationDelay: "180ms", color: "var(--muted)" }}
        >
          A minimal production-shaped stack with local Compose testing and a
          Hostess config that deploys all three services together.
        </p>

        <div
          className="fade-up mb-10 w-full h-px line-grow"
          style={{
            animationDelay: "260ms",
            background: "var(--border)",
            animationFillMode: "both",
          }}
        />

        <div className="grid gap-4 mb-10 sm:grid-cols-3">
          <Metric label="api" value={status?.api ?? "offline"} delay={300} />
          <Metric
            label="database"
            value={status?.database ?? "unknown"}
            delay={370}
          />
          <Metric
            label="events"
            value={String(status?.event_count ?? 0)}
            delay={440}
          />
        </div>

        <div className="mb-12">
          {checks.map((check, i) => (
            <div
              key={check}
              className="fade-up flex items-center gap-4 py-4"
              style={{
                animationDelay: `${520 + i * 70}ms`,
                borderBottom: "1px solid var(--border)",
              }}
            >
              <span
                className="font-mono text-lg leading-none shrink-0 dot-breathe"
                style={{ color: "var(--accent)", animationDelay: `${i * 0.4}s` }}
              >
                ●
              </span>
              <span
                className="font-mono text-sm tracking-wide"
                style={{ color: "var(--text)" }}
              >
                {check}
              </span>
            </div>
          ))}
        </div>

        <div
          className="fade-up flex flex-col sm:flex-row gap-3"
          style={{ animationDelay: "760ms" }}
        >
          {commands.map((cmd) => (
            <div
              key={cmd}
              className="flex items-center gap-3 px-5 py-3.5 font-mono text-sm"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
            >
              <span
                className="font-bold select-none"
                style={{ color: "var(--accent)" }}
              >
                $
              </span>
              <span style={{ color: "var(--text)" }}>{cmd}</span>
            </div>
          ))}
        </div>
      </section>

      <footer
        className="fixed bottom-0 inset-x-0 flex items-center justify-between px-8 sm:px-12 py-4"
        style={{ borderTop: "1px solid var(--border)", background: "var(--bg)" }}
      >
        <span
          className="font-mono text-[10px] tracking-[0.2em] uppercase"
          style={{ color: "var(--muted-2)" }}
        >
          awesome-hostess · simple-full-stack
        </span>
        <span className="font-mono text-[10px]" style={{ color: "var(--muted-2)" }}>
          Next.js 16 · FastAPI · Postgres
        </span>
      </footer>
    </main>
  );
}

function Metric({
  label,
  value,
  delay,
}: {
  label: string;
  value: string;
  delay: number;
}) {
  return (
    <div
      className="fade-up px-5 py-4"
      style={{
        animationDelay: `${delay}ms`,
        background: "var(--surface)",
        border: "1px solid var(--border)",
      }}
    >
      <p
        className="font-mono text-[10px] uppercase tracking-[0.22em] mb-3"
        style={{ color: "var(--muted)" }}
      >
        {label}
      </p>
      <p className="font-mono text-xl" style={{ color: "var(--accent)" }}>
        {value}
      </p>
    </div>
  );
}
