"use client";

import { useEffect, useMemo, useState } from "react";

async function requestMeili(path, apiKey, options = {}) {
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");
  if (apiKey) headers.set("Authorization", `Bearer ${apiKey}`);

  const response = await fetch(`/api/meili${path}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new Error(payload.message || payload.error || response.statusText);
  }

  return payload;
}

function FieldValue({ value }) {
  if (value === null || value === undefined) return <span className="fv-null">null</span>;
  if (typeof value === "boolean") return <span className="fv-bool">{String(value)}</span>;
  if (typeof value === "number") return <span className="fv-num">{value}</span>;
  if (Array.isArray(value)) {
    const preview = value.slice(0, 3).map((v) => (typeof v === "object" ? "…" : String(v))).join(", ");
    return <span className="fv-array">[{preview}{value.length > 3 ? `, +${value.length - 3}` : ""}]</span>;
  }
  if (typeof value === "object") {
    return <span className="fv-obj">{JSON.stringify(value)}</span>;
  }
  const str = String(value);
  return <span title={str.length > 90 ? str : undefined}>{str.length > 90 ? str.slice(0, 90) + "…" : str}</span>;
}

const TITLE_KEYS = ["title", "name", "label", "heading", "subject", "question"];

function ResultCard({ hit, rank }) {
  const entries = Object.entries(hit).filter(([k]) => !k.startsWith("_"));
  const titleEntry = entries.find(([k]) => TITLE_KEYS.some((t) => k.toLowerCase().includes(t)));
  const titleValue = titleEntry ? String(titleEntry[1]) : null;
  const fields = titleEntry ? entries.filter(([k]) => k !== titleEntry[0]) : entries;

  return (
    <article className="resultCard">
      <div className="rcInner">
        <div className="rcHeader">
          <span className="rcRank">#{String(rank).padStart(2, "0")}</span>
          {titleValue && <p className="rcTitle">{titleValue}</p>}
        </div>
        <dl className="fieldGrid">
          {fields.map(([key, value]) => (
            <div className="fieldRow" key={key}>
              <dt className="fieldKey">{key}</dt>
              <dd className="fieldVal">
                <FieldValue value={value} />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </article>
  );
}

export default function Page() {
  const [apiKey, setApiKey] = useState("");
  const [savedKey, setSavedKey] = useState("");
  const [health, setHealth] = useState("checking");
  const [indexes, setIndexes] = useState([]);
  const [indexName, setIndexName] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [summary, setSummary] = useState({ title: "No query yet", hits: 0, latency: "0ms" });
  const [message, setMessage] = useState("Add a key, choose an index, then search documents.");

  const hasResults = results.length > 0;
  const statusLabel = useMemo(() => {
    if (health === "available") return "Available";
    if (health === "offline") return "Offline";
    return "Checking";
  }, [health]);

  async function loadHealth(key = savedKey) {
    try {
      const payload = await requestMeili("/health", key);
      setHealth(payload.status || "available");
    } catch {
      setHealth("offline");
    }
  }

  async function loadIndexes(key = savedKey) {
    try {
      const payload = await requestMeili("/indexes", key);
      const nextIndexes = payload.results || [];
      setIndexes(nextIndexes);
      if (!indexName && nextIndexes[0]?.uid) setIndexName(nextIndexes[0].uid);
      if (!nextIndexes.length) setMessage("No indexes found. You can still type an index name manually.");
    } catch (error) {
      setIndexes([]);
      setMessage(error.message);
    }
  }

  async function saveKey(event) {
    event.preventDefault();
    const nextKey = apiKey.trim();
    localStorage.setItem("meili-api-key", nextKey);
    setSavedKey(nextKey);
    await Promise.all([loadHealth(nextKey), loadIndexes(nextKey)]);
  }

  async function search(event) {
    event.preventDefault();
    if (!indexName.trim()) {
      setMessage("Choose or type an index first.");
      return;
    }

    try {
      const payload = await requestMeili(`/indexes/${encodeURIComponent(indexName.trim())}/search`, savedKey, {
        method: "POST",
        body: JSON.stringify({ q: query.trim(), limit: 20 }),
      });

      const hits = payload.hits || [];
      setResults(hits);
      setSummary({
        title: query.trim() ? `"${query.trim()}"` : "All documents",
        hits: payload.estimatedTotalHits ?? hits.length,
        latency: `${payload.processingTimeMs || 0}ms`,
      });
      setMessage(hits.length ? "" : "No matching documents.");
    } catch (error) {
      setResults([]);
      setMessage(error.message);
    }
  }

  useEffect(() => {
    const storedKey = localStorage.getItem("meili-api-key") || "";
    setApiKey(storedKey);
    setSavedKey(storedKey);
    loadHealth(storedKey);
    loadIndexes(storedKey);
  }, []);

  const showIndexChips = indexes.length > 0 && indexes.length <= 8;

  return (
    <div className="app">
      {/* ── Header ── */}
      <header className="appHeader">
        <div className="headerInner">
          <div className="headerBrand">
            <span className="brandIcon" aria-hidden="true">
              <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                <path d="M2 8.5C2 4.91 4.91 2 8.5 2C12.09 2 15 4.91 15 8.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                <path d="M2 8.5C2 12.09 4.91 15 8.5 15C12.09 15 15 12.09 15 8.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeOpacity="0.35"/>
                <circle cx="8.5" cy="8.5" r="2" fill="currentColor"/>
              </svg>
            </span>
            <span className="brandName">Meilisearch Console</span>
            <span className="brandSep">/</span>
            <span className="brandSub">hostess</span>
          </div>
          <div className={`statusBadge ${health === "available" ? "status-ok" : health === "offline" ? "status-bad" : "status-checking"}`}>
            <span className="statusDot" />
            {statusLabel}
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="appMain">
        <div className="container">

          {/* Controls */}
          <div className="controlRow">

            {/* API key */}
            <form className="card" onSubmit={saveKey}>
              <label className="cardLabel" htmlFor="apiKey">API Key</label>
              <div className="inputRow">
                <input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Paste a Meilisearch key…"
                  autoComplete="off"
                  className="textInput"
                />
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
              <p className="cardHint">Use a search-only key for daily use. The master key works but should stay private.</p>
            </form>

            {/* Index + search */}
            <form className="card" onSubmit={search}>
              <div className="cardLabelRow">
                <label className="cardLabel" htmlFor="indexName">Index</label>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => loadIndexes()}>
                  ↻ Refresh
                </button>
              </div>

              {showIndexChips ? (
                <div className="indexChips">
                  {indexes.map((idx) => (
                    <button
                      key={idx.uid}
                      type="button"
                      className={`indexChip${indexName === idx.uid ? " indexChipActive" : ""}`}
                      onClick={() => setIndexName(idx.uid)}
                    >
                      {idx.uid}
                    </button>
                  ))}
                </div>
              ) : (
                <>
                  <input
                    id="indexName"
                    list="indexOptions"
                    value={indexName}
                    onChange={(e) => setIndexName(e.target.value)}
                    placeholder="products"
                    className="textInput"
                  />
                  <datalist id="indexOptions">
                    {indexes.map((index) => (
                      <option key={index.uid} value={index.uid} />
                    ))}
                  </datalist>
                </>
              )}

              <div className="searchGap">
                <label className="cardLabel" htmlFor="query">Query</label>
                <div className="searchRow">
                  <div className="searchInputWrap">
                    <span className="searchIcon" aria-hidden="true">
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                        <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
                        <path d="M10 10L13.5 13.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                      </svg>
                    </span>
                    <input
                      id="query"
                      type="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search documents…"
                      className="searchInput"
                    />
                  </div>
                  <button type="submit" className="btn btn-primary">Search</button>
                </div>
              </div>
            </form>
          </div>

          {/* Results header */}
          <div className="resultsHeader">
            <div className="resultsTitleGroup">
              <span className="resultsSectionLabel">Results</span>
              {hasResults && <span className="resultsQuery">{summary.title}</span>}
            </div>
            <div className="metricChips">
              <div className="metricChip">
                <span className="metricNum">{summary.hits}</span>
                <span className="metricLabel">hits</span>
              </div>
              <div className="metricChip">
                <span className="metricNum">{summary.latency}</span>
                <span className="metricLabel">latency</span>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="results">
            {hasResults ? (
              results.map((hit, index) => (
                <ResultCard
                  key={`${index}-${JSON.stringify(hit).slice(0, 80)}`}
                  hit={hit}
                  rank={index + 1}
                />
              ))
            ) : (
              <div className="emptyState">
                <span className="emptyIcon" aria-hidden="true">
                  <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
                    <circle cx="15" cy="15" r="10" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M22.5 22.5L30 30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M11 15H19M15 11V19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </span>
                <p className="emptyTitle">{message || "No results yet."}</p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
