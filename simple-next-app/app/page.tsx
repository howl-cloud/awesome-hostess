const checks = [
  "Built from a production Dockerfile",
  "Served by a Next.js standalone server",
  "Configured with a minimal Hostess service",
];

const commands = ["docker compose up --build", "hostess deploy"];

export default function Home() {
  return (
    <main
      className="min-h-screen relative"
      style={{ background: "var(--bg)", color: "var(--text)" }}
    >
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-[120px] opacity-[0.06]"
        style={{ background: "var(--accent)" }}
      />

      {/* Header */}
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
            style={{ background: "var(--accent)" }}
          />
          <span>v1 — live</span>
        </div>
      </header>

      {/* Main content */}
      <section className="mx-auto max-w-6xl px-8 sm:px-12 pt-32 pb-24 flex flex-col justify-center min-h-screen">

        {/* Eyebrow */}
        <p
          className="fade-up font-mono text-[11px] tracking-[0.35em] uppercase mb-10"
          style={{ animationDelay: "0ms", color: "var(--muted)" }}
        >
          Deployment ready
        </p>

        {/* Headline */}
        <div
          className="fade-up mb-10"
          style={{ animationDelay: "80ms" }}
        >
          <h1
            className="font-extrabold leading-[0.88] tracking-tight"
            style={{
              fontSize: "clamp(3.75rem, 11vw, 9.5rem)",
              color: "var(--text)",
            }}
          >
            Your first<br />
            Next.js app<br />
            <span style={{ color: "var(--accent)" }}>
              is&nbsp;ready
            </span>
            <span
              className="cursor-blink"
              style={{ color: "var(--accent)" }}
            >
              .
            </span>
          </h1>
        </div>

        {/* Subtext */}
        <p
          className="fade-up text-lg leading-relaxed max-w-md mb-16"
          style={{
            animationDelay: "180ms",
            color: "var(--muted)",
          }}
        >
          Ships with Docker Compose for local testing and a Hostess
          config for zero-friction deployment.
        </p>

        {/* Divider */}
        <div
          className="fade-up mb-10 w-full h-px line-grow"
          style={{
            animationDelay: "260ms",
            background: "var(--border)",
            animationFillMode: "both",
          }}
        />

        {/* Checks */}
        <div className="mb-12" style={{ borderTop: "none" }}>
          {checks.map((check, i) => (
            <div
              key={check}
              className="fade-up flex items-center gap-4 py-4"
              style={{
                animationDelay: `${300 + i * 70}ms`,
                borderBottom: "1px solid var(--border)",
              }}
            >
              <span
                className="font-mono text-lg leading-none shrink-0 dot-breathe"
                style={{
                  color: "var(--accent)",
                  animationDelay: `${i * 0.4}s`,
                }}
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

        {/* Commands */}
        <div
          className="fade-up flex flex-col sm:flex-row gap-3"
          style={{ animationDelay: "560ms" }}
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

      {/* Footer */}
      <footer
        className="fixed bottom-0 inset-x-0 flex items-center justify-between px-8 sm:px-12 py-4"
        style={{
          borderTop: "1px solid var(--border)",
          background: "var(--bg)",
        }}
      >
        <span
          className="font-mono text-[10px] tracking-[0.2em] uppercase"
          style={{ color: "var(--muted-2)" }}
        >
          awesome-hostess · simple-next-app
        </span>
        <span
          className="font-mono text-[10px]"
          style={{ color: "var(--muted-2)" }}
        >
          Next.js 16 · Tailwind v4
        </span>
      </footer>
    </main>
  );
}
