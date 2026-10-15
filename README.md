# DevHub — All-in-One Developer Platform

A high-performance dark-terminal developer workspace built with Next.js 16, React 19, TypeScript, and Tailwind CSS v4.

Designed for engineers who want fast, privacy-focused, local-first developer utilities alongside an integrated REST API workspace and AI engineering assistant.

---

## 🛠 Features & Included Tools

### ⚡ Core Workspace
- **Command Palette (`Cmd + K` / `Ctrl + K`)**: Instant keyboard-driven tool launcher with live search and arrow key navigation (`↑`, `↓`, `Enter`, `ESC`).
- **Live Terminal Dashboard**: System clock (UTC & Local), tool statistics, category filtering, and quick-action shortcuts.
- **Favorites & Pinning**: Pin your most frequently used tools to the top of the sidebar and dashboard.
- **Clipboard Integration**: One-click copy controls with persistent toast notifications.
- **Responsive Terminal UI**: Full sidebar on desktop with quick drawer on mobile devices.

### 📦 Complete Developer Toolkit (19 Tools)

| Category | Tool | Capabilities |
| :--- | :--- | :--- |
| **Format & Convert** | **JSON Formatter** | Validate, Pretty Print (2-space), Minify, Sort Keys, Fix Common Errors (trailing commas, single quotes), and Unescape stringified JSON. |
| **Format & Convert** | **JSON to TS** | Generate strict TypeScript interfaces & types from any JSON object or array with custom root naming. |
| **Format & Convert** | **Base64 Codec** | UTF-8 safe encode/decode (supports all emojis and unicode without `URIError`), plus URL-Safe Base64 mode. |
| **Format & Convert** | **Timestamp Converter** | Unix Epoch (seconds & ms) to ISO 8601, UTC, Local time, relative time ("5m ago"), and Date-to-Epoch converter. |
| **Format & Convert** | **Cron Parser** | Parse 5-part cron expressions into human-readable English and calculate the next 5 upcoming trigger dates. |
| **Format & Convert** | **Base Converter** | Simultaneous 4-way interactive converter across Decimal (Base 10), Hexadecimal (Base 16), Binary (Base 2), and Octal (Base 8). |
| **Format & Convert** | **Color Converter** | Convert between HEX, RGB, HSL with visual preview swatches and native HTML5 color picker. |
| **Format & Convert** | **SQL Formatter** | Format queries with uppercase keywords & indentation, or minify SQL to a single line. |
| **Security & Auth** | **JWT Debugger** | Decode JSON Web Tokens (Header, Payload, Signature), inspect claims, and check expiry (`exp`/`iat`). |
| **Security & Auth** | **Password & Token Gen** | Generate random passwords and API tokens (4–128 chars) with entropy score (Fort Knox, Strong, Weak). |
| **Security & Auth** | **Hash & Checksum** | Compute SHA-256, SHA-512, SHA-1, MD5, CRC-32, and HMAC digests, with a live **Checksum Matcher / Verifier**. |
| **Security & Auth** | **UUID & ID Generator** | Generate UUID v4, UUID v7 (timestamp-ordered RFC 9562), NanoID (21 chars), and ULID in bulk (1–50). |
| **Network & Web** | **API Workspace** | **Dual Execution Mode**: Safe Server Proxy or Direct Browser Fetch (CORS). Full REST client (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS) with custom Headers, JSON Body editor, latency timing (ms), status badges, response headers, **Import cURL**, and **Export as cURL**. |
| **Network & Web** | **URL Codec & Parser** | Encode/Decode URI components, convert HTML entities (`&amp;`, `&lt;`, `&gt;`), and parse URLs into protocol, host, port, path, hash, and interactive query parameters table. |
| **Text & Inspection** | **Regex Tester** | Test regex patterns with flags (`gim`), match highlights, capture groups inspection, substitution/replace mode, and common presets (Email, URL, IPv4, Hex Color, Slug). |
| **Text & Inspection** | **Diff Checker** | Line-by-line unified diff comparison with additions, deletions, line gutters, and change counters. |
| **Text & Inspection** | **Markdown Preview** | Split-pane live GitHub-flavored Markdown editor with instant preview and word counter. |
| **Text & Inspection** | **Lorem & Mock Data** | Generate placeholder paragraphs, sentences, words, or full mock JSON developer fixtures. |
| **Workspace** | **AI Assistant** | Multi-turn software engineering copilot with prompt starters, custom model selector (`gpt-4o-mini`, `gpt-4o`, `gpt-4.1-mini`), and support for custom OpenAI API keys directly in browser storage. |

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

All developer tools run 100% locally in your browser using standard Web Crypto and Web APIs.

---

## 🌐 API Workspace: Dual Engine

1. **Safe Proxy Mode (Default)**:
   Routes requests through Next.js server-side proxy (`/api/proxy`) with SSRF protection.
   Pre-approved sandbox hosts:
   - `jsonplaceholder.typicode.com`
   - `httpbin.org`
   - `api.github.com`
   - `dummyjson.com`
   - `reqres.in`
   - `pokeapi.co`
   - `catfact.ninja`
   - `localhost` & `127.0.0.1`

2. **Direct Browser Fetch Mode (CORS)**:
   Sends the request directly from the user's browser. Allows testing any local microservice on any port (e.g., `http://localhost:8080`, `http://127.0.0.1:5000`) or any public CORS-enabled API without server allowlist restrictions.

3. **cURL Import & Export**:
   Paste any `curl` command into the "Import cURL" tab to automatically fill Method, URL, Headers, and Body. Click "cURL" in the header to generate a reproduction command.

---

## 🤖 Configuring AI (Optional)

The developer tools work without an API key. To enable the AI Assistant:

1. **Option A (Browser Setting)**: Open the **AI Assistant** in DevHub, click **Settings**, and paste your OpenAI API key. Stored privately in browser `localStorage`.
2. **Option B (Server Environment)**: Add your API key to `.env.local`:
   ```env
   OPENAI_API_KEY=sk-...
   OPENAI_MODEL=gpt-4o-mini
   ```

---

## 📦 Scripts

- `npm run dev` — Run local development server
- `npm run build` — Compile and bundle production build
- `npm start` — Run production server
- `npm run lint` — Run ESLint check
