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
        title: query.trim() ? `Search: "${query.trim()}"` : "All documents",
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

  return (
    <main className="shell">
      <section className="mast">
        <div>
          <p className="eyebrow">Hostess search surface</p>
          <h1>Meilisearch Console</h1>
        </div>
        <div className={`status ${health === "available" ? "is-ok" : health === "offline" ? "is-bad" : ""}`}>
          <span className="statusDot" />
          <span>{statusLabel}</span>
        </div>
      </section>

      <section className="controlGrid">
        <form className="panel" onSubmit={saveKey}>
          <label htmlFor="apiKey">API key</label>
          <div className="inlineRow">
            <input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
              placeholder="Paste a Meilisearch key"
              autoComplete="off"
            />
            <button type="submit">Save</button>
          </div>
          <p className="hint">Use a search-only key for daily search. The master key works but should stay private.</p>
        </form>

        <form className="panel searchPanel" onSubmit={search}>
          <div className="searchTopline">
            <label htmlFor="indexName">Index</label>
            <button className="ghostButton" type="button" onClick={() => loadIndexes()}>
              Refresh
            </button>
          </div>
          <input
            id="indexName"
            list="indexOptions"
            value={indexName}
            onChange={(event) => setIndexName(event.target.value)}
            placeholder="products"
          />
          <datalist id="indexOptions">
            {indexes.map((index) => (
              <option key={index.uid} value={index.uid} />
            ))}
          </datalist>
          <label htmlFor="query">Query</label>
          <div className="inlineRow">
            <input
              id="query"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search documents"
            />
            <button type="submit">Search</button>
          </div>
        </form>
      </section>

      <section className="resultsHead">
        <div>
          <p className="eyebrow">Results</p>
          <h2>{summary.title}</h2>
        </div>
        <div className="metricStrip">
          <div>
            <span>{summary.hits}</span>
            <small>hits</small>
          </div>
          <div>
            <span>{summary.latency}</span>
            <small>latency</small>
          </div>
        </div>
      </section>

      <section className="results">
        {hasResults ? (
          results.map((hit, index) => (
            <article className="resultCard" data-rank={String(index + 1).padStart(2, "0")} key={`${index}-${JSON.stringify(hit).slice(0, 80)}`}>
              <pre>{JSON.stringify(hit, null, 2)}</pre>
            </article>
          ))
        ) : (
          <article className="emptyState">
            <h3>{message || "No results yet."}</h3>
            <p>The Next.js app keeps Meilisearch private and proxies API calls through its server route.</p>
          </article>
        )}
      </section>
    </main>
  );
}
