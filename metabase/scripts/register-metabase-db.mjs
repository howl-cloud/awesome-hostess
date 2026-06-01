const metabaseUrl = requiredEnv("METABASE_URL").replace(/\/+$/, "");
const adminEmail = requiredEnv("METABASE_ADMIN_EMAIL");
const adminPassword = requiredEnv("METABASE_ADMIN_PASSWORD");
const databaseName = process.env.METABASE_DATABASE_NAME || "Business Demo";
const siteName = process.env.METABASE_SITE_NAME || "Hostess Metabase Demo";
const schemaName = process.env.METABASE_SCHEMA || "business";

const pg = {
  host: requiredEnv("PGHOST"),
  port: Number.parseInt(requiredEnv("PGPORT"), 10),
  database: requiredEnv("PGDATABASE"),
  user: requiredEnv("PGUSER"),
  password: requiredEnv("PGPASSWORD"),
};

if (!Number.isInteger(pg.port)) {
  throw new Error(`PGPORT must be an integer, got ${process.env.PGPORT}`);
}

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function request(path, options = {}) {
  const headers = new Headers(options.headers || {});
  headers.set("Accept", "application/json");

  if (options.session) {
    headers.set("X-Metabase-Session", options.session);
  }
  if (options.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${metabaseUrl}${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const text = await response.text();
  let payload = {};
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { message: text };
    }
  }

  if (!response.ok && !options.allowedStatuses?.includes(response.status)) {
    const message = payload.message || payload.error || response.statusText;
    throw new Error(`${options.method || "GET"} ${path} failed: ${response.status} ${message}`);
  }

  return { status: response.status, payload };
}

async function waitForMetabase() {
  let lastError;

  for (let attempt = 0; attempt < 180; attempt += 1) {
    try {
      const response = await fetch(`${metabaseUrl}/api/health`);
      if (response.ok) return;
      lastError = new Error(`health returned ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await sleep(1000);
  }

  throw new Error(`Metabase did not become healthy: ${lastError?.message || "unknown error"}`);
}

async function getSetupToken() {
  const { payload } = await request("/api/session/properties");
  return payload["setup-token"] || payload.setup_token || null;
}

async function setupFirstAdmin(token) {
  const { status, payload } = await request("/api/setup", {
    method: "POST",
    allowedStatuses: [403],
    body: {
      token,
      user: {
        first_name: "Hostess",
        last_name: "Admin",
        email: adminEmail,
        password: adminPassword,
      },
      prefs: {
        site_name: siteName,
        site_locale: "en",
        allow_tracking: false,
      },
    },
  });

  if (status === 403) {
    return null;
  }

  return payload.id || payload["session-id"] || payload.session_id;
}

async function login() {
  const { payload } = await request("/api/session", {
    method: "POST",
    body: {
      username: adminEmail,
      password: adminPassword,
    },
  });

  if (!payload.id) {
    throw new Error("Metabase login did not return a session id");
  }
  return payload.id;
}

async function getSession() {
  const token = await getSetupToken();
  if (token) {
    const setupSession = await setupFirstAdmin(token);
    if (setupSession) {
      console.log(`Created Metabase admin ${adminEmail}`);
      return setupSession;
    }
  }

  return login();
}

function databaseList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  return [];
}

async function findDatabase(session) {
  const { payload } = await request("/api/database", { session });
  return databaseList(payload).find((database) => database.name === databaseName);
}

async function createDatabase(session) {
  const { payload } = await request("/api/database", {
    method: "POST",
    session,
    body: {
      name: databaseName,
      engine: "postgres",
      details: {
        host: pg.host,
        port: pg.port,
        dbname: pg.database,
        user: pg.user,
        password: pg.password,
        ssl: false,
        "schema-filters-type": "inclusion",
        "schema-filters-patterns": schemaName,
        "tunnel-enabled": false,
        "advanced-options": false,
      },
      auto_run_queries: true,
      is_full_sync: true,
      is_on_demand: false,
    },
  });

  return payload;
}

async function syncDatabase(session, databaseId) {
  await request(`/api/database/${databaseId}/sync_schema`, {
    method: "POST",
    session,
  });
  await request(`/api/database/${databaseId}/rescan_values`, {
    method: "POST",
    session,
  });
}

async function main() {
  await waitForMetabase();

  const session = await getSession();
  let database = await findDatabase(session);

  if (!database) {
    database = await createDatabase(session);
    console.log(`Registered Metabase database "${databaseName}"`);
  } else {
    console.log(`Metabase database "${databaseName}" already exists`);
  }

  if (!database.id) {
    throw new Error(`Metabase database "${databaseName}" did not include an id`);
  }

  await syncDatabase(session, database.id);
  console.log(`Synced Metabase database "${databaseName}"`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
