const hopByHopHeaders = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

function upstreamUrl(path, requestUrl) {
  const baseUrl = process.env.MEILI_URL;
  if (!baseUrl) throw new Error("MEILI_URL is not configured");

  const base = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const target = new URL(path.join("/"), base);
  target.search = new URL(requestUrl).search;
  return target;
}

async function proxy(request, context) {
  const params = await context.params;
  const path = params?.path || [];
  const headers = new Headers();

  for (const [key, value] of request.headers.entries()) {
    if (!hopByHopHeaders.has(key.toLowerCase()) && key.toLowerCase() !== "host") {
      headers.set(key, value);
    }
  }

  const body = request.method === "GET" || request.method === "HEAD" ? undefined : await request.arrayBuffer();
  const upstream = await fetch(upstreamUrl(path, request.url), {
    method: request.method,
    headers,
    body,
    cache: "no-store",
  });

  const responseHeaders = new Headers();
  const contentType = upstream.headers.get("content-type");
  if (contentType) responseHeaders.set("content-type", contentType);

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
