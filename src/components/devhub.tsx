"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowDownToLine, ArrowRight, Braces, Check, Clock3, Command, Copy,
  FileJson, Hash, LayoutDashboard, Menu, Regex, Search, Send,
  Sparkles, Terminal, WandSparkles, Workflow, Zap, Key, Lock, Globe, Split,
  Palette, Database, FileText, Code2, History, RotateCcw, X, Star,
  SlidersHorizontal, ChevronRight, Binary, CalendarClock, KeyRound,
  DownloadCloud, CheckCheck, RefreshCw, CodeXml
} from "lucide-react";
import {
  computeHash, computeLineDiff, decodeJwt, formatSql, generateNanoId,
  generateUlid, generateUuidV7, utf8ToBase64, base64ToUtf8, jsonToTypeScript,
  explainCron, convertNumberBase, encodeHtmlEntities, decodeHtmlEntities,
  parseCurl, generatePassword, type DecodedJwt, type DiffLine, type NumberBases
} from "@/lib/utils";

type View =
  | "Overview"
  | "JSON Formatter"
  | "Base64 Codec"
  | "UUID Generator"
  | "Regex Tester"
  | "Timestamp Converter"
  | "JWT Debugger"
  | "Hash Generator"
  | "URL Codec"
  | "Diff Checker"
  | "Color Converter"
  | "SQL Formatter"
  | "Markdown Preview"
  | "Lorem Generator"
  | "API Workspace"
  | "AI Assistant"
  | "JSON to TS"
  | "Cron Parser"
  | "Password Gen"
  | "Base Converter";

type ToolCategory = "All" | "Format & Convert" | "Security" | "Network" | "Text" | "Workspace";

type Tool = {
  name: View;
  description: string;
  icon: typeof Braces;
  tag: string;
  category: ToolCategory;
};

const tools: Tool[] = [
  { name: "JSON Formatter", description: "Validate, format, sort keys, unescape and clean JSON payloads.", icon: FileJson, tag: "FORMAT", category: "Format & Convert" },
  { name: "JSON to TS", description: "Convert JSON objects and arrays into TypeScript interfaces.", icon: CodeXml, tag: "TYPES", category: "Format & Convert" },
  { name: "Base64 Codec", description: "UTF-8 safe encode/decode with optional URL-Safe Base64 mode.", icon: ArrowDownToLine, tag: "ENCODE", category: "Format & Convert" },
  { name: "UUID Generator", description: "Generate v4, v7 (time-ordered), NanoID, or ULIDs in bulk.", icon: Hash, tag: "GENERATE", category: "Security" },
  { name: "Password Gen", description: "Generate strong passwords and tokens with live entropy score.", icon: KeyRound, tag: "AUTH", category: "Security" },
  { name: "Regex Tester", description: "Test regular expressions with groups, replacement, and cheat sheets.", icon: Regex, tag: "TEST", category: "Text" },
  { name: "Timestamp Converter", description: "Convert Unix epoch to dates, relative time, and live clock.", icon: Clock3, tag: "CONVERT", category: "Format & Convert" },
  { name: "Cron Parser", description: "Explain cron schedules in English and compute upcoming runs.", icon: CalendarClock, tag: "CRON", category: "Format & Convert" },
  { name: "JWT Debugger", description: "Decode and inspect JSON Web Tokens, headers, and expiry status.", icon: Key, tag: "AUTH", category: "Security" },
  { name: "Hash Generator", description: "Compute SHA-256, SHA-512, MD5, CRC-32, and HMAC digests.", icon: Lock, tag: "CRYPTO", category: "Security" },
  { name: "URL Codec", description: "Encode/decode URLs, parse query params, and HTML entities.", icon: Globe, tag: "URL", category: "Network" },
  { name: "Base Converter", description: "Simultaneous 4-way Decimal, Hex, Binary, and Octal converter.", icon: Binary, tag: "MATH", category: "Format & Convert" },
  { name: "Diff Checker", description: "Compare two text or code snippets line-by-line with diff markers.", icon: Split, tag: "DIFF", category: "Text" },
  { name: "Color Converter", description: "Convert HEX, RGB, HSL color codes with live swatch & picker.", icon: Palette, tag: "COLOR", category: "Format & Convert" },
  { name: "SQL Formatter", description: "Format SQL queries with uppercase keywords & indentation.", icon: Database, tag: "SQL", category: "Format & Convert" },
  { name: "Markdown Preview", description: "Live split-pane markdown editor with preview & word count.", icon: FileText, tag: "MARKDOWN", category: "Text" },
  { name: "Lorem Generator", description: "Generate placeholder text, sentences, or mock JSON users.", icon: Code2, tag: "MOCK", category: "Text" },
  { name: "API Workspace", description: "REST client with cURL import/export, headers, and latency.", icon: Workflow, tag: "API", category: "Workspace" },
  { name: "AI Assistant", description: "Engineering copilot for debugging, architecture, and tests.", icon: Sparkles, tag: "AI", category: "Workspace" },
];

const starterJson = '{\n  "name": "DevHub",\n  "version": "2.0.0",\n  "status": "ready",\n  "features": ["tools", "api-workspace", "ai-assistant"]\n}';

type ApiHistoryItem = {
  id: string;
  timestamp: string;
  method: string;
  url: string;
  status?: number;
  durationMs?: number;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function DevHub() {
  const [view, setView] = useState<View>("Overview");
  const [categoryFilter, setCategoryFilter] = useState<ToolCategory>("All");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [cmdSearch, setCmdSearch] = useState("");
  const [cmdSelectedIndex, setCmdSelectedIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState("");

  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("devhub_favorites");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return ["JSON Formatter", "API Workspace", "AI Assistant", "JSON to TS"];
  });

  // --- JSON Formatter State ---
  const [jsonInput, setJsonInput] = useState(starterJson);
  const [jsonOutput, setJsonOutput] = useState("");
  const [jsonMode, setJsonMode] = useState<"pretty" | "minify">("pretty");
  const [jsonStats, setJsonStats] = useState<{ keys: number; bytes: number } | null>(null);

  // --- JSON to TypeScript State ---
  const [jsonTsInput, setJsonTsInput] = useState(starterJson);
  const [jsonTsOutput, setJsonTsOutput] = useState("");
  const [jsonTsRootName, setJsonTsRootName] = useState("DevHubConfig");

  // --- Base64 State ---
  const [base64Input, setBase64Input] = useState("Hello, DevHub Developer Workspace! 🚀");
  const [base64Output, setBase64Output] = useState("");
  const [base64Mode, setBase64Mode] = useState<"encode" | "decode">("encode");
  const [urlSafeBase64, setUrlSafeBase64] = useState(false);

  // --- UUID / ID State ---
  const [uuidType, setUuidType] = useState<"v4" | "v7" | "nanoid" | "ulid">("v4");
  const [uuidCount, setUuidCount] = useState("5");
  const [uuidUppercase, setUuidUppercase] = useState(false);
  const [uuidNoHyphens, setUuidNoHyphens] = useState(false);
  const [uuidOutput, setUuidOutput] = useState("");

  // --- Password Generator State ---
  const [passLength, setPassLength] = useState("16");
  const [passUpper, setPassUpper] = useState(true);
  const [passLower, setPassLower] = useState(true);
  const [passNumbers, setPassNumbers] = useState(true);
  const [passSymbols, setPassSymbols] = useState(true);
  const [passAvoidAmbiguous, setPassAvoidAmbiguous] = useState(false);
  const [passResult, setPassResult] = useState<{ password: string; entropyBits: number } | null>(null);

  // --- Regex Tester State ---
  const [pattern, setPattern] = useState("\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}\\b");
  const [flags, setFlags] = useState("g");
  const [testText, setTestText] = useState("Contact team@devhub.dev or support@company.org for assistance.");
  const [regexReplace, setRegexReplace] = useState("");
  const [regexOutput, setRegexOutput] = useState("");
  const [regexMatches, setRegexMatches] = useState<Array<{ match: string; index: number; groups: string[] }>>([]);

  // --- Timestamp State ---
  const [timestampInput, setTimestampInput] = useState(() => String(Math.floor(Date.now() / 1000)));
  const [dateInput, setDateInput] = useState("");
  const [timestampOutput, setTimestampOutput] = useState("");

  // --- Cron Parser State ---
  const [cronInput, setCronInput] = useState("*/15 * * * *");
  const [cronResult, setCronResult] = useState<{ explanation: string; nextRuns: string[]; error?: string } | null>(null);

  // --- JWT Debugger State ---
  const [jwtToken, setJwtToken] = useState(
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsZXggRGV2ZWxvcGVyIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoxODMxNjIzOTAyfQ.signature"
  );
  const [jwtResult, setJwtResult] = useState<DecodedJwt | null>(null);

  // --- Hash & HMAC State ---
  const [hashInput, setHashInput] = useState("Developer Hub Secure Payload");
  const [hashAlgorithm, setHashAlgorithm] = useState<"SHA-256" | "SHA-512" | "SHA-1" | "MD5" | "CRC-32">("SHA-256");
  const [hashKey, setHashKey] = useState("");
  const [hashOutput, setHashOutput] = useState("");
  const [verifyHashTarget, setVerifyHashTarget] = useState("");

  // --- URL Codec & Query Parser State ---
  const [urlInput, setUrlInput] = useState("https://api.example.com/v1/search?query=react+nextjs&limit=25&sort=desc#results");
  const [urlOutput, setUrlOutput] = useState("");
  const [parsedUrl, setParsedUrl] = useState<{
    protocol: string;
    hostname: string;
    port: string;
    pathname: string;
    hash: string;
    params: Array<{ key: string; value: string }>;
  } | null>(null);

  // --- Number Base Converter State ---
  const [baseInputVal, setBaseInputVal] = useState("255");
  const [baseFrom, setBaseFrom] = useState<2 | 8 | 10 | 16>(10);
  const [baseResults, setBaseResults] = useState<NumberBases | null>(null);

  // --- Diff Checker State ---
  const [diffOld, setDiffOld] = useState("const version = '1.0.0';\nconsole.log('App starting');\nexport default version;");
  const [diffNew, setDiffNew] = useState("const version = '2.0.0';\nconsole.log('App starting...');\nconsole.log('Debug mode enabled');\nexport default version;");
  const [diffResults, setDiffResults] = useState<DiffLine[]>([]);

  // --- Color Converter State ---
  const [colorInput, setColorInput] = useState("#7cff9b");
  const [colorFormats, setColorFormats] = useState<{ hex: string; rgb: string; hsl: string } | null>(null);

  // --- SQL Formatter State ---
  const [sqlInput, setSqlInput] = useState("select u.id, u.name, count(o.id) as total_orders from users u left join orders o on u.id = o.user_id where u.active = 1 and o.status = 'completed' group by u.id, u.name order by total_orders desc limit 10;");
  const [sqlOutput, setSqlOutput] = useState("");

  // --- Markdown Preview State ---
  const [markdownInput, setMarkdownInput] = useState("# Welcome to DevHub 2.0\n\nA **supercharged** dark terminal workspace for developers.\n\n- [x] 19 fast client-side developer tools\n- [x] Dual-mode HTTP REST API client\n- [x] AI Engineering Copilot with multi-turn chat\n\n```ts\nconst dev = { focus: 'build', velocity: 'high' };\nconsole.log(dev);\n```");

  // --- Lorem & Mock Data State ---
  const [loremType, setLoremType] = useState<"paragraphs" | "sentences" | "words" | "mock_json">("paragraphs");
  const [loremCount, setLoremCount] = useState("3");
  const [loremOutput, setLoremOutput] = useState("");

  // --- API Workspace State ---
  const [apiMethod, setApiMethod] = useState("GET");
  const [apiUrl, setApiUrl] = useState("https://jsonplaceholder.typicode.com/todos/1");
  const [apiExecutionMode, setApiExecutionMode] = useState<"proxy" | "direct">("proxy");
  const [apiActiveTab, setApiActiveTab] = useState<"params" | "headers" | "body" | "import">("headers");
  const [apiCurlImport, setApiCurlImport] = useState("");
  const [apiHeaders, setApiHeaders] = useState<Array<{ key: string; value: string; enabled: boolean }>>([
    { key: "Accept", value: "application/json", enabled: true },
    { key: "Content-Type", value: "application/json", enabled: false },
  ]);
  const [apiBody, setApiBody] = useState('{\n  "title": "New DevHub Task",\n  "completed": false\n}');
  const [apiResult, setApiResult] = useState<{
    status?: number;
    statusText?: string;
    durationMs?: number;
    headers?: Record<string, string>;
    data?: string;
    error?: string;
  } | null>(null);
  const [apiBusy, setApiBusy] = useState(false);
  const [apiHistory, setApiHistory] = useState<ApiHistoryItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("devhub_api_history");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  // --- AI Assistant State ---
  const [aiApiKey, setAiApiKey] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("devhub_ai_key");
        if (saved) return saved;
      } catch {}
    }
    return "";
  });
  const [aiShowSettings, setAiShowSettings] = useState(false);
  const [aiModel, setAiModel] = useState("gpt-4o-mini");
  const [aiInput, setAiInput] = useState("");
  const [aiMessages, setAiMessages] = useState<ChatMessage[]>([]);
  const [aiBusy, setAiBusy] = useState(false);

  // --- Notify helper ---
  const notify = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  }, []);

  const copyText = useCallback(async (value: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      notify("Copied to clipboard");
    } catch {
      notify("Clipboard unavailable — please select and copy manually");
    }
  }, [notify]);

  // --- Clock Ticker & Keyboard Shortcuts ---
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toTimeString().split(" ")[0] + " UTC" + (now.getTimezoneOffset() <= 0 ? "+" : "-") + Math.abs(now.getTimezoneOffset() / 60));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setCmdOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleFavorite = (toolName: string) => {
    setFavorites((prev) => {
      const next = prev.includes(toolName) ? prev.filter((t) => t !== toolName) : [...prev, toolName];
      try {
        localStorage.setItem("devhub_favorites", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      const matchesSearch = (tool.name + " " + tool.description + " " + tool.tag)
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesCategory = categoryFilter === "All" || tool.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [search, categoryFilter]);

  const cmdFilteredTools = useMemo(() => {
    return tools.filter((t) =>
      (t.name + " " + t.description + " " + t.tag).toLowerCase().includes(cmdSearch.toLowerCase())
    );
  }, [cmdSearch]);

  // --- TOOL RUNNERS ---

  const runJsonFormatter = (action: "pretty" | "minify" | "sort" | "clean" | "unescape") => {
    try {
      let workingInput = jsonInput.trim();
      if (action === "unescape") {
        if (workingInput.startsWith('"') && workingInput.endsWith('"')) {
          workingInput = JSON.parse(workingInput);
        } else {
          workingInput = workingInput.replace(/\\"/g, '"').replace(/\\\\/g, "\\");
        }
      } else if (action === "clean") {
        // Fix trailing commas and single quotes
        workingInput = workingInput
          .replace(/,\s*([}\]])/g, "$1")
          .replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, '"$1"');
      }

      const parsed = JSON.parse(workingInput);
      let outputStr = "";
      if (action === "pretty" || action === "clean" || action === "unescape") {
        outputStr = JSON.stringify(parsed, null, 2);
      } else if (action === "minify") {
        outputStr = JSON.stringify(parsed);
      } else if (action === "sort") {
        const sortObj = (obj: unknown): unknown => {
          if (Array.isArray(obj)) return obj.map(sortObj);
          if (obj !== null && typeof obj === "object") {
            return Object.keys(obj as Record<string, unknown>)
              .sort()
              .reduce<Record<string, unknown>>((acc, key) => {
                acc[key] = sortObj((obj as Record<string, unknown>)[key]);
                return acc;
              }, {});
          }
          return obj;
        };
        outputStr = JSON.stringify(sortObj(parsed), null, 2);
      }
      setJsonOutput(outputStr);
      setJsonStats({
        keys: typeof parsed === "object" && parsed !== null ? Object.keys(parsed).length : 1,
        bytes: new Blob([outputStr]).size,
      });
      notify("JSON processed successfully");
    } catch (err) {
      setJsonOutput(`JSON Error: ${err instanceof Error ? err.message : "Invalid JSON"}`);
      setJsonStats(null);
    }
  };

  const runJsonToTs = () => {
    const res = jsonToTypeScript(jsonTsInput, jsonTsRootName.trim() || "RootObject");
    setJsonTsOutput(res);
  };

  const runBase64 = () => {
    try {
      if (base64Mode === "encode") {
        setBase64Output(utf8ToBase64(base64Input, urlSafeBase64));
      } else {
        setBase64Output(base64ToUtf8(base64Input, urlSafeBase64));
      }
    } catch (err) {
      setBase64Output(`Base64 Error: ${err instanceof Error ? err.message : "Invalid Base64 input"}`);
    }
  };

  const runIdGenerator = () => {
    const count = Math.min(50, Math.max(1, Number(uuidCount) || 1));
    const ids: string[] = [];
    for (let i = 0; i < count; i++) {
      let id = "";
      if (uuidType === "v4") id = crypto.randomUUID();
      else if (uuidType === "v7") id = generateUuidV7();
      else if (uuidType === "nanoid") id = generateNanoId(21);
      else if (uuidType === "ulid") id = generateUlid();

      if (uuidNoHyphens) id = id.replace(/-/g, "");
      if (uuidUppercase) id = id.toUpperCase();
      ids.push(id);
    }
    setUuidOutput(ids.join("\n"));
  };

  const runPasswordGenerator = () => {
    const len = Math.max(4, Math.min(128, Number(passLength) || 16));
    const result = generatePassword({
      length: len,
      uppercase: passUpper,
      lowercase: passLower,
      numbers: passNumbers,
      symbols: passSymbols,
      avoidAmbiguous: passAvoidAmbiguous,
    });
    setPassResult(result);
  };

  const runRegex = () => {
    try {
      const rx = new RegExp(pattern, flags.includes("g") ? flags : flags + "g");
      const matches = [...testText.matchAll(rx)].map((m) => ({
        match: m[0],
        index: m.index ?? 0,
        groups: m.slice(1),
      }));
      setRegexMatches(matches);

      if (regexReplace) {
        const replaced = testText.replace(new RegExp(pattern, flags), regexReplace);
        setRegexOutput(`Replaced Text:\n${replaced}\n\nMatches: ${matches.length}`);
      } else {
        setRegexOutput(
          matches.length
            ? `Found ${matches.length} match(es):\n` +
                matches.map((m, idx) => `${idx + 1}. "${m.match}" at index ${m.index}`).join("\n")
            : "No matches found."
        );
      }
    } catch (err) {
      setRegexOutput(`Regex Error: ${err instanceof Error ? err.message : "Invalid regex"}`);
      setRegexMatches([]);
    }
  };

  const runCron = () => {
    const result = explainCron(cronInput);
    setCronResult(result);
  };

  const runTimestamp = () => {
    try {
      const raw = Number(timestampInput.trim());
      if (!Number.isFinite(raw)) throw new Error("Enter a valid numeric epoch timestamp.");
      const ms = Math.abs(raw) < 1e12 ? raw * 1000 : raw;
      const date = new Date(ms);
      if (Number.isNaN(date.getTime())) throw new Error("Timestamp is out of range.");

      const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
      let relative = "";
      if (Math.abs(diffSec) < 60) relative = `${Math.abs(diffSec)} seconds ${diffSec > 0 ? "ago" : "from now"}`;
      else if (Math.abs(diffSec) < 3600) relative = `${Math.floor(Math.abs(diffSec) / 60)} minutes ${diffSec > 0 ? "ago" : "from now"}`;
      else if (Math.abs(diffSec) < 86400) relative = `${Math.floor(Math.abs(diffSec) / 3600)} hours ${diffSec > 0 ? "ago" : "from now"}`;
      else relative = `${Math.floor(Math.abs(diffSec) / 86400)} days ${diffSec > 0 ? "ago" : "from now"}`;

      setTimestampOutput(
        `ISO 8601:     ${date.toISOString()}\nUTC:          ${date.toUTCString()}\nLocal:        ${date.toLocaleString()}\nRelative:     ${relative}\nMilliseconds: ${date.getTime()}\nSeconds:      ${Math.floor(date.getTime() / 1000)}`
      );
    } catch (err) {
      setTimestampOutput(`Error: ${err instanceof Error ? err.message : "Invalid input"}`);
    }
  };

  const runJwt = () => {
    const decoded = decodeJwt(jwtToken);
    setJwtResult(decoded);
  };

  const runHash = async () => {
    try {
      const result = await computeHash(hashAlgorithm, hashInput, hashKey);
      setHashOutput(result);
    } catch (err) {
      setHashOutput(`Hash Error: ${err instanceof Error ? err.message : "Failed to compute hash"}`);
    }
  };

  const runNumberBase = (val: string, base: 2 | 8 | 10 | 16) => {
    setBaseInputVal(val);
    setBaseFrom(base);
    const converted = convertNumberBase(val, base);
    setBaseResults(converted);
  };

  const runUrlCodec = (action: "encode" | "decode" | "parse" | "html_encode" | "html_decode") => {
    try {
      if (action === "encode") {
        setUrlOutput(encodeURIComponent(urlInput));
      } else if (action === "decode") {
        setUrlOutput(decodeURIComponent(urlInput));
      } else if (action === "html_encode") {
        setUrlOutput(encodeHtmlEntities(urlInput));
      } else if (action === "html_decode") {
        setUrlOutput(decodeHtmlEntities(urlInput));
      } else if (action === "parse") {
        const u = new URL(urlInput);
        const params: Array<{ key: string; value: string }> = [];
        u.searchParams.forEach((value, key) => {
          params.push({ key, value });
        });
        setParsedUrl({
          protocol: u.protocol,
          hostname: u.hostname,
          port: u.port || "(default)",
          pathname: u.pathname,
          hash: u.hash,
          params,
        });
        setUrlOutput(
          `Protocol: ${u.protocol}\nHostname: ${u.hostname}\nPort:     ${u.port || "default"}\nPath:     ${u.pathname}\nHash:     ${u.hash || "(none)"}\nParams:   ${params.length} query parameter(s)`
        );
      }
    } catch (err) {
      setUrlOutput(`URL Error: ${err instanceof Error ? err.message : "Invalid URL"}`);
      setParsedUrl(null);
    }
  };

  const runDiff = () => {
    const diff = computeLineDiff(diffOld, diffNew);
    setDiffResults(diff);
  };

  const runColor = () => {
    try {
      let hex = colorInput.trim();
      if (!hex.startsWith("#")) hex = "#" + hex;
      if (!/^#([0-9A-Fa-f]{3}){1,2}$/.test(hex)) throw new Error("Enter a valid 3 or 6 digit hex color (e.g. #7cff9b).");

      let fullHex = hex;
      if (hex.length === 4) {
        fullHex = "#" + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
      }
      const r = parseInt(fullHex.slice(1, 3), 16);
      const g = parseInt(fullHex.slice(3, 5), 16);
      const b = parseInt(fullHex.slice(5, 7), 16);

      const rNorm = r / 255;
      const gNorm = g / 255;
      const bNorm = b / 255;
      const max = Math.max(rNorm, gNorm, bNorm);
      const min = Math.min(rNorm, gNorm, bNorm);
      let h = 0;
      let s = 0;
      const l = (max + min) / 2;

      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case rNorm: h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0); break;
          case gNorm: h = (bNorm - rNorm) / d + 2; break;
          case bNorm: h = (rNorm - gNorm) / d + 4; break;
        }
        h /= 6;
      }

      setColorFormats({
        hex: fullHex.toUpperCase(),
        rgb: `rgb(${r}, ${g}, ${b})`,
        hsl: `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`,
      });
    } catch (err) {
      notify(err instanceof Error ? err.message : "Invalid color");
    }
  };

  const runSql = (minify = false) => {
    if (minify) {
      setSqlOutput(sqlInput.replace(/\s+/g, " ").trim());
    } else {
      setSqlOutput(formatSql(sqlInput));
    }
  };

  const runLorem = () => {
    const num = Math.max(1, Math.min(20, Number(loremCount) || 1));
    const sampleWords = [
      "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
      "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
      "magna", "aliqua", "ut", "enim", "ad", "minim", "veniam", "quis", "nostrud"
    ];

    if (loremType === "words") {
      const words = Array.from({ length: num * 10 }, () => sampleWords[Math.floor(Math.random() * sampleWords.length)]);
      setLoremOutput(words.join(" "));
    } else if (loremType === "sentences") {
      const sentences = Array.from({ length: num }, () => {
        const len = 7 + Math.floor(Math.random() * 8);
        const ws = Array.from({ length: len }, () => sampleWords[Math.floor(Math.random() * sampleWords.length)]);
        return ws[0].charAt(0).toUpperCase() + ws.slice(1).join(" ") + ".";
      });
      setLoremOutput(sentences.join(" "));
    } else if (loremType === "paragraphs") {
      const paras = Array.from({ length: num }, () => {
        const sentenceCount = 3 + Math.floor(Math.random() * 3);
        const sentences = Array.from({ length: sentenceCount }, () => {
          const len = 6 + Math.floor(Math.random() * 8);
          const ws = Array.from({ length: len }, () => sampleWords[Math.floor(Math.random() * sampleWords.length)]);
          return ws[0].charAt(0).toUpperCase() + ws.slice(1).join(" ") + ".";
        });
        return sentences.join(" ");
      });
      setLoremOutput(paras.join("\n\n"));
    } else if (loremType === "mock_json") {
      const mockUsers = Array.from({ length: num }, (_, i) => ({
        id: crypto.randomUUID(),
        name: `Engineer ${i + 1}`,
        username: `eng_${i + 1}`,
        email: `engineer${i + 1}@devhub.local`,
        role: ["Frontend Lead", "Backend Architect", "DevOps Engineer", "Fullstack"][i % 4],
        department: "Engineering",
        active: true,
        createdAt: new Date().toISOString(),
      }));
      setLoremOutput(JSON.stringify(mockUsers, null, 2));
    }
  };

  // --- API WORKSPACE EXECUTION ---
  const sendApiRequest = async () => {
    if (!apiUrl.trim()) return;
    setApiBusy(true);
    setApiResult(null);

    const headersObj: Record<string, string> = {};
    apiHeaders.filter((h) => h.enabled && h.key.trim()).forEach((h) => {
      headersObj[h.key.trim()] = h.value;
    });

    const startTime = Date.now();

    try {
      if (apiExecutionMode === "direct") {
        // Direct browser fetch (for CORS-enabled APIs or local microservices)
        const fetchOpts: RequestInit = {
          method: apiMethod,
          headers: headersObj,
        };
        if (["POST", "PUT", "PATCH"].includes(apiMethod) && apiBody.trim()) {
          fetchOpts.body = apiBody;
        }
        const res = await fetch(apiUrl.trim(), fetchOpts);
        const durationMs = Date.now() - startTime;
        const text = await res.text();
        const resHeaders: Record<string, string> = {};
        res.headers.forEach((v, k) => { resHeaders[k] = v; });

        setApiResult({
          status: res.status,
          statusText: res.statusText,
          durationMs,
          headers: resHeaders,
          data: text,
        });

        const newHistoryItem: ApiHistoryItem = {
          id: crypto.randomUUID(),
          timestamp: new Date().toLocaleTimeString(),
          method: apiMethod,
          url: apiUrl,
          status: res.status,
          durationMs,
        };
        setApiHistory((prev) => {
          const next = [newHistoryItem, ...prev.slice(0, 9)];
          try { localStorage.setItem("devhub_api_history", JSON.stringify(next)); } catch {}
          return next;
        });
      } else {
        // Safe server proxy
        const response = await fetch("/api/proxy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: apiUrl.trim(),
            method: apiMethod,
            headers: headersObj,
            body: ["POST", "PUT", "PATCH"].includes(apiMethod) ? apiBody : undefined,
          }),
        });

        const resData = await response.json();
        if (!response.ok) {
          setApiResult({
            status: response.status,
            statusText: response.statusText,
            error: resData.error || "Proxy request failed",
          });
        } else {
          setApiResult({
            status: resData.status,
            statusText: resData.statusText,
            durationMs: resData.durationMs,
            headers: resData.headers,
            data: resData.data,
          });

          const newHistoryItem: ApiHistoryItem = {
            id: crypto.randomUUID(),
            timestamp: new Date().toLocaleTimeString(),
            method: apiMethod,
            url: apiUrl,
            status: resData.status,
            durationMs: resData.durationMs,
          };
          setApiHistory((prev) => {
            const next = [newHistoryItem, ...prev.slice(0, 9)];
            try { localStorage.setItem("devhub_api_history", JSON.stringify(next)); } catch {}
            return next;
          });
        }
      }
    } catch (err) {
      setApiResult({
        error: err instanceof Error ? err.message : "Request failed.",
      });
    } finally {
      setApiBusy(false);
    }
  };

  const importCurlCommand = () => {
    const parsed = parseCurl(apiCurlImport);
    if (parsed.error) {
      notify(parsed.error);
      return;
    }
    setApiMethod(parsed.method);
    setApiUrl(parsed.url);
    if (parsed.body) setApiBody(parsed.body);
    const newHeaders = Object.entries(parsed.headers).map(([key, value]) => ({
      key,
      value,
      enabled: true,
    }));
    if (newHeaders.length) setApiHeaders(newHeaders);
    setApiActiveTab("headers");
    notify("cURL request imported successfully!");
  };

  const generateCurl = () => {
    let curl = `curl -X ${apiMethod} "${apiUrl}"`;
    apiHeaders.filter((h) => h.enabled && h.key.trim()).forEach((h) => {
      curl += ` \\\n  -H "${h.key.trim()}: ${h.value}"`;
    });
    if (["POST", "PUT", "PATCH"].includes(apiMethod) && apiBody.trim()) {
      curl += ` \\\n  -d '${apiBody.replace(/'/g, "\\'")}'`;
    }
    copyText(curl);
  };

  // --- AI ASSISTANT EXECUTION ---
  const sendAiMessage = async (customText?: string) => {
    const textToSend = customText || aiInput;
    if (!textToSend.trim() || aiBusy) return;

    const newMsgs: ChatMessage[] = [...aiMessages, { role: "user", content: textToSend.trim() }];
    setAiMessages(newMsgs);
    setAiInput("");
    setAiBusy(true);

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (aiApiKey.trim()) {
        headers["x-openai-api-key"] = aiApiKey.trim();
      }

      const response = await fetch("/api/ai", {
        method: "POST",
        headers,
        body: JSON.stringify({
          messages: newMsgs,
          model: aiModel,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "AI request failed.");
      }

      setAiMessages([...newMsgs, { role: "assistant", content: data.answer || "No response received." }]);
    } catch (err) {
      setAiMessages([
        ...newMsgs,
        { role: "assistant", content: `⚠️ Error: ${err instanceof Error ? err.message : "AI request failed"}` },
      ]);
    } finally {
      setAiBusy(false);
    }
  };

  const saveAiApiKey = (key: string) => {
    setAiApiKey(key);
    try {
      localStorage.setItem("devhub_ai_key", key);
      notify("OpenAI API key saved locally in browser");
    } catch {}
  };

  // --- RENDER TOOLS WORKSPACE ---
  const renderWorkspace = () => {
    switch (view) {
      case "JSON Formatter":
        return (
          <div className="tool-workspace">
            <section className="panel">
              <div className="panel-head">
                <div>
                  <div className="panel-title">JSON Input</div>
                  <div className="panel-subtitle">Paste JSON payload to validate, format, sort, or clean.</div>
                </div>
                <span className="pill">VALIDATOR</span>
              </div>
              <div className="panel-body field-stack">
                <div className="row-wrap">
                  <button className={`btn ${jsonMode === "pretty" ? "btn-primary" : ""}`} onClick={() => { setJsonMode("pretty"); runJsonFormatter("pretty"); }}>Pretty Print</button>
                  <button className={`btn ${jsonMode === "minify" ? "btn-primary" : ""}`} onClick={() => { setJsonMode("minify"); runJsonFormatter("minify"); }}>Minify</button>
                  <button className="btn" onClick={() => runJsonFormatter("sort")}>Sort Keys</button>
                  <button className="btn" title="Fix common errors like single quotes and trailing commas" onClick={() => runJsonFormatter("clean")}>Fix Common Errors</button>
                  <button className="btn" title="Unescape stringified JSON" onClick={() => runJsonFormatter("unescape")}>Unescape</button>
                  <button className="btn" onClick={() => { setJsonInput(""); setJsonOutput(""); setJsonStats(null); }}>Clear</button>
                </div>
                <textarea className="textarea" value={jsonInput} onChange={(e) => setJsonInput(e.target.value)} spellCheck={false} placeholder='{"key": "value"}' />
                <div className="row-wrap">
                  <button className="btn btn-primary" onClick={() => runJsonFormatter(jsonMode)}>
                    <Zap size={14} /> Process JSON
                  </button>
                  <button className="btn" onClick={() => { setJsonTsInput(jsonInput); setView("JSON to TS"); }}>
                    <CodeXml size={13} /> Generate TypeScript Types
                  </button>
                </div>
              </div>
            </section>
            <section className="panel">
              <div className="panel-head">
                <div>
                  <div className="panel-title">Output & Stats</div>
                  <div className="panel-subtitle">
                    {jsonStats ? `${jsonStats.keys} keys · ${jsonStats.bytes} bytes` : "Result appears here"}
                  </div>
                </div>
                <button className="btn" onClick={() => copyText(jsonOutput)}><Copy size={13} /> Copy</button>
              </div>
              <div className="panel-body">
                <div className={`result-box ${jsonOutput.startsWith("JSON Error:") ? "error" : "code-output"}`}>
                  {jsonOutput || "Waiting for input…\n\nClick 'Process JSON' to view formatted payload."}
                </div>
              </div>
            </section>
          </div>
        );

      case "JSON to TS":
        return (
          <div className="tool-workspace">
            <section className="panel">
              <div className="panel-head">
                <div>
                  <div className="panel-title">JSON Payload</div>
                  <div className="panel-subtitle">Paste JSON to convert into TypeScript interfaces.</div>
                </div>
                <span className="pill">TYPESCRIPT</span>
              </div>
              <div className="panel-body field-stack">
                <div>
                  <label className="field-label">Root Interface / Type Name</label>
                  <input className="field" value={jsonTsRootName} onChange={(e) => setJsonTsRootName(e.target.value)} placeholder="RootConfig" />
                </div>
                <textarea className="textarea" value={jsonTsInput} onChange={(e) => setJsonTsInput(e.target.value)} spellCheck={false} placeholder="Paste JSON here..." />
                <div className="row-wrap">
                  <button className="btn btn-primary" onClick={runJsonToTs}><CodeXml size={14} /> Generate TypeScript Interfaces</button>
                  <button className="btn" onClick={() => { setJsonTsInput(""); setJsonTsOutput(""); }}>Clear</button>
                </div>
              </div>
            </section>
            <section className="panel">
              <div className="panel-head">
                <div>
                  <div className="panel-title">TypeScript Definitions</div>
                  <div className="panel-subtitle">Strict TypeScript code output</div>
                </div>
                <button className="btn" onClick={() => copyText(jsonTsOutput)}><Copy size={13} /> Copy Types</button>
              </div>
              <div className="panel-body">
                <div className="result-box code-output" style={{ minHeight: 280 }}>
                  {jsonTsOutput || "Click 'Generate TypeScript Interfaces' to convert."}
                </div>
              </div>
            </section>
          </div>
        );

      case "Base64 Codec":
        return (
          <div className="tool-workspace">
            <section className="panel">
              <div className="panel-head">
                <div>
                  <div className="panel-title">Base64 Input</div>
                  <div className="panel-subtitle">UTF-8 safe encoder / decoder with emoji and symbol support.</div>
                </div>
                <span className="pill">{base64Mode.toUpperCase()}</span>
              </div>
              <div className="panel-body field-stack">
                <div className="row-wrap">
                  <button className={`btn ${base64Mode === "encode" ? "btn-primary" : ""}`} onClick={() => setBase64Mode("encode")}>Encode</button>
                  <button className={`btn ${base64Mode === "decode" ? "btn-primary" : ""}`} onClick={() => setBase64Mode("decode")}>Decode</button>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--muted)", cursor: "pointer", marginLeft: "auto" }}>
                    <input type="checkbox" checked={urlSafeBase64} onChange={(e) => setUrlSafeBase64(e.target.checked)} />
                    URL-Safe Base64
                  </label>
                </div>
                <textarea className="textarea" value={base64Input} onChange={(e) => setBase64Input(e.target.value)} spellCheck={false} placeholder="Enter text to encode or decode…" />
                <div className="row-wrap">
                  <button className="btn btn-primary" onClick={runBase64}>
                    <Zap size={14} /> Process Base64
                  </button>
                  <button className="btn" onClick={() => { setBase64Input(""); setBase64Output(""); }}>Clear</button>
                </div>
              </div>
            </section>
            <section className="panel">
              <div className="panel-head">
                <div>
                  <div className="panel-title">Output</div>
                  <div className="panel-subtitle">{base64Output ? `${new Blob([base64Output]).size} bytes` : "Converted text"}</div>
                </div>
                <button className="btn" onClick={() => copyText(base64Output)}><Copy size={13} /> Copy</button>
              </div>
              <div className="panel-body">
                <div className={`result-box ${base64Output.startsWith("Base64 Error:") ? "error" : "code-output"}`}>
                  {base64Output || "Run the tool to view converted Base64 text."}
                </div>
              </div>
            </section>
          </div>
        );

      case "UUID Generator":
        return (
          <section className="panel">
            <div className="panel-head">
              <div>
                <div className="panel-title">UUID & ID Generator</div>
                <div className="panel-subtitle">Generate cryptographically secure identifiers locally in your browser.</div>
              </div>
              <span className="pill">CRYPTO RANDOM</span>
            </div>
            <div className="panel-body field-stack">
              <div className="row-wrap">
                <button className={`btn ${uuidType === "v4" ? "btn-primary" : ""}`} onClick={() => setUuidType("v4")}>UUID v4</button>
                <button className={`btn ${uuidType === "v7" ? "btn-primary" : ""}`} onClick={() => setUuidType("v7")}>UUID v7 (Time-ordered)</button>
                <button className={`btn ${uuidType === "nanoid" ? "btn-primary" : ""}`} onClick={() => setUuidType("nanoid")}>NanoID (21 chars)</button>
                <button className={`btn ${uuidType === "ulid" ? "btn-primary" : ""}`} onClick={() => setUuidType("ulid")}>ULID (Base32)</button>
              </div>
              <div className="row-wrap" style={{ gap: 20 }}>
                <div>
                  <label className="field-label">Quantity (1–50)</label>
                  <input className="field" type="number" min="1" max="50" style={{ width: 120 }} value={uuidCount} onChange={(e) => setUuidCount(e.target.value)} />
                </div>
                <div style={{ display: "flex", gap: 16, alignItems: "center", paddingTop: 18 }}>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--muted)", cursor: "pointer" }}>
                    <input type="checkbox" checked={uuidUppercase} onChange={(e) => setUuidUppercase(e.target.checked)} />
                    Uppercase
                  </label>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--muted)", cursor: "pointer" }}>
                    <input type="checkbox" checked={uuidNoHyphens} onChange={(e) => setUuidNoHyphens(e.target.checked)} />
                    Remove Hyphens
                  </label>
                </div>
              </div>
              <div className="row-wrap">
                <button className="btn btn-primary" onClick={runIdGenerator}><Hash size={14} /> Generate Identifiers</button>
                <button className="btn" onClick={() => copyText(uuidOutput)}><Copy size={13} /> Copy All</button>
              </div>
              <div className="result-box code-output" style={{ minHeight: 140 }}>
                {uuidOutput || "No identifiers generated yet. Click 'Generate Identifiers'."}
              </div>
              <p className="notice">
                Generated entirely locally using the browser&apos;s Web Crypto API. No data is sent over the network.
              </p>
            </div>
          </section>
        );

      case "Password Gen":
        return (
          <section className="panel">
            <div className="panel-head">
              <div>
                <div className="panel-title">Password & Secret Token Generator</div>
                <div className="panel-subtitle">Generate high-entropy credentials, tokens, and keys with instant strength evaluation.</div>
              </div>
              <span className="pill">ENTROPY</span>
            </div>
            <div className="panel-body field-stack">
              <div className="row-wrap" style={{ gap: 16 }}>
                <div>
                  <label className="field-label">Length (4–128 characters)</label>
                  <input className="field" type="number" min="4" max="128" style={{ width: 120 }} value={passLength} onChange={(e) => setPassLength(e.target.value)} />
                </div>
                <div style={{ display: "flex", gap: 16, alignItems: "center", paddingTop: 18, flexWrap: "wrap" }}>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--muted)", cursor: "pointer" }}>
                    <input type="checkbox" checked={passUpper} onChange={(e) => setPassUpper(e.target.checked)} />
                    Uppercase (A-Z)
                  </label>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--muted)", cursor: "pointer" }}>
                    <input type="checkbox" checked={passLower} onChange={(e) => setPassLower(e.target.checked)} />
                    Lowercase (a-z)
                  </label>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--muted)", cursor: "pointer" }}>
                    <input type="checkbox" checked={passNumbers} onChange={(e) => setPassNumbers(e.target.checked)} />
                    Numbers (0-9)
                  </label>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--muted)", cursor: "pointer" }}>
                    <input type="checkbox" checked={passSymbols} onChange={(e) => setPassSymbols(e.target.checked)} />
                    Symbols (!@#$%)
                  </label>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--muted)", cursor: "pointer" }}>
                    <input type="checkbox" checked={passAvoidAmbiguous} onChange={(e) => setPassAvoidAmbiguous(e.target.checked)} />
                    Avoid Ambiguous (0, O, I, l, 1)
                  </label>
                </div>
              </div>
              <div className="row-wrap">
                <button className="btn btn-primary" onClick={runPasswordGenerator}><KeyRound size={14} /> Generate Password</button>
                {passResult && <button className="btn" onClick={() => copyText(passResult.password)}><Copy size={13} /> Copy Password</button>}
              </div>
              {passResult && (
                <div className="field-stack" style={{ marginTop: 10 }}>
                  <div className="result-box code-output" style={{ fontSize: 14, fontWeight: "bold" }}>
                    {passResult.password}
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "var(--muted)" }}>Entropy Score:</span>
                    <strong style={{ color: passResult.entropyBits > 80 ? "var(--green)" : passResult.entropyBits > 50 ? "#ffd666" : "#ff8b8b" }}>
                      {passResult.entropyBits} bits ({passResult.entropyBits > 80 ? "Fort Knox" : passResult.entropyBits > 50 ? "Strong" : "Weak"})
                    </strong>
                  </div>
                </div>
              )}
            </div>
          </section>
        );

      case "Regex Tester":
        return (
          <div className="tool-workspace">
            <section className="panel">
              <div className="panel-head">
                <div>
                  <div className="panel-title">Pattern & Test Text</div>
                  <div className="panel-subtitle">Regular expression syntax with flags and substitution.</div>
                </div>
                <span className="pill">REGEXP</span>
              </div>
              <div className="panel-body field-stack">
                <div className="row-wrap" style={{ marginBottom: 4 }}>
                  <span style={{ fontSize: 10, color: "var(--muted)" }}>Presets:</span>
                  <button className="btn" style={{ padding: "4px 8px", fontSize: 10 }} onClick={() => { setPattern("\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}\\b"); notify("Email preset loaded"); }}>Email</button>
                  <button className="btn" style={{ padding: "4px 8px", fontSize: 10 }} onClick={() => { setPattern("https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)"); notify("URL preset loaded"); }}>URL</button>
                  <button className="btn" style={{ padding: "4px 8px", fontSize: 10 }} onClick={() => { setPattern("\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\b"); notify("IPv4 preset loaded"); }}>IPv4</button>
                  <button className="btn" style={{ padding: "4px 8px", fontSize: 10 }} onClick={() => { setPattern("#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})"); notify("Hex color preset loaded"); }}>Hex Color</button>
                  <button className="btn" style={{ padding: "4px 8px", fontSize: 10 }} onClick={() => { setPattern("^[a-z0-9]+(?:-[a-z0-9]+)*$"); notify("Slug preset loaded"); }}>Slug</button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 90px", gap: 10 }}>
                  <div>
                    <label className="field-label">Regular Expression (without delimiters)</label>
                    <input className="field" value={pattern} onChange={(e) => setPattern(e.target.value)} placeholder="e.g. \b\w+\b" />
                  </div>
                  <div>
                    <label className="field-label">Flags</label>
                    <input className="field" value={flags} onChange={(e) => setFlags(e.target.value)} placeholder="gim" />
                  </div>
                </div>
                <div>
                  <label className="field-label">Test Text</label>
                  <textarea className="textarea" style={{ minHeight: 110 }} value={testText} onChange={(e) => setTestText(e.target.value)} />
                </div>
                <div>
                  <label className="field-label">Substitution String (optional)</label>
                  <input className="field" value={regexReplace} onChange={(e) => setRegexReplace(e.target.value)} placeholder="e.g. [REDACTED]" />
                </div>
                <button className="btn btn-primary" onClick={runRegex}><Regex size={14} /> Test Regular Expression</button>
              </div>
            </section>
            <section className="panel">
              <div className="panel-head">
                <div>
                  <div className="panel-title">Matches ({regexMatches.length})</div>
                  <div className="panel-subtitle">Inspected matches & capture groups</div>
                </div>
                <button className="btn" onClick={() => copyText(regexOutput)}><Copy size={13} /> Copy</button>
              </div>
              <div className="panel-body">
                <div className={`result-box ${regexOutput.startsWith("Regex Error:") ? "error" : "code-output"}`}>
                  {regexOutput || "Run the regular expression to inspect matches."}
                </div>
              </div>
            </section>
          </div>
        );

      case "Timestamp Converter":
        return (
          <section className="panel">
            <div className="panel-head">
              <div>
                <div className="panel-title">Unix Timestamp Converter</div>
                <div className="panel-subtitle">Epoch seconds and milliseconds to ISO 8601, UTC, and local time.</div>
              </div>
              <span className="pill">LIVE: {currentTime}</span>
            </div>
            <div className="panel-body field-stack">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label className="field-label">Unix Epoch Timestamp (Seconds or Milliseconds)</label>
                  <input className="field" value={timestampInput} onChange={(e) => setTimestampInput(e.target.value)} placeholder="1710000000" />
                  <div className="row-wrap" style={{ marginTop: 10 }}>
                    <button className="btn btn-primary" onClick={runTimestamp}><Clock3 size={14} /> Convert Timestamp</button>
                    <button className="btn" onClick={() => {
                      const now = String(Math.floor(Date.now() / 1000));
                      setTimestampInput(now);
                      notify("Loaded current timestamp");
                    }}><RefreshCw size={12} /> Use Current Time</button>
                  </div>
                </div>
                <div>
                  <label className="field-label">Or Convert Date / Time to Timestamp</label>
                  <input className="field" type="datetime-local" value={dateInput} onChange={(e) => setDateInput(e.target.value)} />
                  <div className="row-wrap" style={{ marginTop: 10 }}>
                    <button className="btn" onClick={() => {
                      try {
                        if (!dateInput) throw new Error("Select or enter a date string.");
                        const d = new Date(dateInput);
                        if (Number.isNaN(d.getTime())) throw new Error("Invalid date format.");
                        setTimestampInput(String(Math.floor(d.getTime() / 1000)));
                        notify("Timestamp updated from date");
                      } catch (err) {
                        notify(err instanceof Error ? err.message : "Invalid date");
                      }
                    }}>Convert Date to Epoch</button>
                  </div>
                </div>
              </div>
              <div className="result-box code-output" style={{ minHeight: 120 }}>
                {timestampOutput || "Converted dates and relative time will appear here."}
              </div>
            </div>
          </section>
        );

      case "Cron Parser":
        return (
          <section className="panel">
            <div className="panel-head">
              <div>
                <div className="panel-title">Cron Expression Parser & Explainer</div>
                <div className="panel-subtitle">Parse 5-part cron syntax and calculate upcoming trigger dates.</div>
              </div>
              <span className="pill">CRONTAB</span>
            </div>
            <div className="panel-body field-stack">
              <div className="row-wrap">
                <span style={{ fontSize: 11, color: "var(--muted)" }}>Quick presets:</span>
                <button className="btn" style={{ padding: "4px 8px", fontSize: 10 }} onClick={() => setCronInput("*/5 * * * *")}>Every 5 mins</button>
                <button className="btn" style={{ padding: "4px 8px", fontSize: 10 }} onClick={() => setCronInput("0 * * * *")}>Hourly</button>
                <button className="btn" style={{ padding: "4px 8px", fontSize: 10 }} onClick={() => setCronInput("0 0 * * *")}>Daily at midnight</button>
                <button className="btn" style={{ padding: "4px 8px", fontSize: 10 }} onClick={() => setCronInput("0 9 * * 1")}>Mondays at 9 AM</button>
                <button className="btn" style={{ padding: "4px 8px", fontSize: 10 }} onClick={() => setCronInput("0 0 1 * *")}>1st of every month</button>
              </div>
              <div>
                <label className="field-label">Cron Expression (minute hour day-of-month month day-of-week)</label>
                <input className="field" style={{ fontSize: 14, fontFamily: "monospace" }} value={cronInput} onChange={(e) => setCronInput(e.target.value)} placeholder="* * * * *" />
              </div>
              <div className="row-wrap">
                <button className="btn btn-primary" onClick={runCron}><CalendarClock size={14} /> Explain Cron Expression</button>
              </div>
              {cronResult && (
                <div className="field-stack" style={{ marginTop: 10 }}>
                  {cronResult.error ? (
                    <div className="result-box error">{cronResult.error}</div>
                  ) : (
                    <>
                      <div className="panel" style={{ padding: 14, background: "#111b15" }}>
                        <div className="field-label">Human-Readable Meaning:</div>
                        <div style={{ fontSize: 15, fontWeight: "bold", color: "var(--green)" }}>{cronResult.explanation}</div>
                      </div>
                      <div>
                        <div className="field-label">Next 5 Calculated Execution Times:</div>
                        <div style={{ display: "grid", gap: 6 }}>
                          {cronResult.nextRuns.map((run, idx) => (
                            <div key={idx} style={{ padding: "6px 12px", background: "#0c130f", border: "1px solid var(--line)", borderRadius: 6, fontSize: 11, display: "flex", gap: 10 }}>
                              <span style={{ color: "var(--muted)", width: 24 }}>#{idx + 1}</span>
                              <strong style={{ color: "var(--text)" }}>{run}</strong>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </section>
        );

      case "Base Converter":
        return (
          <section className="panel">
            <div className="panel-head">
              <div>
                <div className="panel-title">Number Base Converter</div>
                <div className="panel-subtitle">Simultaneous live converter across Decimal, Hexadecimal, Binary, and Octal.</div>
              </div>
              <span className="pill">RADIX</span>
            </div>
            <div className="panel-body field-stack">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 140px", gap: 10 }}>
                <div>
                  <label className="field-label">Input Number</label>
                  <input className="field" value={baseInputVal} onChange={(e) => runNumberBase(e.target.value, baseFrom)} placeholder="e.g. 255 or 0xFF or 11111111" />
                </div>
                <div>
                  <label className="field-label">Input Base</label>
                  <select className="select" value={baseFrom} onChange={(e) => runNumberBase(baseInputVal, Number(e.target.value) as 2 | 8 | 10 | 16)}>
                    <option value={10}>Decimal (10)</option>
                    <option value={16}>Hexadecimal (16)</option>
                    <option value={2}>Binary (2)</option>
                    <option value={8}>Octal (8)</option>
                  </select>
                </div>
              </div>

              {baseResults && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginTop: 10 }}>
                  <div className="panel" style={{ padding: 14 }}>
                    <div className="field-label">Decimal (Base 10)</div>
                    <div style={{ fontSize: 16, fontWeight: "bold", overflowWrap: "anywhere" }}>{baseResults.decimal || "—"}</div>
                    <button className="btn" style={{ marginTop: 8, padding: "4px 8px", fontSize: 10 }} onClick={() => copyText(baseResults.decimal)}>Copy</button>
                  </div>
                  <div className="panel" style={{ padding: 14 }}>
                    <div className="field-label">Hexadecimal (Base 16)</div>
                    <div style={{ fontSize: 16, fontWeight: "bold", color: "var(--green)", overflowWrap: "anywhere" }}>{baseResults.hexadecimal || "—"}</div>
                    <button className="btn" style={{ marginTop: 8, padding: "4px 8px", fontSize: 10 }} onClick={() => copyText(baseResults.hexadecimal)}>Copy</button>
                  </div>
                  <div className="panel" style={{ padding: 14 }}>
                    <div className="field-label">Binary (Base 2)</div>
                    <div style={{ fontSize: 14, fontFamily: "monospace", overflowWrap: "anywhere" }}>{baseResults.binary || "—"}</div>
                    <button className="btn" style={{ marginTop: 8, padding: "4px 8px", fontSize: 10 }} onClick={() => copyText(baseResults.binary)}>Copy</button>
                  </div>
                  <div className="panel" style={{ padding: 14 }}>
                    <div className="field-label">Octal (Base 8)</div>
                    <div style={{ fontSize: 16, fontWeight: "bold", overflowWrap: "anywhere" }}>{baseResults.octal || "—"}</div>
                    <button className="btn" style={{ marginTop: 8, padding: "4px 8px", fontSize: 10 }} onClick={() => copyText(baseResults.octal)}>Copy</button>
                  </div>
                </div>
              )}
            </div>
          </section>
        );

      case "JWT Debugger":
        return (
          <div className="tool-workspace">
            <section className="panel">
              <div className="panel-head">
                <div>
                  <div className="panel-title">Encoded Token</div>
                  <div className="panel-subtitle">Paste an encoded JSON Web Token (JWT).</div>
                </div>
                <span className="pill">JWT</span>
              </div>
              <div className="panel-body field-stack">
                <textarea className="textarea" value={jwtToken} onChange={(e) => setJwtToken(e.target.value)} spellCheck={false} placeholder="header.payload.signature" />
                <div className="row-wrap">
                  <button className="btn btn-primary" onClick={runJwt}><Key size={14} /> Decode Token</button>
                  <button className="btn" onClick={() => { setJwtToken(""); setJwtResult(null); }}>Clear</button>
                </div>
              </div>
            </section>
            <section className="panel">
              <div className="panel-head">
                <div>
                  <div className="panel-title">Decoded Payload & Claims</div>
                  <div className="panel-subtitle">
                    {jwtResult?.isExpired !== null && (
                      jwtResult?.isExpired ? (
                        <span style={{ color: "#ff8b8b" }}>⚠️ Expired Token</span>
                      ) : (
                        <span style={{ color: "var(--green)" }}>✓ Active Token</span>
                      )
                    )}
                  </div>
                </div>
                <button className="btn" onClick={() => copyText(JSON.stringify(jwtResult?.payload, null, 2))}><Copy size={13} /> Copy Payload</button>
              </div>
              <div className="panel-body field-stack">
                {jwtResult?.error ? (
                  <div className="result-box error">{jwtResult.error}</div>
                ) : jwtResult ? (
                  <>
                    {jwtResult.expiresAt && <div className="notice">Expires: <strong style={{ color: "var(--text)" }}>{jwtResult.expiresAt}</strong></div>}
                    {jwtResult.issuedAt && <div className="notice">Issued At: <strong style={{ color: "var(--text)" }}>{jwtResult.issuedAt}</strong></div>}
                    <div>
                      <div className="field-label">Header</div>
                      <div className="result-box code-output">{JSON.stringify(jwtResult.header, null, 2)}</div>
                    </div>
                    <div>
                      <div className="field-label">Payload</div>
                      <div className="result-box code-output">{JSON.stringify(jwtResult.payload, null, 2)}</div>
                    </div>
                  </>
                ) : (
                  <div className="result-box code-output">Click &apos;Decode Token&apos; to view decoded claims.</div>
                )}
              </div>
            </section>
          </div>
        );

      case "Hash Generator":
        return (
          <section className="panel">
            <div className="panel-head">
              <div>
                <div className="panel-title">Cryptographic Hash, HMAC & Checksum Generator</div>
                <div className="panel-subtitle">Compute SHA-256, SHA-512, SHA-1, MD5, CRC-32, and HMAC digests.</div>
              </div>
              <span className="pill">{hashAlgorithm}</span>
            </div>
            <div className="panel-body field-stack">
              <div className="row-wrap">
                {(["SHA-256", "SHA-512", "SHA-1", "MD5", "CRC-32"] as const).map((algo) => (
                  <button key={algo} className={`btn ${hashAlgorithm === algo ? "btn-primary" : ""}`} onClick={() => setHashAlgorithm(algo)}>
                    {algo}
                  </button>
                ))}
              </div>
              <div>
                <label className="field-label">Text to Hash</label>
                <textarea className="textarea" style={{ minHeight: 90 }} value={hashInput} onChange={(e) => setHashInput(e.target.value)} />
              </div>
              {hashAlgorithm !== "CRC-32" && (
                <div>
                  <label className="field-label">HMAC Secret Key (optional — leaves empty for standard hash)</label>
                  <input className="field" type="password" value={hashKey} onChange={(e) => setHashKey(e.target.value)} placeholder="Enter secret key for HMAC..." />
                </div>
              )}
              <div className="row-wrap">
                <button className="btn btn-primary" onClick={runHash}><Lock size={14} /> Calculate Hash</button>
                <button className="btn" onClick={() => copyText(hashOutput)}><Copy size={13} /> Copy Hash</button>
              </div>
              <div className="result-box code-output">{hashOutput || "Hash digest appears here."}</div>

              {/* Hash Verification section */}
              <div style={{ marginTop: 10, padding: 12, border: "1px solid var(--line)", borderRadius: 8, background: "#0c130f" }}>
                <label className="field-label">Verify against target hash (checksum comparison):</label>
                <input className="field" value={verifyHashTarget} onChange={(e) => setVerifyHashTarget(e.target.value)} placeholder="Paste expected hash to compare..." />
                {verifyHashTarget.trim() && hashOutput && (
                  <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center" }}>
                    {hashOutput.toLowerCase() === verifyHashTarget.trim().toLowerCase() ? (
                      <span style={{ color: "var(--green)", fontWeight: "bold", display: "inline-flex", gap: 6, alignItems: "center" }}>
                        <CheckCheck size={16} /> Checksum Verified (Exact Match)
                      </span>
                    ) : (
                      <span style={{ color: "#ff8b8b", fontWeight: "bold" }}>
                        ✗ Checksum Mismatch
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>
        );

      case "URL Codec":
        return (
          <div className="tool-workspace">
            <section className="panel">
              <div className="panel-head">
                <div>
                  <div className="panel-title">URL / Text Input</div>
                  <div className="panel-subtitle">Encode, decode URLs, parse query params, or convert HTML entities.</div>
                </div>
                <span className="pill">WEB ENCODING</span>
              </div>
              <div className="panel-body field-stack">
                <textarea className="textarea" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder="https://example.com/api?key=val" />
                <div className="row-wrap">
                  <button className="btn btn-primary" onClick={() => runUrlCodec("parse")}><Globe size={14} /> Parse URL</button>
                  <button className="btn" onClick={() => runUrlCodec("encode")}>URL Encode</button>
                  <button className="btn" onClick={() => runUrlCodec("decode")}>URL Decode</button>
                  <button className="btn" onClick={() => runUrlCodec("html_encode")}>HTML Entities Encode</button>
                  <button className="btn" onClick={() => runUrlCodec("html_decode")}>HTML Entities Decode</button>
                  <button className="btn" onClick={() => { setUrlInput(""); setUrlOutput(""); setParsedUrl(null); }}>Clear</button>
                </div>
              </div>
            </section>
            <section className="panel">
              <div className="panel-head">
                <div>
                  <div className="panel-title">Parsed Output</div>
                  <div className="panel-subtitle">{parsedUrl ? `${parsedUrl.params.length} parameters` : "Details"}</div>
                </div>
                <button className="btn" onClick={() => copyText(urlOutput)}><Copy size={13} /> Copy Output</button>
              </div>
              <div className="panel-body field-stack">
                {parsedUrl ? (
                  <>
                    <div className="result-box code-output">{urlOutput}</div>
                    {parsedUrl.params.length > 0 && (
                      <div>
                        <div className="field-label">Query Parameters Table</div>
                        <div style={{ display: "grid", gap: 6 }}>
                          {parsedUrl.params.map((p, idx) => (
                            <div key={idx} style={{ display: "flex", gap: 10, padding: "6px 10px", background: "#0c130f", border: "1px solid var(--line)", borderRadius: 6, fontSize: 11 }}>
                              <strong style={{ color: "var(--green)", minWidth: 100 }}>{p.key}</strong>
                              <span style={{ color: "var(--text)", overflowWrap: "anywhere" }}>{p.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="result-box code-output">{urlOutput || "Click 'Parse URL', 'URL Encode', or 'HTML Entities Encode'."}</div>
                )}
              </div>
            </section>
          </div>
        );

      case "Diff Checker":
        return (
          <div className="field-stack">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <section className="panel">
                <div className="panel-head">
                  <div className="panel-title">Original Text (Old)</div>
                  <button className="btn" onClick={() => setDiffOld("")}>Clear</button>
                </div>
                <div className="panel-body">
                  <textarea className="textarea" value={diffOld} onChange={(e) => setDiffOld(e.target.value)} spellCheck={false} />
                </div>
              </section>
              <section className="panel">
                <div className="panel-head">
                  <div className="panel-title">Modified Text (New)</div>
                  <button className="btn" onClick={() => setDiffNew("")}>Clear</button>
                </div>
                <div className="panel-body">
                  <textarea className="textarea" value={diffNew} onChange={(e) => setDiffNew(e.target.value)} spellCheck={false} />
                </div>
              </section>
            </div>
            <div className="row-wrap">
              <button className="btn btn-primary" onClick={runDiff}><Split size={14} /> Compare Text</button>
              <span className="notice">
                {diffResults.length ? `${diffResults.filter((d) => d.type === "added").length} additions, ${diffResults.filter((d) => d.type === "removed").length} deletions` : ""}
              </span>
            </div>
            {diffResults.length > 0 && (
              <section className="panel">
                <div className="panel-head">
                  <div className="panel-title">Line-by-Line Diff</div>
                  <span className="pill">UNIFIED</span>
                </div>
                <div className="panel-body">
                  <div className="diff-container">
                    {diffResults.map((line, idx) => (
                      <div key={idx} className={`diff-row ${line.type}`}>
                        <span className="diff-gutter">
                          {line.type === "added" ? `+` : line.type === "removed" ? `-` : " "} {line.lineNew || line.lineOld}
                        </span>
                        <span>{line.content || " "}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </div>
        );

      case "Color Converter":
        return (
          <section className="panel">
            <div className="panel-head">
              <div>
                <div className="panel-title">Color Converter & Palette</div>
                <div className="panel-subtitle">Convert between HEX, RGB, HSL, and preview contrast.</div>
              </div>
              <span className="pill">CSS COLOR</span>
            </div>
            <div className="panel-body field-stack">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 140px", gap: 14 }}>
                <div>
                  <label className="field-label">HEX or CSS Color String</label>
                  <input className="field" value={colorInput} onChange={(e) => setColorInput(e.target.value)} placeholder="#7cff9b" />
                </div>
                <div>
                  <label className="field-label">Color Picker</label>
                  <input type="color" className="field" style={{ height: 42, padding: 3, cursor: "pointer" }} value={colorFormats?.hex || "#7cff9b"} onChange={(e) => { setColorInput(e.target.value); }} />
                </div>
              </div>
              <div className="row-wrap">
                <button className="btn btn-primary" onClick={runColor}><Palette size={14} /> Convert Color</button>
              </div>
              {colorFormats && (
                <div className="field-stack" style={{ marginTop: 10 }}>
                  <div className="color-swatch" style={{ background: colorFormats.hex, color: "#000" }}>
                    <span>{colorFormats.hex}</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                    <div className="panel" style={{ padding: 12 }}>
                      <div className="field-label">HEX</div>
                      <div style={{ fontWeight: "bold" }}>{colorFormats.hex}</div>
                      <button className="btn" style={{ marginTop: 8, padding: "4px 8px", fontSize: 10 }} onClick={() => copyText(colorFormats.hex)}>Copy</button>
                    </div>
                    <div className="panel" style={{ padding: 12 }}>
                      <div className="field-label">RGB</div>
                      <div style={{ fontWeight: "bold" }}>{colorFormats.rgb}</div>
                      <button className="btn" style={{ marginTop: 8, padding: "4px 8px", fontSize: 10 }} onClick={() => copyText(colorFormats.rgb)}>Copy</button>
                    </div>
                    <div className="panel" style={{ padding: 12 }}>
                      <div className="field-label">HSL</div>
                      <div style={{ fontWeight: "bold" }}>{colorFormats.hsl}</div>
                      <button className="btn" style={{ marginTop: 8, padding: "4px 8px", fontSize: 10 }} onClick={() => copyText(colorFormats.hsl)}>Copy</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        );

      case "SQL Formatter":
        return (
          <div className="tool-workspace">
            <section className="panel">
              <div className="panel-head">
                <div>
                  <div className="panel-title">SQL Query Input</div>
                  <div className="panel-subtitle">Paste unformatted SQL statements.</div>
                </div>
                <span className="pill">SQL</span>
              </div>
              <div className="panel-body field-stack">
                <textarea className="textarea" value={sqlInput} onChange={(e) => setSqlInput(e.target.value)} spellCheck={false} placeholder="SELECT * FROM table..." />
                <div className="row-wrap">
                  <button className="btn btn-primary" onClick={() => runSql(false)}><Database size={14} /> Format SQL</button>
                  <button className="btn" onClick={() => runSql(true)}>Minify SQL</button>
                  <button className="btn" onClick={() => { setSqlInput(""); setSqlOutput(""); }}>Clear</button>
                </div>
              </div>
            </section>
            <section className="panel">
              <div className="panel-head">
                <div>
                  <div className="panel-title">Formatted SQL</div>
                  <div className="panel-subtitle">Indented with uppercase keywords</div>
                </div>
                <button className="btn" onClick={() => copyText(sqlOutput)}><Copy size={13} /> Copy</button>
              </div>
              <div className="panel-body">
                <div className="result-box code-output">{sqlOutput || "Formatted SQL will appear here."}</div>
              </div>
            </section>
          </div>
        );

      case "Markdown Preview":
        return (
          <div className="tool-workspace">
            <section className="panel">
              <div className="panel-head">
                <div>
                  <div className="panel-title">Markdown Source</div>
                  <div className="panel-subtitle">GitHub Flavored Markdown.</div>
                </div>
                <span className="pill">GFM</span>
              </div>
              <div className="panel-body field-stack">
                <textarea className="textarea" value={markdownInput} onChange={(e) => setMarkdownInput(e.target.value)} spellCheck={false} />
                <div className="row-wrap">
                  <button className="btn" onClick={() => copyText(markdownInput)}><Copy size={13} /> Copy Markdown</button>
                  <span className="notice">{markdownInput.trim().split(/\s+/).filter(Boolean).length} words</span>
                </div>
              </div>
            </section>
            <section className="panel">
              <div className="panel-head">
                <div>
                  <div className="panel-title">Rendered Preview</div>
                  <div className="panel-subtitle">Instant visual output</div>
                </div>
              </div>
              <div className="panel-body">
                <div className="result-box" style={{ background: "#0c120e", color: "var(--text)", minHeight: 230 }}>
                  <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}>
                    {markdownInput}
                  </div>
                </div>
              </div>
            </section>
          </div>
        );

      case "Lorem Generator":
        return (
          <section className="panel">
            <div className="panel-head">
              <div>
                <div className="panel-title">Lorem Ipsum & Mock Data Generator</div>
                <div className="panel-subtitle">Generate realistic developer placeholders and mock JSON fixtures.</div>
              </div>
              <span className="pill">FIXTURES</span>
            </div>
            <div className="panel-body field-stack">
              <div className="row-wrap">
                {(["paragraphs", "sentences", "words", "mock_json"] as const).map((type) => (
                  <button key={type} className={`btn ${loremType === type ? "btn-primary" : ""}`} onClick={() => setLoremType(type)}>
                    {type === "mock_json" ? "Mock JSON Users" : type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <label className="field-label" style={{ marginBottom: 0 }}>Count:</label>
                <input className="field" type="number" min="1" max="20" style={{ width: 100 }} value={loremCount} onChange={(e) => setLoremCount(e.target.value)} />
              </div>
              <div className="row-wrap">
                <button className="btn btn-primary" onClick={runLorem}><Code2 size={14} /> Generate Data</button>
                <button className="btn" onClick={() => copyText(loremOutput)}><Copy size={13} /> Copy All</button>
              </div>
              <div className="result-box code-output" style={{ minHeight: 180 }}>
                {loremOutput || "Click 'Generate Data' to view generated lorem text or mock JSON objects."}
              </div>
            </div>
          </section>
        );

      case "API Workspace":
        return (
          <div className="tool-workspace">
            <section className="panel">
              <div className="panel-head">
                <div>
                  <div className="panel-title">HTTP Request</div>
                  <div className="panel-subtitle">Test APIs via Safe Proxy or Direct Browser Fetch.</div>
                </div>
                <div className="row-wrap">
                  <div style={{ display: "inline-flex", background: "#111a14", borderRadius: 6, border: "1px solid var(--line)", padding: 2 }}>
                    <button
                      className={`btn ${apiExecutionMode === "proxy" ? "btn-primary" : ""}`}
                      style={{ padding: "3px 8px", fontSize: 10, border: "none" }}
                      onClick={() => setApiExecutionMode("proxy")}
                    >
                      Safe Proxy
                    </button>
                    <button
                      className={`btn ${apiExecutionMode === "direct" ? "btn-primary" : ""}`}
                      style={{ padding: "3px 8px", fontSize: 10, border: "none" }}
                      onClick={() => setApiExecutionMode("direct")}
                      title="Direct browser fetch (CORS)"
                    >
                      Direct Fetch (CORS)
                    </button>
                  </div>
                  <button className="btn" onClick={generateCurl}><Terminal size={12} /> cURL</button>
                </div>
              </div>
              <div className="panel-body field-stack">
                <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 8 }}>
                  <select className="select" value={apiMethod} onChange={(e) => setApiMethod(e.target.value)}>
                    <option>GET</option>
                    <option>POST</option>
                    <option>PUT</option>
                    <option>PATCH</option>
                    <option>DELETE</option>
                    <option>HEAD</option>
                    <option>OPTIONS</option>
                  </select>
                  <input className="field" value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} placeholder="https://jsonplaceholder.typicode.com/posts/1" />
                </div>

                <div className="tab-list">
                  <button className={`tab-btn ${apiActiveTab === "headers" ? "active" : ""}`} onClick={() => setApiActiveTab("headers")}>
                    Headers ({apiHeaders.filter((h) => h.enabled).length})
                  </button>
                  <button className={`tab-btn ${apiActiveTab === "body" ? "active" : ""}`} onClick={() => setApiActiveTab("body")}>
                    Body {["POST", "PUT", "PATCH"].includes(apiMethod) ? "●" : ""}
                  </button>
                  <button className={`tab-btn ${apiActiveTab === "import" ? "active" : ""}`} onClick={() => setApiActiveTab("import")}>
                    Import cURL
                  </button>
                </div>

                {apiActiveTab === "headers" && (
                  <div className="field-stack">
                    {apiHeaders.map((header, idx) => (
                      <div key={idx} style={{ display: "grid", gridTemplateColumns: "24px 1fr 1fr 28px", gap: 6, alignItems: "center" }}>
                        <input type="checkbox" checked={header.enabled} onChange={(e) => {
                          const updated = [...apiHeaders];
                          updated[idx].enabled = e.target.checked;
                          setApiHeaders(updated);
                        }} />
                        <input className="field" placeholder="Header Name" value={header.key} onChange={(e) => {
                          const updated = [...apiHeaders];
                          updated[idx].key = e.target.value;
                          setApiHeaders(updated);
                        }} />
                        <input className="field" placeholder="Header Value" value={header.value} onChange={(e) => {
                          const updated = [...apiHeaders];
                          updated[idx].value = e.target.value;
                          setApiHeaders(updated);
                        }} />
                        <button className="btn" style={{ padding: 6 }} onClick={() => setApiHeaders(apiHeaders.filter((_, i) => i !== idx))}>
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    <button className="btn" style={{ alignSelf: "flex-start" }} onClick={() => setApiHeaders([...apiHeaders, { key: "", value: "", enabled: true }])}>
                      + Add Header
                    </button>
                  </div>
                )}

                {apiActiveTab === "body" && (
                  <div className="field-stack">
                    <div className="row-wrap">
                      <span className="notice">JSON payload for {apiMethod} requests:</span>
                      <button className="btn" style={{ marginLeft: "auto", fontSize: 10, padding: "3px 8px" }} onClick={() => {
                        try {
                          setApiBody(JSON.stringify(JSON.parse(apiBody), null, 2));
                        } catch {}
                      }}>Format JSON Body</button>
                    </div>
                    <textarea className="textarea" style={{ minHeight: 140 }} value={apiBody} onChange={(e) => setApiBody(e.target.value)} spellCheck={false} />
                  </div>
                )}

                {apiActiveTab === "import" && (
                  <div className="field-stack">
                    <textarea className="textarea" style={{ minHeight: 110 }} value={apiCurlImport} onChange={(e) => setApiCurlImport(e.target.value)} placeholder="Paste curl command here (e.g. curl -X POST 'https://api...' -H 'Content-Type: application/json' -d '{...}')" />
                    <button className="btn btn-primary" onClick={importCurlCommand}><DownloadCloud size={14} /> Parse & Apply cURL</button>
                  </div>
                )}

                <div className="row-wrap">
                  <button className="btn btn-primary" disabled={apiBusy || !apiUrl.trim()} onClick={sendApiRequest}>
                    {apiBusy ? <Activity size={14} /> : <Send size={14} />}
                    {apiBusy ? "Sending Request…" : "Send Request"}
                  </button>
                </div>
                <p className="notice">
                  {apiExecutionMode === "proxy"
                    ? "Safe proxy allowlists: jsonplaceholder, httpbin, dummyjson, reqres, pokeapi, catfact, github, localhost."
                    : "Direct Fetch mode sends request straight from your browser. Allows any local or remote CORS-enabled endpoint."}
                </p>
              </div>
            </section>

            <section className="panel">
              <div className="panel-head">
                <div>
                  <div className="panel-title">Response</div>
                  <div className="panel-subtitle">
                    {apiResult?.status ? (
                      <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                        <span className={apiResult.status < 300 ? "badge-2xx" : apiResult.status < 400 ? "badge-3xx" : "badge-4xx"}>
                          {apiResult.status} {apiResult.statusText}
                        </span>
                        {apiResult.durationMs !== undefined && (
                          <span style={{ color: "var(--muted)" }}>⏱ {apiResult.durationMs}ms</span>
                        )}
                      </span>
                    ) : (
                      "Response inspector"
                    )}
                  </div>
                </div>
                <button className="btn" onClick={() => copyText(apiResult?.data || apiResult?.error || "")}><Copy size={13} /> Copy</button>
              </div>
              <div className="panel-body field-stack">
                {apiResult?.error ? (
                  <div className="result-box error">{apiResult.error}</div>
                ) : apiResult?.data ? (
                  <div className="result-box code-output" style={{ maxHeight: 380, overflowY: "auto" }}>
                    {apiResult.data}
                  </div>
                ) : (
                  <div className="result-box code-output">Send a request to inspect response status and headers.</div>
                )}

                {apiHistory.length > 0 && (
                  <div>
                    <div className="field-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <History size={12} /> Recent Requests ({apiHistory.length})
                    </div>
                    <div style={{ display: "grid", gap: 6 }}>
                      {apiHistory.slice(0, 4).map((h) => (
                        <button key={h.id} className="btn" style={{ justifyContent: "space-between", width: "100%", padding: "6px 10px", fontSize: 10 }} onClick={() => {
                          setApiMethod(h.method);
                          setApiUrl(h.url);
                        }}>
                          <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <strong style={{ color: "var(--green)" }}>{h.method}</strong>
                            <span style={{ color: "var(--text)", textOverflow: "ellipsis", overflow: "hidden", maxWidth: 220 }}>{h.url}</span>
                          </span>
                          <span style={{ color: "var(--muted)" }}>{h.status || "—"}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        );

      case "AI Assistant":
        return (
          <section className="panel">
            <div className="panel-head">
              <div>
                <div className="panel-title">DevHub AI Developer Assistant</div>
                <div className="panel-subtitle">Your dedicated software engineering copilot for debugging, refactoring, and tests.</div>
              </div>
              <div className="row-wrap">
                <button className="btn" onClick={() => setAiShowSettings(!aiShowSettings)}>
                  <SlidersHorizontal size={13} /> Settings
                </button>
                <button className="btn" onClick={() => setAiMessages([])}>
                  <RotateCcw size={13} /> Clear Chat
                </button>
              </div>
            </div>
            <div className="panel-body field-stack">
              {aiShowSettings && (
                <div className="panel" style={{ padding: 14, background: "#111a14", border: "1px solid #284432" }}>
                  <div className="field-label">Custom OpenAI API Key (Stored locally in browser localStorage)</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input className="field" type="password" value={aiApiKey} onChange={(e) => saveAiApiKey(e.target.value)} placeholder="sk-..." />
                    <button className="btn" onClick={() => saveAiApiKey("")}>Clear</button>
                  </div>
                  <div style={{ marginTop: 10, display: "flex", gap: 10, alignItems: "center" }}>
                    <label className="field-label" style={{ marginBottom: 0 }}>Model:</label>
                    <select className="select" style={{ width: 160 }} value={aiModel} onChange={(e) => setAiModel(e.target.value)}>
                      <option value="gpt-4o-mini">gpt-4o-mini</option>
                      <option value="gpt-4o">gpt-4o</option>
                      <option value="gpt-4.1-mini">gpt-4.1-mini</option>
                    </select>
                  </div>
                  <p className="notice" style={{ marginTop: 8 }}>
                    If no custom key is provided, the server&apos;s OPENAI_API_KEY from .env.local will be used.
                  </p>
                </div>
              )}

              {/* Chat Thread */}
              <div className="chat-thread">
                {aiMessages.length === 0 ? (
                  <div style={{ padding: "30px 10px", textAlign: "center", color: "var(--muted)" }}>
                    <Sparkles size={32} style={{ color: "var(--green)", margin: "0 auto 12px" }} />
                    <div style={{ fontWeight: "bold", fontSize: 14, color: "var(--text)" }}>How can I help you today?</div>
                    <div style={{ fontSize: 11, marginTop: 4 }}>Ask about code bugs, architecture decisions, regex, or SQL queries.</div>
                    <div className="row-wrap" style={{ justifyContent: "center", marginTop: 18 }}>
                      <button className="btn" onClick={() => sendAiMessage("Explain how to safely validate user JWTs in a Next.js server action.")}>
                        Explain JWT validation in Next.js
                      </button>
                      <button className="btn" onClick={() => sendAiMessage("Write a TypeScript function to debounce an async operation with cancellation.")}>
                        Write debounce function
                      </button>
                      <button className="btn" onClick={() => sendAiMessage("How do I optimize SQL index queries for a high-traffic users table?")}>
                        Optimize SQL index
                      </button>
                    </div>
                  </div>
                ) : (
                  aiMessages.map((msg, i) => (
                    <div key={i} className={`chat-msg ${msg.role}`}>
                      <div style={{ fontSize: 10, fontWeight: "bold", color: msg.role === "user" ? "var(--green)" : "#8be3a2", marginBottom: 4 }}>
                        {msg.role === "user" ? "YOU" : "DEVHUB AI"}
                      </div>
                      <div style={{ whiteSpace: "pre-wrap" }}>{msg.content}</div>
                      {msg.role === "assistant" && (
                        <div style={{ marginTop: 8, display: "flex", justifyContent: "flex-end" }}>
                          <button className="btn" style={{ padding: "3px 7px", fontSize: 10 }} onClick={() => copyText(msg.content)}>
                            <Copy size={11} /> Copy
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
                {aiBusy && (
                  <div className="chat-msg assistant" style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <Activity size={14} className="animate-spin" />
                    <span>DevHub AI is thinking…</span>
                  </div>
                )}
              </div>

              {/* Input row */}
              <div style={{ display: "flex", gap: 10 }}>
                <textarea
                  className="textarea"
                  style={{ minHeight: 65, flex: 1 }}
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      sendAiMessage();
                    }
                  }}
                  placeholder="Ask a question or describe your coding task... (Cmd + Enter to send)"
                />
                <button className="btn btn-primary" style={{ alignSelf: "flex-end", height: 42, padding: "0 18px" }} disabled={aiBusy || !aiInput.trim()} onClick={() => sendAiMessage()}>
                  <Send size={14} /> Send
                </button>
              </div>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  // --- NAVIGATION ITEM ---
  const navItem = (toolName: View, icon: typeof Braces) => {
    const Icon = icon;
    const isFav = favorites.includes(toolName);
    return (
      <div key={toolName} style={{ display: "flex", alignItems: "center" }}>
        <button
          className={`nav-item ${view === toolName ? "active" : ""}`}
          onClick={() => { setView(toolName); setMobileNav(false); }}
        >
          <Icon size={15} /> <span>{toolName}</span>
          {toolName === "AI Assistant" && <span className="pill" style={{ marginLeft: "auto" }}>AI</span>}
          {toolName === "API Workspace" && <span className="pill" style={{ marginLeft: "auto" }}>REST</span>}
        </button>
        {toolName !== "Overview" && (
          <button
            onClick={() => toggleFavorite(toolName)}
            style={{ background: "transparent", border: "none", padding: 6, color: isFav ? "#ffcf33" : "#3b4d41", cursor: "pointer" }}
            title={isFav ? "Unfavorite" : "Favorite"}
          >
            <Star size={12} fill={isFav ? "#ffcf33" : "none"} />
          </button>
        )}
      </div>
    );
  };

  const toolCard = (tool: Tool) => {
    const Icon = tool.icon;
    const isFav = favorites.includes(tool.name);
    return (
      <button
        className="tool-card"
        key={tool.name}
        onClick={() => {
          setView(tool.name);
          if (tool.name === "JSON Formatter") setJsonInput(starterJson);
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="tool-icon"><Icon size={16} /></span>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span className="pill">{tool.tag}</span>
            <span
              onClick={(e) => { e.stopPropagation(); toggleFavorite(tool.name); }}
              style={{ cursor: "pointer", color: isFav ? "#ffcf33" : "#3b4d41", display: "grid", placeItems: "center" }}
            >
              <Star size={13} fill={isFav ? "#ffcf33" : "none"} />
            </span>
          </div>
        </div>
        <div>
          <div className="tool-title">{tool.name}</div>
          <div className="tool-desc" style={{ marginTop: 6 }}>{tool.description}</div>
        </div>
      </button>
    );
  };

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><Terminal size={20} /></div>
          <div>
            <div className="brand-name">dev<span>hub</span></div>
            <div className="eyebrow" style={{ marginTop: 3 }}>Developer workspace</div>
          </div>
        </div>

        <div className="nav-group">
          <div className="nav-label">Core Workspace</div>
          {navItem("Overview", LayoutDashboard)}
          {navItem("API Workspace", Workflow)}
          {navItem("AI Assistant", Sparkles)}
        </div>

        {favorites.length > 0 && (
          <div className="nav-group">
            <div className="nav-label">Favorites ★</div>
            {tools.filter((t) => favorites.includes(t.name)).map((t) => navItem(t.name, t.icon))}
          </div>
        )}

        <div className="nav-group">
          <div className="nav-label">Developer Toolkit ({tools.length})</div>
          {tools.filter((t) => !favorites.includes(t.name)).map((t) => navItem(t.name, t.icon))}
        </div>

        <div className="sidebar-bottom">
          <div style={{ fontSize: 11, fontWeight: 800, marginBottom: 8 }}>
            <span className="status-dot" />All systems operational
          </div>
          <div className="notice">{tools.length} developer utilities · Web Crypto ready</div>
          <div className="notice" style={{ marginTop: 10 }}>DEVHUB <span style={{ color: "#a1ffb4" }}>v2.2.0</span></div>
        </div>
      </aside>

      {/* Main Container */}
      <main className="main">
        <header className="topbar">
          <div className="row-wrap">
            <button className="btn mobile-menu" onClick={() => setMobileNav(!mobileNav)}>
              <Menu size={15} />
            </button>
            <div className="breadcrumb">
              devhub <span style={{ color: "#46554b" }}>/</span> <strong>{view.toLowerCase()}</strong>
            </div>
          </div>

          <div className="top-actions">
            <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "monospace", marginRight: 6 }}>
              {currentTime}
            </div>
            <button className="kbd" style={{ cursor: "pointer", background: "#111a14" }} onClick={() => setCmdOpen(true)}>
              <Command size={10} style={{ display: "inline" }} /> K Search Tools
            </button>
            <button className="btn hide-mobile" onClick={() => setView("AI Assistant")}>
              <Sparkles size={13} /> Ask AI
            </button>
            <div className="avatar">DH</div>
          </div>
        </header>

        {mobileNav && (
          <div style={{ padding: 12, borderBottom: "1px solid var(--line)", display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 6, background: "#0c120e" }}>
            {navItem("Overview", LayoutDashboard)}
            {navItem("API Workspace", Workflow)}
            {navItem("AI Assistant", Sparkles)}
            {tools.map((t) => navItem(t.name, t.icon))}
          </div>
        )}

        <div className="content">
          {view === "Overview" ? (
            <>
              <div className="welcome-row">
                <div>
                  <div className="eyebrow"><span className="status-dot" /> DEVELOPER COMMAND CENTER</div>
                  <h1>Build faster.<br /><span className="accent">Ship smarter.</span></h1>
                  <p className="subtitle">
                    An all-in-one dark terminal developer suite with {tools.length} utilities: format payloads, generate TypeScript types, inspect JWTs, test regular expressions, interact with REST APIs, and chat with your AI copilot.
                  </p>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button className="btn btn-primary" onClick={() => setView("AI Assistant")}>
                    <WandSparkles size={14} /> Open AI Assistant <ArrowRight size={14} />
                  </button>
                  <button className="btn" onClick={() => setView("API Workspace")}>
                    <Workflow size={14} /> API Workspace
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid stats-grid">
                <div className="panel stat">
                  <div className="stat-top"><span>TOOLKIT</span><Braces size={15} color="#7cff9b" /></div>
                  <div className="stat-value">{tools.length}</div>
                  <div className="stat-foot">100% Client-Side Web Crypto</div>
                </div>
                <div className="panel stat">
                  <div className="stat-top"><span>API WORKSPACE</span><Workflow size={15} color="#7cff9b" /></div>
                  <div className="stat-value" style={{ fontSize: 20 }}>Dual Mode</div>
                  <div className="stat-foot">Safe Proxy & Direct CORS Fetch</div>
                </div>
                <div className="panel stat">
                  <div className="stat-top"><span>AI COPILOT</span><Sparkles size={15} color="#7cff9b" /></div>
                  <div className="stat-value" style={{ fontSize: 20 }}>Multi-Turn</div>
                  <div className="stat-foot">Server-side or custom OpenAI key</div>
                </div>
                <div className="panel stat">
                  <div className="stat-top"><span>COMMAND PALETTE</span><Command size={15} color="#7cff9b" /></div>
                  <div className="stat-value" style={{ fontSize: 20 }}>Cmd + K</div>
                  <div className="stat-foot">Instant tool navigation</div>
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="tab-list" style={{ marginTop: 10 }}>
                {(["All", "Format & Convert", "Security", "Network", "Text", "Workspace"] as const).map((cat) => (
                  <button key={cat} className={`tab-btn ${categoryFilter === cat ? "active" : ""}`} onClick={() => setCategoryFilter(cat)}>
                    {cat}
                  </button>
                ))}
              </div>

              {/* All Tools Grid with Search */}
              <section className="panel" style={{ marginTop: 14 }}>
                <div className="panel-head">
                  <div>
                    <div className="panel-title">Developer Toolbox</div>
                    <div className="panel-subtitle">Search and launch utilities.</div>
                  </div>
                  <span className="pill">{filteredTools.length} TOOLS</span>
                </div>
                <div className="panel-body">
                  <div style={{ position: "relative", marginBottom: 14 }}>
                    <Search size={14} style={{ position: "absolute", top: 12, left: 12, color: "#7c8d82" }} />
                    <input className="field" style={{ paddingLeft: 36 }} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filter tools by name, tag, or description… (e.g. JSON to TS, Cron, Password, JWT, Regex)" />
                  </div>
                  <div className="tool-grid">
                    {filteredTools.map(toolCard)}
                  </div>
                  {filteredTools.length === 0 && <p className="notice">No tools match your filter.</p>}
                </div>
              </section>
            </>
          ) : (
            <>
              <div className="section-heading">
                <div>
                  <div className="eyebrow">DEVHUB / TOOLKIT</div>
                  <h1 style={{ fontSize: 28 }}>{view}</h1>
                  <p>{tools.find((t) => t.name === view)?.description || "Developer utility workspace"}</p>
                </div>
                <div className="row-wrap">
                  <button className="btn" onClick={() => toggleFavorite(view)}>
                    <Star size={13} fill={favorites.includes(view) ? "#ffcf33" : "none"} color={favorites.includes(view) ? "#ffcf33" : "currentColor"} />
                    {favorites.includes(view) ? "Favorited" : "Favorite"}
                  </button>
                  <button className="btn" onClick={() => setView("Overview")}>
                    <LayoutDashboard size={13} /> Overview
                  </button>
                </div>
              </div>
              {renderWorkspace()}
            </>
          )}

          <div className="footer-note">
            DEVHUB · All-in-One Developer Platform · Powered by Next.js & Web Standards · Local-first & Private
          </div>
        </div>
      </main>

      {/* Global Command Palette Modal (Cmd + K) */}
      {cmdOpen && (
        <div className="modal-overlay" onClick={() => setCmdOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="cmd-input-wrap">
              <Search size={16} style={{ color: "var(--green)" }} />
              <input
                className="cmd-input"
                autoFocus
                placeholder="Type a tool name or command... (e.g. JSON, TS, Cron, JWT, API, Diff)"
                value={cmdSearch}
                onChange={(e) => {
                  setCmdSearch(e.target.value);
                  setCmdSelectedIndex(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setCmdSelectedIndex((prev) => Math.min(prev + 1, cmdFilteredTools.length - 1));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setCmdSelectedIndex((prev) => Math.max(prev - 1, 0));
                  } else if (e.key === "Enter") {
                    e.preventDefault();
                    if (cmdFilteredTools[cmdSelectedIndex]) {
                      setView(cmdFilteredTools[cmdSelectedIndex].name);
                      setCmdOpen(false);
                    }
                  }
                }}
              />
              <span className="kbd" style={{ fontSize: 9 }}>ESC</span>
            </div>
            <div className="cmd-list">
              {cmdFilteredTools.map((tool, idx) => {
                const Icon = tool.icon;
                return (
                  <button
                    key={tool.name}
                    className={`cmd-item ${idx === cmdSelectedIndex ? "selected" : ""}`}
                    onClick={() => {
                      setView(tool.name);
                      setCmdOpen(false);
                    }}
                  >
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <Icon size={14} style={{ color: "var(--green)" }} />
                      <span>{tool.name}</span>
                      <span style={{ color: "var(--muted)", fontSize: 10 }}>— {tool.description}</span>
                    </div>
                    <ChevronRight size={13} style={{ color: "#486250" }} />
                  </button>
                );
              })}
              {cmdFilteredTools.length === 0 && (
                <div style={{ padding: "16px", textAlign: "center", color: "var(--muted)", fontSize: 12 }}>
                  No tools found matching &quot;{cmdSearch}&quot;.
                </div>
              )}
              <div style={{ padding: "8px 12px", borderTop: "1px solid var(--line)", display: "flex", justifyContent: "space-between", color: "#617067", fontSize: 10 }}>
                <span>Use ↑↓ arrows to navigate, Enter to select</span>
                <span>DevHub v2.2</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div role="status" style={{ position: "fixed", bottom: 20, right: 20, padding: "12px 18px", border: "1px solid #386347", borderRadius: 9, background: "#112017", color: "#b6ffc6", fontSize: 12, boxShadow: "0 10px 40px #000c", zIndex: 2000, display: "flex", gap: 8, alignItems: "center" }}>
          <Check size={14} /> {toast}
        </div>
      )}
    </div>
  );
}
