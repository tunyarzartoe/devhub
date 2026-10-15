/**
 * Pure TypeScript developer utility helpers for DevHub
 */

// --- UTF-8 Safe Base64 Encoding & Decoding ---
export function utf8ToBase64(str: string, urlSafe = false): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  const len = bytes.length;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  if (!urlSafe) return base64;
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function base64ToUtf8(b64: string, urlSafe = false): string {
  let clean = b64.trim();
  if (urlSafe) {
    clean = clean.replace(/-/g, "+").replace(/_/g, "/");
    while (clean.length % 4) clean += "=";
  }
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

// --- CRC32 Checksum ---
export function crc32(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let crc = 0 ^ -1;
  for (let i = 0; i < bytes.length; i++) {
    crc = (crc >>> 8) ^ CRC32_TABLE[(crc ^ bytes[i]) & 0xff];
  }
  return ((crc ^ -1) >>> 0).toString(16).padStart(8, "0");
}

const CRC32_TABLE: number[] = (() => {
  const table: number[] = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table.push(c);
  }
  return table;
})();

// --- MD5 Implementation ---
export function md5(string: string): string {
  function rotateLeft(lValue: number, iShiftBits: number) {
    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
  }
  function addUnsigned(lX: number, lY: number) {
    const lX4 = lX & 0x40000000;
    const lY4 = lY & 0x40000000;
    const lX8 = lX & 0x80000000;
    const lY8 = lY & 0x80000000;
    const lResult = (lX & 0x3fffffff) + (lY & 0x3fffffff);
    if (lX4 & lY4) return lResult ^ 0x80000000 ^ lX8 ^ lY8;
    if (lX4 | lY4) {
      if (lResult & 0x40000000) return lResult ^ 0xc0000000 ^ lX8 ^ lY8;
      return lResult ^ 0x40000000 ^ lX8 ^ lY8;
    }
    return lResult ^ lX8 ^ lY8;
  }
  function F(x: number, y: number, z: number) { return (x & y) | (~x & z); }
  function G(x: number, y: number, z: number) { return (x & z) | (y & ~z); }
  function H(x: number, y: number, z: number) { return x ^ y ^ z; }
  function I(x: number, y: number, z: number) { return y ^ (x | ~z); }

  function FF(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function GG(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function HH(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function II(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }

  const encoder = new TextEncoder();
  const bytes = encoder.encode(string);
  const lMessageLength = bytes.length;
  const lNumberOfWordsTemp1 = lMessageLength + 8;
  const lNumberOfWordsTemp2 = (lNumberOfWordsTemp1 - (lNumberOfWordsTemp1 % 64)) / 64;
  const lNumberOfWords = (lNumberOfWordsTemp2 + 1) * 16;
  const x = new Array<number>(lNumberOfWords).fill(0);

  for (let i = 0; i < lMessageLength; i++) {
    const wordIndex = Math.floor(i / 4);
    const bytePos = (i % 4) * 8;
    x[wordIndex] |= (bytes[i] << bytePos);
  }
  const wordIndex = Math.floor(lMessageLength / 4);
  const bytePos = (lMessageLength % 4) * 8;
  x[wordIndex] |= (0x80 << bytePos);
  x[lNumberOfWords - 2] = lMessageLength * 8;

  function wordToHex(lValue: number) {
    let wordToHexValue = "";
    for (let lCount = 0; lCount <= 3; lCount++) {
      const lByte = (lValue >>> (lCount * 8)) & 255;
      const wordToHexValueTemp = "0" + lByte.toString(16);
      wordToHexValue += wordToHexValueTemp.slice(-2);
    }
    return wordToHexValue;
  }

  let a = 0x67452301;
  let b = 0xefcdab89;
  let c = 0x98badcfe;
  let d = 0x10325476;

  for (let k = 0; k < x.length; k += 16) {
    const AA = a;
    const BB = b;
    const CC = c;
    const DD = d;
    a = FF(a, b, c, d, x[k + 0] || 0, 7, 0xd76aa478);
    d = FF(d, a, b, c, x[k + 1] || 0, 12, 0xe8c7b756);
    c = FF(c, d, a, b, x[k + 2] || 0, 17, 0x242070db);
    b = FF(b, c, d, a, x[k + 3] || 0, 22, 0xc1bdceee);
    a = FF(a, b, c, d, x[k + 4] || 0, 7, 0xf57c0faf);
    d = FF(d, a, b, c, x[k + 5] || 0, 12, 0x4787c62a);
    c = FF(c, d, a, b, x[k + 6] || 0, 17, 0xa8304613);
    b = FF(b, c, d, a, x[k + 7] || 0, 22, 0xfd469501);
    a = FF(a, b, c, d, x[k + 8] || 0, 7, 0x698098d8);
    d = FF(d, a, b, c, x[k + 9] || 0, 12, 0x8b44f7af);
    c = FF(c, d, a, b, x[k + 10] || 0, 17, 0xffff5bb1);
    b = FF(b, c, d, a, x[k + 11] || 0, 22, 0x895cd7be);
    a = FF(a, b, c, d, x[k + 12] || 0, 7, 0x6b901122);
    d = FF(d, a, b, c, x[k + 13] || 0, 12, 0xfd987193);
    c = FF(c, d, a, b, x[k + 14] || 0, 17, 0xa679438e);
    b = FF(b, c, d, a, x[k + 15] || 0, 22, 0x49b40821);

    a = GG(a, b, c, d, x[k + 1] || 0, 5, 0xf61e2562);
    d = GG(d, a, b, c, x[k + 6] || 0, 9, 0xc040b340);
    c = GG(c, d, a, b, x[k + 11] || 0, 14, 0x265e5a51);
    b = GG(b, c, d, a, x[k + 0] || 0, 20, 0xe9b6c7aa);
    a = GG(a, b, c, d, x[k + 5] || 0, 5, 0xd62f105d);
    d = GG(d, a, b, c, x[k + 10] || 0, 9, 0x2441453);
    c = GG(c, d, a, b, x[k + 15] || 0, 14, 0xd8a1e681);
    b = GG(b, c, d, a, x[k + 4] || 0, 20, 0xe7d3fbc8);
    a = GG(a, b, c, d, x[k + 9] || 0, 5, 0x21e1cde6);
    d = GG(d, a, b, c, x[k + 14] || 0, 9, 0xc33707d6);
    c = GG(c, d, a, b, x[k + 3] || 0, 14, 0xf4d50d87);
    b = GG(b, c, d, a, x[k + 8] || 0, 20, 0x455a14ed);
    a = GG(a, b, c, d, x[k + 13] || 0, 5, 0xa9e3e905);
    d = GG(d, a, b, c, x[k + 2] || 0, 9, 0xfcefa3f8);
    c = GG(c, d, a, b, x[k + 7] || 0, 14, 0x676f02d9);
    b = GG(b, c, d, a, x[k + 12] || 0, 20, 0x8d2a4c8a);

    a = HH(a, b, c, d, x[k + 5] || 0, 4, 0xfffa3942);
    d = HH(d, a, b, c, x[k + 8] || 0, 11, 0x8771f681);
    c = HH(c, d, a, b, x[k + 11] || 0, 16, 0x6d9d6122);
    b = HH(b, c, d, a, x[k + 14] || 0, 23, 0xfde5380c);
    a = HH(a, b, c, d, x[k + 1] || 0, 4, 0xa4beea44);
    d = HH(d, a, b, c, x[k + 4] || 0, 11, 0x4bdecfa9);
    c = HH(c, d, a, b, x[k + 7] || 0, 16, 0xf6bb4b60);
    b = HH(b, c, d, a, x[k + 10] || 0, 23, 0xbebfbc70);
    a = HH(a, b, c, d, x[k + 13] || 0, 4, 0x289b7ec6);
    d = HH(d, a, b, c, x[k + 0] || 0, 11, 0xeaa127fa);
    c = HH(c, d, a, b, x[k + 3] || 0, 16, 0xd4ef3085);
    b = HH(b, c, d, a, x[k + 6] || 0, 23, 0x4881d05);
    a = HH(a, b, c, d, x[k + 9] || 0, 4, 0xd9d4d039);
    d = HH(d, a, b, c, x[k + 12] || 0, 11, 0xe6db99e5);
    c = HH(c, d, a, b, x[k + 15] || 0, 16, 0x1fa27cf8);
    b = HH(b, c, d, a, x[k + 2] || 0, 23, 0xc4ac5665);

    a = II(a, b, c, d, x[k + 0] || 0, 6, 0xf4292244);
    d = II(d, a, b, c, x[k + 7] || 0, 10, 0x432aff97);
    c = II(c, d, a, b, x[k + 14] || 0, 15, 0xab9423a7);
    b = II(b, c, d, a, x[k + 5] || 0, 21, 0xfc93a039);
    a = II(a, b, c, d, x[k + 12] || 0, 6, 0x655b59c3);
    d = II(d, a, b, c, x[k + 3] || 0, 10, 0x8f0ccc92);
    c = II(c, d, a, b, x[k + 10] || 0, 15, 0xffeff47d);
    b = II(b, c, d, a, x[k + 1] || 0, 21, 0x85845dd1);
    a = II(a, b, c, d, x[k + 8] || 0, 6, 0x6fa87e4f);
    d = II(d, a, b, c, x[k + 15] || 0, 10, 0xfe2ce6e0);
    c = II(c, d, a, b, x[k + 6] || 0, 15, 0xa3014314);
    b = II(b, c, d, a, x[k + 13] || 0, 21, 0x4e0811a1);
    a = II(a, b, c, d, x[k + 4] || 0, 6, 0xf7537e82);
    d = II(d, a, b, c, x[k + 11] || 0, 10, 0xbd3af235);
    c = II(c, d, a, b, x[k + 2] || 0, 15, 0x2ad7d2bb);
    b = II(b, c, d, a, x[k + 9] || 0, 21, 0xeb86d391);

    a = addUnsigned(a, AA);
    b = addUnsigned(b, BB);
    c = addUnsigned(c, CC);
    d = addUnsigned(d, DD);
  }

  return (wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d)).toLowerCase();
}

// --- Web Crypto Hash (SHA-1, SHA-256, SHA-512) & HMAC ---
export async function computeHash(
  algorithm: "SHA-256" | "SHA-512" | "SHA-1" | "MD5" | "CRC-32",
  input: string,
  secretKey?: string
): Promise<string> {
  if (algorithm === "CRC-32") {
    return crc32(input);
  }
  if (algorithm === "MD5") {
    return md5(input);
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(input);

  if (secretKey && secretKey.trim()) {
    const keyData = encoder.encode(secretKey);
    const key = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: algorithm },
      false,
      ["sign"]
    );
    const signature = await crypto.subtle.sign("HMAC", key, data);
    return Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// --- UUID v7 (RFC 9562 Unix Epoch Timestamp) ---
export function generateUuidV7(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const now = Date.now();

  // 48-bit timestamp
  bytes[0] = Math.floor(now / 0x10000000000) & 0xff;
  bytes[1] = Math.floor(now / 0x100000000) & 0xff;
  bytes[2] = Math.floor(now / 0x1000000) & 0xff;
  bytes[3] = Math.floor(now / 0x10000) & 0xff;
  bytes[4] = Math.floor(now / 0x100) & 0xff;
  bytes[5] = now & 0xff;

  // version 7 (0111)
  bytes[6] = (bytes[6] & 0x0f) | 0x70;
  // variant 10xx
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  return Array.from(bytes)
    .map((b, i) => {
      const hex = b.toString(16).padStart(2, "0");
      return [3, 5, 7, 9].includes(i) ? hex + "-" : hex;
    })
    .join("");
}

// --- NanoID Generator ---
export function generateNanoId(size = 21, customAlphabet?: string): string {
  const alphabet = customAlphabet || "useandom-26T1983_40STOpknifeBFailStorey";
  const bytes = new Uint8Array(size);
  crypto.getRandomValues(bytes);
  let id = "";
  for (let i = 0; i < size; i++) {
    id += alphabet[bytes[i] % alphabet.length];
  }
  return id;
}

// --- ULID Generator ---
export function generateUlid(): string {
  const ENCODING = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
  const now = Date.now();
  let timeStr = "";
  let time = now;
  for (let i = 9; i >= 0; i--) {
    timeStr = ENCODING[time % 32] + timeStr;
    time = Math.floor(time / 32);
  }

  const randBytes = new Uint8Array(10);
  crypto.getRandomValues(randBytes);
  let randStr = "";
  for (let i = 0; i < 16; i++) {
    randStr += ENCODING[randBytes[i % 10] % 32];
  }

  return timeStr + randStr;
}

// --- Password & Secret Token Generator ---
export type PasswordOptions = {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  avoidAmbiguous: boolean;
};

export function generatePassword(opts: PasswordOptions): { password: string; entropyBits: number } {
  let chars = "";
  if (opts.lowercase) chars += opts.avoidAmbiguous ? "abcdefghjkmnpqrstuvwxyz" : "abcdefghijklmnopqrstuvwxyz";
  if (opts.uppercase) chars += opts.avoidAmbiguous ? "ABCDEFGHJKLMNPQRSTUVWXYZ" : "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (opts.numbers) chars += opts.avoidAmbiguous ? "23456789" : "0123456789";
  if (opts.symbols) chars += "!@#$%^&*()_+-=[]{}|;:,.<>?";

  if (!chars) chars = "abcdefghijklmnopqrstuvwxyz";

  const randomBytes = new Uint8Array(opts.length);
  crypto.getRandomValues(randomBytes);
  let password = "";
  for (let i = 0; i < opts.length; i++) {
    password += chars[randomBytes[i] % chars.length];
  }

  const entropyBits = Math.round(opts.length * Math.log2(chars.length));
  return { password, entropyBits };
}

// --- JSON to TypeScript Interface Generator ---
export function jsonToTypeScript(jsonStr: string, rootName = "RootObject"): string {
  try {
    const parsed = JSON.parse(jsonStr);
    const interfaces: string[] = [];

    function capitalize(str: string): string {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function getType(val: unknown, keyName: string): string {
      if (val === null) return "null";
      if (val === undefined) return "undefined";
      if (typeof val === "string") return "string";
      if (typeof val === "number") return "number";
      if (typeof val === "boolean") return "boolean";

      if (Array.isArray(val)) {
        if (val.length === 0) return "unknown[]";
        const innerType = getType(val[0], keyName + "Item");
        return `${innerType}[]`;
      }

      if (typeof val === "object") {
        const interfaceName = capitalize(keyName);
        generateInterface(val as Record<string, unknown>, interfaceName);
        return interfaceName;
      }

      return "unknown";
    }

    function generateInterface(obj: Record<string, unknown>, name: string) {
      const lines = [`export interface ${name} {`];
      for (const [k, v] of Object.entries(obj)) {
        const typeStr = getType(v, k);
        const validKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : JSON.stringify(k);
        lines.push(`  ${validKey}: ${typeStr};`);
      }
      lines.push("}");
      interfaces.push(lines.join("\n"));
    }

    if (Array.isArray(parsed)) {
      if (parsed.length > 0 && typeof parsed[0] === "object" && parsed[0] !== null) {
        generateInterface(parsed[0] as Record<string, unknown>, rootName + "Item");
        return interfaces.reverse().join("\n\n") + `\n\nexport type ${rootName} = ${rootName}Item[];`;
      }
      return `export type ${rootName} = unknown[];`;
    }

    if (typeof parsed === "object" && parsed !== null) {
      generateInterface(parsed as Record<string, unknown>, rootName);
      return interfaces.reverse().join("\n\n");
    }

    return `export type ${rootName} = ${typeof parsed};`;
  } catch (err) {
    return `// Failed to generate TypeScript: ${err instanceof Error ? err.message : "Invalid JSON"}`;
  }
}

// --- Cron Expression Explainer & Schedule ---
export function explainCron(cronExpr: string): { explanation: string; nextRuns: string[]; error?: string } {
  try {
    const parts = cronExpr.trim().split(/\s+/);
    if (parts.length < 5) {
      return { explanation: "", nextRuns: [], error: "Cron expression must have at least 5 space-separated fields: minute hour day-of-month month day-of-week." };
    }

    const [min, hour, dom, mon, dow] = parts;
    const descParts: string[] = [];

    if (min === "*") descParts.push("every minute");
    else if (min.startsWith("*/")) descParts.push(`every ${min.slice(2)} minutes`);
    else descParts.push(`at minute ${min}`);

    if (hour === "*") descParts.push("of every hour");
    else if (hour.startsWith("*/")) descParts.push(`every ${hour.slice(2)} hours`);
    else descParts.push(`at hour ${hour}:00`);

    if (dom !== "*") descParts.push(`on day ${dom} of the month`);
    if (mon !== "*") descParts.push(`in month ${mon}`);
    if (dow !== "*") descParts.push(`on day-of-week ${dow}`);

    const explanation = descParts.join(", ");

    // Approximate next 5 runs
    const nextRuns: string[] = [];
    const now = new Date();
    let current = new Date(now.getTime() + 60000);
    current.setSeconds(0, 0);

    let attempts = 0;
    while (nextRuns.length < 5 && attempts < 1000) {
      attempts++;
      const mMatch = min === "*" || (min.startsWith("*/") && current.getMinutes() % Number(min.slice(2)) === 0) || current.getMinutes() === Number(min);
      const hMatch = hour === "*" || (hour.startsWith("*/") && current.getHours() % Number(hour.slice(2)) === 0) || current.getHours() === Number(hour);
      const dMatch = dow === "*" || current.getDay() === Number(dow) % 7;

      if (mMatch && hMatch && dMatch) {
        nextRuns.push(current.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "medium" }));
      }
      current = new Date(current.getTime() + 60000);
    }

    return { explanation: explanation.charAt(0).toUpperCase() + explanation.slice(1), nextRuns };
  } catch (err) {
    return { explanation: "", nextRuns: [], error: err instanceof Error ? err.message : "Invalid cron expression" };
  }
}

// --- Number Base Converter ---
export type NumberBases = {
  decimal: string;
  hexadecimal: string;
  binary: string;
  octal: string;
  error?: string;
};

export function convertNumberBase(value: string, fromBase: 2 | 8 | 10 | 16): NumberBases {
  try {
    const clean = value.trim();
    if (!clean) return { decimal: "", hexadecimal: "", binary: "", octal: "" };
    const num = parseInt(clean, fromBase);
    if (isNaN(num)) throw new Error("Invalid number for selected base.");

    return {
      decimal: num.toString(10),
      hexadecimal: "0x" + num.toString(16).toUpperCase(),
      binary: num.toString(2).padStart(8, "0"),
      octal: "0o" + num.toString(8),
    };
  } catch (err) {
    return {
      decimal: "",
      hexadecimal: "",
      binary: "",
      octal: "",
      error: err instanceof Error ? err.message : "Conversion error",
    };
  }
}

// --- HTML Entities Encoder / Decoder ---
export function encodeHtmlEntities(str: string): string {
  return str.replace(/[&<>"']/g, (m) => {
    switch (m) {
      case "&": return "&amp;";
      case "<": return "&lt;";
      case ">": return "&gt;";
      case '"': return "&quot;";
      case "'": return "&#39;";
      default: return m;
    }
  });
}

export function decodeHtmlEntities(str: string): string {
  const map: Record<string, string> = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
    "&apos;": "'",
  };
  return str.replace(/&(?:amp|lt|gt|quot|#39|apos);/g, (m) => map[m] || m);
}

// --- cURL Command Parser ---
export type ParsedCurl = {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: string;
  error?: string;
};

export function parseCurl(curlCmd: string): ParsedCurl {
  try {
    const cleaned = curlCmd.replace(/\\\n/g, " ").trim();
    if (!cleaned.startsWith("curl")) {
      return { method: "GET", url: "", headers: {}, error: "Must start with 'curl'." };
    }

    let method = "GET";
    let url = "";
    const headers: Record<string, string> = {};
    let body = "";

    // Extract method -X METHOD
    const methodMatch = cleaned.match(/-X\s+([A-Z]+)/i);
    if (methodMatch) {
      method = methodMatch[1].toUpperCase();
    }

    // Extract headers -H "Key: Value" or -H 'Key: Value'
    const headerRegex = /-H\s+['"]([^'"]+)['"]/g;
    let match;
    while ((match = headerRegex.exec(cleaned)) !== null) {
      const colonIdx = match[1].indexOf(":");
      if (colonIdx > 0) {
        const key = match[1].slice(0, colonIdx).trim();
        const value = match[1].slice(colonIdx + 1).trim();
        headers[key] = value;
      }
    }

    // Extract body --data, -d, --data-raw
    const bodyMatch = cleaned.match(/(?:--data|--data-raw|-d)\s+(['"])([\s\S]*?)\1/);
    if (bodyMatch) {
      body = bodyMatch[2];
      if (method === "GET") method = "POST";
    }

    // Extract URL
    const tokens = cleaned.split(/\s+/);
    for (const token of tokens) {
      const stripped = token.replace(/['"]/g, "");
      if (stripped.startsWith("http://") || stripped.startsWith("https://")) {
        url = stripped;
        break;
      }
    }

    return { method, url, headers, body: body || undefined };
  } catch (err) {
    return {
      method: "GET",
      url: "",
      headers: {},
      error: err instanceof Error ? err.message : "Failed to parse curl command.",
    };
  }
}

// --- JWT Decoder ---
export type DecodedJwt = {
  header: Record<string, unknown> | null;
  payload: Record<string, unknown> | null;
  signature: string;
  isExpired: boolean | null;
  expiresAt: string | null;
  issuedAt: string | null;
  error?: string;
};

export function decodeJwt(token: string): DecodedJwt {
  try {
    const parts = token.trim().split(".");
    if (parts.length < 2) {
      return {
        header: null,
        payload: null,
        signature: "",
        isExpired: null,
        expiresAt: null,
        issuedAt: null,
        error: "Invalid JWT format. Must contain at least 2 dot-separated segments.",
      };
    }

    const decodePart = (b64url: string) => {
      const decodedUtf8 = base64ToUtf8(b64url, true);
      return JSON.parse(decodedUtf8);
    };

    const header = decodePart(parts[0]);
    const payload = decodePart(parts[1]);
    const signature = parts[2] || "";

    let isExpired: boolean | null = null;
    let expiresAt: string | null = null;
    let issuedAt: string | null = null;

    if (payload && typeof payload === "object") {
      if ("exp" in payload && typeof payload.exp === "number") {
        const expDate = new Date(payload.exp * 1000);
        isExpired = expDate.getTime() < Date.now();
        expiresAt = `${expDate.toISOString()} (${expDate.toLocaleString()})`;
      }
      if ("iat" in payload && typeof payload.iat === "number") {
        const iatDate = new Date(payload.iat * 1000);
        issuedAt = `${iatDate.toISOString()} (${iatDate.toLocaleString()})`;
      }
    }

    return { header, payload, signature, isExpired, expiresAt, issuedAt };
  } catch (err) {
    return {
      header: null,
      payload: null,
      signature: "",
      isExpired: null,
      expiresAt: null,
      issuedAt: null,
      error: err instanceof Error ? err.message : "Failed to decode JWT token.",
    };
  }
}

// --- Simple SQL Formatter ---
export function formatSql(sql: string): string {
  const keywords = [
    "SELECT", "FROM", "WHERE", "AND", "OR", "GROUP BY", "ORDER BY", "HAVING",
    "LIMIT", "OFFSET", "JOIN", "LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "OUTER JOIN",
    "CROSS JOIN", "INSERT INTO", "VALUES", "UPDATE", "SET", "DELETE FROM",
    "CREATE TABLE", "ALTER TABLE", "DROP TABLE", "UNION", "UNION ALL", "WITH"
  ];

  let cleaned = sql.replace(/\s+/g, " ").trim();
  keywords.forEach((kw) => {
    const regex = new RegExp(`\\b${kw}\\b`, "gi");
    cleaned = cleaned.replace(regex, `\n${kw}`);
  });

  return cleaned
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
}

// --- Line-by-Line Diff Helper ---
export type DiffLine = {
  type: "added" | "removed" | "unchanged";
  lineOld?: number;
  lineNew?: number;
  content: string;
};

export function computeLineDiff(oldText: string, newText: string): DiffLine[] {
  const oldLines = oldText.split("\n");
  const newLines = newText.split("\n");
  const result: DiffLine[] = [];

  let i = 0;
  let j = 0;

  while (i < oldLines.length || j < newLines.length) {
    if (i < oldLines.length && j < newLines.length && oldLines[i] === newLines[j]) {
      result.push({
        type: "unchanged",
        lineOld: i + 1,
        lineNew: j + 1,
        content: oldLines[i],
      });
      i++;
      j++;
    } else if (j < newLines.length && (i >= oldLines.length || !oldLines.slice(i).includes(newLines[j]))) {
      result.push({
        type: "added",
        lineNew: j + 1,
        content: newLines[j],
      });
      j++;
    } else if (i < oldLines.length) {
      result.push({
        type: "removed",
        lineOld: i + 1,
        content: oldLines[i],
      });
      i++;
    }
  }

  return result;
}
