# DevHub v2.1.0 — All-in-One Developer Platform

A high-performance dark-terminal developer workspace built with Next.js 16, React 19, TypeScript, and Tailwind CSS v4.

Designed for engineers who want fast, privacy-focused, local-first developer utilities alongside an integrated REST API tester and AI engineering copilot.

---

## 🛠 Features & Included Tools

### ⚡ Core Workspace
- **Command Palette (`Cmd + K` / `Ctrl + K`)**: Instant keyboard-driven tool launcher and fuzzy search across all 22 utilities.
- **Terminal Dashboard**: Overview of tools, live system status, category filters, and quick start shortcuts.
- **Favorites & Pinning**: Pin frequently used tools to the top of the workspace (persisted in `localStorage`).
- **Clipboard Integration**: One-click copy with toast notifications.
- **Responsive Terminal UI**: Full desktop sidebar + mobile drawer layout.

### 📦 Complete Developer Toolkit (22 Tools)

| Category | Tool | Capabilities |
| :--- | :--- | :--- |
| **Format & Convert** | **JSON Formatter** | Validate, Pretty Print (2-space), Minify, Sort Keys, statistics (byte size & key count). |
| **Format & Convert** | **JSON to TypeScript** | Automatically infer TypeScript `interface` & `type` definitions from any JSON payload with nested object support. |
| **Format & Convert** | **Base64 Codec** | UTF-8 text encoding/decoding, URL-Safe Base64 mode (`-` and `_` with padding strip). |
| **Format & Convert** | **HTML & Text Codec** | Encode/decode HTML entities (`&`, `<`, `>`, quotes, copyright, etc.), Unicode escape sequences (`\uXXXX`), and unescapes. |
| **Format & Convert** | **Timestamp Converter** | Unix Epoch (seconds & ms) to ISO 8601, UTC, Local time, relative time ("5m ago"), and Date-to-Epoch. |
| **Format & Convert** | **Color Converter** | Convert between HEX, RGB, HSL with visual preview swatch, native color picker, and CSS code copy. |
| **Format & Convert** | **CSS Units & Clamp** | Convert px, rem, em with customizable base font size, plus CSS `clamp(min, preferred, max)` fluid typography generator. |
| **Format & Convert** | **SQL Formatter** | Format queries with uppercase keywords & indentation, or minify SQL to a single line. |
| **Security & Auth** | **UUID & ID Generator** | Generate UUID v4, UUID v7 (timestamp-ordered RFC 9562), NanoID (21 chars), and ULID in bulk (1–50) with case/hyphen toggles. |
| **Security & Auth** | **Password & Entropy** | Cryptographic secret generator with customizable character pools, Shannon entropy (bits), and brute-force time estimates. |
| **Security & Auth** | **JWT Debugger** | Decode JSON Web Tokens (Header, Payload, Signature), inspect claims, and check expiry (`exp`/`iat`). |
| **Security & Auth** | **Hash & HMAC** | Compute SHA-256, SHA-512, SHA-1, MD5 digests, plus HMAC with optional secret key. |
| **Security & Auth** | **Chmod Calculator** | Interactive visual Linux permissions matrix (Owner, Group, Others) generating octal (`755`, `644`) and symbolic notations. |
| **Network & Web** | **API Workspace** | REST HTTP client (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS) with **Environment Variables** (`{{baseUrl}}`), Headers, JSON Body, latency timing (ms), and **Copy as cURL**. |
| **Network & Web** | **URL Codec & Parser** | Encode/Decode URI components and parse URLs into protocol, host, port, path, hash, and interactive query parameters table. |
| **Network & Web** | **HTTP Status Codes** | Searchable reference of standard HTTP response codes (1xx–5xx) with descriptions and debugging guidelines. |
| **Text & Inspection** | **Regex Tester** | Test regex patterns with flags (`gim`), match highlights, capture groups inspection, substitution/replace mode, and common presets. |
| **Text & Inspection** | **Diff Checker** | Line-by-line unified diff comparison with additions, deletions, line gutters, and change counters. |
| **Text & Inspection** | **Markdown Preview** | Split-pane live GitHub-flavored Markdown editor with instant preview and word counter. |
| **Text & Inspection** | **Lorem & Mock Data** | Generate placeholder paragraphs, sentences, words, or full mock JSON developer fixtures. |
| **Workspace & Scheduling** | **Cron Parser** | Translate 5-part cron expressions into plain English schedules and calculate the next 5 upcoming executions in local time. |
| **Workspace & AI** | **AI Assistant** | Multi-turn software engineering copilot with prompt starters, model selector (`gpt-4o-mini`, `gpt-4o`), custom browser API key support, and Markdown export. |

---

## 🚀 Getting Started

### Requirements
- Node.js 18+ (Node.js 20+ or 24.x recommended)
- npm

### Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env.local

# 3. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

All developer tools run 100% locally using client-side Web Crypto and standard browser APIs.

---

## 🤖 Configuring AI (Optional)

The developer tools work without an API key. To enable the AI Assistant, you can either:

1. **Option A (Browser Setting)**: Open the **AI Assistant** tool in DevHub, click **Settings**, and paste your OpenAI API key. It is stored privately in your browser's `localStorage`.
2. **Option B (Server Environment)**: Add your API key to `.env.local`:
   ```env
   OPENAI_API_KEY=sk-...
   OPENAI_MODEL=gpt-4o-mini
   ```

---

## 🌐 API Workspace & Environment Variables

The API Workspace includes:
- **Environment Variables**: Define reusable variables like `baseUrl` or `token` and interpolate them anywhere in URLs or headers using `{{variableName}}`.
- **Copy as cURL**: Generate precise shell commands for terminal execution.
- **Server-Side Safe Proxy**: Pre-approved endpoints include `jsonplaceholder.typicode.com`, `httpbin.org`, `api.github.com`, `dummyjson.com`, `reqres.in`, `pokeapi.co`, `catfact.ninja`, `localhost`, and `127.0.0.1`.

You can customize `ALLOWED_HOSTS` in `src/app/api/proxy/route.ts` to include your own internal or staging API domains.

---

## 📦 Scripts

- `npm run dev` — Run local development server
- `npm run build` — Compile and bundle production build
- `npm start` — Run production server
- `npm run lint` — Run ESLint check
