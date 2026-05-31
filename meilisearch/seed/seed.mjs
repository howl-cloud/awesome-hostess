import { readFile } from "node:fs/promises";

const meiliUrl = process.env.MEILI_URL;
const masterKey = process.env.MEILI_MASTER_KEY;

if (!meiliUrl) throw new Error("MEILI_URL is required");
if (!masterKey) throw new Error("MEILI_MASTER_KEY is required");

const baseUrl = meiliUrl.endsWith("/") ? meiliUrl.slice(0, -1) : meiliUrl;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function meili(path, options = {}) {
  const headers = new Headers(options.headers || {});
  headers.set("Authorization", `Bearer ${masterKey}`);
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
  });
  const text = await response.text();
  const payload = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new Error(payload.message || payload.error || `${response.status} ${response.statusText}`);
  }

  return payload;
}

async function waitForTask(task, label) {
  const taskUid = task.taskUid ?? task.uid;
  if (taskUid === undefined || taskUid === null) return;

  for (let attempt = 0; attempt < 60; attempt += 1) {
    const current = await meili(`/tasks/${taskUid}`);
    if (current.status === "succeeded") return;
    if (current.status === "failed" || current.status === "canceled") {
      throw new Error(`${label} task ${taskUid} ${current.status}: ${current.error?.message || "unknown error"}`);
    }
    await sleep(1000);
  }

  throw new Error(`${label} task ${taskUid} did not finish in time`);
}

async function createIndex() {
  const response = await fetch(`${baseUrl}/indexes`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${masterKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ uid: "books", primaryKey: "id" }),
  });
  const text = await response.text();
  const payload = text ? JSON.parse(text) : {};

  if (response.status === 202) {
    await waitForTask(payload, "index creation");
    return;
  }

  if (payload.code === "index_already_exists") return;

  throw new Error(payload.message || payload.error || `${response.status} ${response.statusText}`);
}

async function main() {
  const documents = JSON.parse(await readFile("/tmp/books.json", "utf8"));

  await createIndex();

  const settingsTask = await meili("/indexes/books/settings", {
    method: "PATCH",
    body: JSON.stringify({
      searchableAttributes: ["title", "author", "genre", "description"],
      displayedAttributes: ["id", "title", "author", "year", "genre", "description"],
      sortableAttributes: ["year"],
      filterableAttributes: ["genre", "year"],
    }),
  });
  await waitForTask(settingsTask, "settings");

  const documentsTask = await meili("/indexes/books/documents?primaryKey=id", {
    method: "POST",
    body: JSON.stringify(documents),
  });
  await waitForTask(documentsTask, "documents");

  console.log(`Seeded ${documents.length} books into Meilisearch index "books"`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
