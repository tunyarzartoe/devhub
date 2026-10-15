import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Demo API tester proxy with safety controls.
 * Pre-allowlists common public sandbox endpoints and localhost.
 */
const ALLOWED_HOSTS = new Set([
  "jsonplaceholder.typicode.com",
  "httpbin.org",
  "api.github.com",
  "dummyjson.com",
  "reqres.in",
  "pokeapi.co",
  "catfact.ninja",
  "localhost",
  "127.0.0.1",
]);

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || !("url" in body) || typeof body.url !== "string") {
      return NextResponse.json({ error: "A valid URL is required." }, { status: 400 });
    }

    const targetUrl = body.url.trim();
    const url = new URL(targetUrl);

    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return NextResponse.json({ error: "Only HTTP and HTTPS URLs are allowed." }, { status: 400 });
    }

    // SSRF protection: check allowlist
    if (!ALLOWED_HOSTS.has(url.hostname)) {
      return NextResponse.json({
        error: `Host "${url.hostname}" is not allowlisted for server-side proxying. For security, only pre-approved sandbox endpoints (jsonplaceholder, httpbin, dummyjson, github, localhost) are proxied server-side. You can test directly via Client Fetch mode.`,
        allowlisted: false,
      }, { status: 403 });
    }

    const method = ("method" in body && typeof body.method === "string" ? body.method.toUpperCase() : "GET");
    const validMethods = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];
    if (!validMethods.includes(method)) {
      return NextResponse.json({ error: `Method ${method} is not supported.` }, { status: 400 });
    }

    // Prepare headers
    const requestHeaders: Record<string, string> = {
      "Accept": "application/json, text/plain, */*",
      "User-Agent": "DevHub-ApiWorkspace/1.0",
    };

    if ("headers" in body && body.headers && typeof body.headers === "object") {
      for (const [key, val] of Object.entries(body.headers as Record<string, unknown>)) {
        if (typeof val === "string" && key.toLowerCase() !== "host") {
          requestHeaders[key] = val;
        }
      }
    }

    const fetchOptions: RequestInit = {
      method,
      headers: requestHeaders,
      signal: AbortSignal.timeout(15000),
      cache: "no-store",
    };

    if (["POST", "PUT", "PATCH"].includes(method) && "body" in body && typeof body.body === "string" && body.body) {
      fetchOptions.body = body.body;
      if (!requestHeaders["Content-Type"]) {
        requestHeaders["Content-Type"] = "application/json";
      }
    }

    const response = await fetch(url, fetchOptions);
    const durationMs = Date.now() - startTime;
    const responseText = await response.text();

    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    return NextResponse.json({
      status: response.status,
      statusText: response.statusText,
      durationMs,
      headers: responseHeaders,
      data: responseText.slice(0, 100000), // up to 100KB preview
      sizeBytes: new Blob([responseText]).size,
    }, { status: 200 });
  } catch (error) {
    const durationMs = Date.now() - startTime;
    const message = error instanceof Error ? error.message : "Unexpected request error.";
    return NextResponse.json({
      error: `Request failed: ${message}`,
      durationMs,
    }, { status: 400 });
  }
}

