# DevHub — All-in-One Developer Platform

A high-performance dark-terminal developer workspace built with Next.js 16, React 19, TypeScript, and Tailwind CSS v4.

Designed for engineers who want fast, privacy-focused, local-first developer utilities alongside an integrated REST API tester and AI engineering assistant.

---

## 🛠 Features & Included Tools

### ⚡ Core Workspace
- **Command Palette (`Cmd + K` / `Ctrl + K`)**: Instant keyboard-driven tool launcher and search.
- **Terminal Dashboard**: Overview of tools, live system status, category filters, and quick start shortcuts.
- **Favorites & Pinning**: Pin frequently used tools (stored in `localStorage`).
- **Clipboard Integration**: One-click copy with toast notifications.
- **Responsive Terminal UI**: Full desktop sidebar + mobile drawer layout.

### 📦 Complete Developer Toolkit (15 Tools)

| Category | Tool | Capabilities |
| :--- | :--- | :--- |
| **Format & Convert** | **JSON Formatter** | Validate, Pretty Print (2-space), Minify, Sort Keys, statistics (byte size & key count). |
| **Format & Convert** | **Base64 Codec** | UTF-8 text encoding/decoding, URL-Safe Base64 mode (`-` and `_` with padding strip). |
| **Format & Convert** | **Timestamp Converter** | Unix Epoch (seconds & ms) to ISO 8601, UTC, Local time, relative time ("5m ago"), and Date-to-Epoch. |
| **Format & Convert** | **Color Converter** | Convert between HEX, RGB, HSL with visual preview swatch and native color picker. |
| **Format & Convert** | **SQL Formatter** | Format queries with uppercase keywords & indentation, or minify SQL to a single line. |
| **Security & Auth** | **JWT Debugger** | Decode JSON Web Tokens (Header, Payload, Signature), inspect claims, and check expiry (`exp`/`iat`). |
| **Security & Auth** | **Hash & HMAC** | Compute SHA-256, SHA-512, SHA-1, MD5 digests, plus HMAC with optional secret key. |
| **Security & Auth** | **UUID & ID Generator** | Generate UUID v4, UUID v7 (timestamp-ordered), NanoID (21 chars), and ULID in bulk (1–50) with case/hyphen toggles. |
| **Network & Web** | **API Workspace** | Full REST HTTP client (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS) with custom Headers, JSON Body editor, latency timing (ms), status badges, response headers, and **Copy as cURL**. |
| **Network & Web** | **URL Codec & Parser** | Encode/Decode URI components and parse URLs into protocol, host, port, path, hash, and interactive query parameters table. |
| **Text & Inspection** | **Regex Tester** | Test regex patterns with flags (`gim`), match highlights, capture groups inspection, substitution/replace mode, and common presets (Email, URL, IPv4, Hex). |
| **Text & Inspection** | **Diff Checker** | Line-by-line unified diff comparison with additions, deletions, line gutters, and change counters. |
| **Text & Inspection** | **Markdown Preview** | Split-pane live GitHub-flavored Markdown editor with instant preview and word counter. |
| **Text & Inspection** | **Lorem & Mock Data** | Generate placeholder paragraphs, sentences, words, or full mock JSON developer fixtures. |
| **Workspace** | **AI Assistant** | Multi-turn software engineering copilot with prompt starters, custom model selector (`gpt-4o-mini`, `gpt-4o`), and support for custom OpenAI API keys directly in the browser. |

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

All developer tools run 100% locally using client-side Web Crypto and standard APIs.

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

## 🌐 API Workspace & Safe Proxy

The API Workspace includes a server-side proxy route (`src/app/api/proxy/route.ts`) to enable testing remote APIs while defending against SSRF. Pre-approved sandbox endpoints include:
- `jsonplaceholder.typicode.com`
- `httpbin.org`
- `api.github.com`
- `dummyjson.com`
- `reqres.in`
- `pokeapi.co`
- `catfact.ninja`
- `localhost` & `127.0.0.1`

You can customize `ALLOWED_HOSTS` in `src/app/api/proxy/route.ts` to include your own internal or staging API domains.

---

## 📦 Scripts

- `npm run dev` — Run local development server
- `npm run build` — Compile and bundle production build
- `npm start` — Run production server
- `npm run lint` — Run ESLint check
