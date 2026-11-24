/**
 * Pure TypeScript developer utility helpers for DevHub
 */

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

  function convertToWordArray(str: string) {
    let lWordCount;
    const lMessageLength = str.length;
    const lNumberOfWordsTemp1 = lMessageLength + 8;
    const lNumberOfWordsTemp2 = (lNumberOfWordsTemp1 - (lNumberOfWordsTemp1 % 64)) / 64;
    const lNumberOfWords = (lNumberOfWordsTemp2 + 1) * 16;
    const lWordArray = new Array<number>(lNumberOfWords - 1);
    let lBytePosition = 0;
    let lByteCount = 0;
    while (lByteCount < lMessageLength) {
      lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] = (lWordArray[lWordCount] | (str.charCodeAt(lByteCount) << lBytePosition));
      lByteCount++;
    }
    lWordCount = (lByteCount - (lByteCount % 4)) / 4;
    lBytePosition = (lByteCount % 4) * 8;
    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
    lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
    lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
    return lWordArray;
  }

  function wordToHex(lValue: number) {
    let wordToHexValue = "";
    for (let lCount = 0; lCount <= 3; lCount++) {
      const lByte = (lValue >>> (lCount * 8)) & 255;
      const wordToHexValueTemp = "0" + lByte.toString(16);
      wordToHexValue += wordToHexValueTemp.slice(-2);
    }
    return wordToHexValue;
  }

  const x = convertToWordArray(unescape(encodeURIComponent(string)));
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
  algorithm: "SHA-256" | "SHA-512" | "SHA-1" | "MD5",
  input: string,
  secretKey?: string
): Promise<string> {
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
  bytes[0] = (now / 0x10000000000) & 0xff;
  bytes[1] = (now / 0x100000000) & 0xff;
  bytes[2] = (now / 0x1000000) & 0xff;
  bytes[3] = (now / 0x10000) & 0xff;
  bytes[4] = (now / 0x100) & 0xff;
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
export function generateNanoId(size = 21): string {
  const alphabet = "useandom-26T1983_40STOpknifeBFailStorey";
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
        error: "Invalid JWT format. Must contain 3 dot-separated segments.",
      };
    }

    const decodePart = (b64url: string) => {
      const base64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
      const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
      const json = decodeURIComponent(
        atob(padded)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(json);
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

// --- JSON to TypeScript Interface Generator ---
export function jsonToTypeScript(jsonStr: string, rootName = "RootObject"): string {
  try {
    const data = JSON.parse(jsonStr);
    const interfaces: string[] = [];

    function toPascalCase(str: string): string {
      return str
        .replace(/[^a-zA-Z0-9_]/g, " ")
        .split(" ")
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join("") || "Type";
    }

    function getType(val: unknown, keyName: string): string {
      if (val === null) return "null";
      if (val === undefined) return "undefined";
      if (typeof val === "string") return "string";
      if (typeof val === "number") return "number";
      if (typeof val === "boolean") return "boolean";
      if (Array.isArray(val)) {
        if (val.length === 0) return "unknown[]";
        const innerTypes = Array.from(new Set(val.map((item) => getType(item, keyName + "Item"))));
        if (innerTypes.length === 1) return `${innerTypes[0]}[]`;
        return `(${innerTypes.join(" | ")})[]`;
      }
      if (typeof val === "object") {
        const interfaceName = toPascalCase(keyName);
        generateInterface(val as Record<string, unknown>, interfaceName);
        return interfaceName;
      }
      return "unknown";
    }

    function generateInterface(obj: Record<string, unknown>, name: string) {
      if (interfaces.some((i) => i.startsWith(`export interface ${name} {`))) return;
      const lines: string[] = [];
      for (const [key, val] of Object.entries(obj)) {
        const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : JSON.stringify(key);
        const propType = getType(val, key);
        lines.push(`  ${safeKey}: ${propType};`);
      }
      interfaces.unshift(`export interface ${name} {\n${lines.join("\n")}\n}`);
    }

    if (Array.isArray(data)) {
      if (data.length > 0 && typeof data[0] === "object" && data[0] !== null) {
        generateInterface(data[0] as Record<string, unknown>, rootName);
        return interfaces.join("\n\n") + `\n\nexport type ${rootName}List = ${rootName}[];`;
      }
      return `export type ${rootName} = unknown[];`;
    } else if (typeof data === "object" && data !== null) {
      generateInterface(data as Record<string, unknown>, rootName);
      return interfaces.join("\n\n");
    } else {
      return `export type ${rootName} = ${typeof data};`;
    }
  } catch (err) {
    return `// Error parsing JSON: ${err instanceof Error ? err.message : "Invalid JSON"}`;
  }
}

// --- Cron Expression Parser & Schedule Explainer ---
export function parseCron(expression: string): { description: string; nextRuns: string[]; valid: boolean; error?: string } {
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) {
    return {
      description: "Invalid format. Standard cron requires 5 parts: (minute hour day-of-month month day-of-week)",
      nextRuns: [],
      valid: false,
      error: "Expected 5 fields",
    };
  }

  const [min, hr, dom, mon, dow] = parts;
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  let desc = "";

  if (expression.trim() === "* * * * *") {
    desc = "Every minute of every day";
  } else if (expression.trim() === "0 * * * *") {
    desc = "Every hour, at minute 0";
  } else if (expression.trim() === "0 0 * * *") {
    desc = "Every day at midnight (00:00)";
  } else if (expression.trim() === "0 12 * * *") {
    desc = "Every day at noon (12:00)";
  } else if (expression.trim() === "0 0 * * 0") {
    desc = "Every Sunday at midnight (00:00)";
  } else if (expression.trim() === "0 0 1 * *") {
    desc = "On day 1 of every month at midnight (00:00)";
  } else {
    let minDesc = "";
    if (min === "*") minDesc = "every minute";
    else if (min.startsWith("*/")) minDesc = `every ${min.slice(2)} minutes`;
    else minDesc = `at minute ${min}`;

    let hrDesc = "";
    if (hr === "*") hrDesc = "past every hour";
    else if (hr.startsWith("*/")) hrDesc = `every ${hr.slice(2)} hours`;
    else hrDesc = `past hour ${hr.padStart(2, "0")}:00`;

    let domDesc = "";
    if (dom !== "*") domDesc = `on day ${dom} of the month`;

    let monDesc = "";
    if (mon !== "*") {
      const mNum = parseInt(mon, 10);
      monDesc = `in ${months[mNum - 1] || mon}`;
    }

    let dowDesc = "";
    if (dow !== "*") {
      if (dow === "1-5") dowDesc = "on weekdays (Mon-Fri)";
      else if (dow === "0,6" || dow === "6,0") dowDesc = "on weekends (Sat-Sun)";
      else {
        const dNum = parseInt(dow, 10);
        dowDesc = `on ${daysOfWeek[dNum % 7] || dow}`;
      }
    }

    desc = [minDesc, hrDesc, domDesc, monDesc, dowDesc].filter(Boolean).join(", ");
    desc = desc.charAt(0).toUpperCase() + desc.slice(1);
  }

  const nextRuns: string[] = [];
  try {
    const current = new Date();
    current.setSeconds(0, 0);
    current.setMinutes(current.getMinutes() + 1);

    for (let i = 0; i < 20000 && nextRuns.length < 5; i++) {
      const m = current.getMinutes();
      const h = current.getHours();
      const d = current.getDate();
      const mo = current.getMonth() + 1;
      const dw = current.getDay();

      const matchField = (field: string, val: number) => {
        if (field === "*") return true;
        if (field.startsWith("*/")) {
          const step = parseInt(field.slice(2), 10);
          return val % step === 0;
        }
        if (field.includes(",")) {
          return field.split(",").map(Number).includes(val);
        }
        if (field.includes("-")) {
          const [start, end] = field.split("-").map(Number);
          return val >= start && val <= end;
        }
        return parseInt(field, 10) === val;
      };

      if (
        matchField(min, m) &&
        matchField(hr, h) &&
        matchField(dom, d) &&
        matchField(mon, mo) &&
        matchField(dow, dw)
      ) {
        nextRuns.push(current.toLocaleString(undefined, {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }));
      }
      current.setMinutes(current.getMinutes() + 1);
    }
  } catch {}

  return { description: desc, nextRuns, valid: true };
}

// --- HTML Entities & Text Codecs ---
export function encodeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function decodeHtml(str: string): string {
  const map: Record<string, string> = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
    "&apos;": "'",
    "&nbsp;": " ",
    "&copy;": "©",
    "&reg;": "®",
    "&trade;": "™",
    "&euro;": "€",
    "&pound;": "£",
    "&yen;": "¥",
    "&cent;": "¢",
  };
  return str.replace(/&(?:[a-zA-Z]+|#\d+|#x[a-fA-F0-9]+);/g, (match) => {
    if (map[match]) return map[match];
    if (match.startsWith("&#x")) {
      return String.fromCharCode(parseInt(match.slice(3, -1), 16));
    }
    if (match.startsWith("&#")) {
      return String.fromCharCode(parseInt(match.slice(2, -1), 10));
    }
    return match;
  });
}

export function unicodeEscape(str: string): string {
  return str
    .split("")
    .map((c) => {
      const code = c.charCodeAt(0);
      return code > 127 ? "\\u" + code.toString(16).padStart(4, "0") : c;
    })
    .join("");
}

export function unicodeUnescape(str: string): string {
  return str.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16))
  );
}

// --- Password Generator & Entropy Meter ---
export type PasswordOptions = {
  length: number;
  lowercase: boolean;
  uppercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
};

export function generatePassword(options: PasswordOptions): {
  password: string;
  entropy: number;
  strength: "Weak" | "Fair" | "Good" | "Strong";
  crackTime: string;
} {
  let chars = "";
  if (options.lowercase) chars += options.excludeAmbiguous ? "abcdefghjkmnpqrstuvwxyz" : "abcdefghijklmnopqrstuvwxyz";
  if (options.uppercase) chars += options.excludeAmbiguous ? "ABCDEFGHJKMNPQRSTUVWXYZ" : "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (options.numbers) chars += options.excludeAmbiguous ? "23456789" : "0123456789";
  if (options.symbols) chars += "!@#$%^&*()_+-=[]{}|;:,.<>?";

  if (!chars) chars = "abcdefghijklmnopqrstuvwxyz";

  const length = Math.max(4, Math.min(128, options.length || 16));
  const randomBytes = new Uint8Array(length);
  crypto.getRandomValues(randomBytes);

  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars[randomBytes[i] % chars.length];
  }

  const poolSize = chars.length;
  const entropy = Math.round(length * Math.log2(poolSize));

  let strength: "Weak" | "Fair" | "Good" | "Strong" = "Weak";
  let crackTime = "Instantly";

  if (entropy < 40) {
    strength = "Weak";
    crackTime = "< 1 minute";
  } else if (entropy < 60) {
    strength = "Fair";
    crackTime = "Few hours to days";
  } else if (entropy < 80) {
    strength = "Good";
    crackTime = "Months to years";
  } else {
    strength = "Strong";
    crackTime = "Centuries+ (Cryptographically robust)";
  }

  return { password, entropy, strength, crackTime };
}

// --- Chmod Linux Permissions Calculator ---
export type ChmodPerms = {
  owner: { r: boolean; w: boolean; x: boolean };
  group: { r: boolean; w: boolean; x: boolean };
  others: { r: boolean; w: boolean; x: boolean };
};

export function calculateChmod(perms: ChmodPerms): { octal: string; symbolic: string; command: string } {
  const getVal = (p: { r: boolean; w: boolean; x: boolean }) =>
    (p.r ? 4 : 0) + (p.w ? 2 : 0) + (p.x ? 1 : 0);

  const getSym = (p: { r: boolean; w: boolean; x: boolean }) =>
    `${p.r ? "r" : "-"}${p.w ? "w" : "-"}${p.x ? "x" : "-"}`;

  const octal = `${getVal(perms.owner)}${getVal(perms.group)}${getVal(perms.others)}`;
  const symbolic = `-${getSym(perms.owner)}${getSym(perms.group)}${getSym(perms.others)}`;
  const command = `chmod ${octal} filename`;

  return { octal, symbolic, command };
}

// --- CSS Unit & Clamp Generator ---
export function convertCssUnits(
  value: number,
  fromUnit: "px" | "rem" | "em",
  baseFontSize = 16
): { px: number; rem: number; em: number } {
  let px = value;
  if (fromUnit === "rem" || fromUnit === "em") {
    px = value * baseFontSize;
  }
  return {
    px: Math.round(px * 100) / 100,
    rem: Math.round((px / baseFontSize) * 1000) / 1000,
    em: Math.round((px / baseFontSize) * 1000) / 1000,
  };
}

export function generateCssClamp(minPx: number, maxPx: number, minVw = 375, maxVw = 1440): string {
  const slope = (maxPx - minPx) / (maxVw - minVw);
  const yAxisIntersection = -minVw * slope + minPx;
  const preferred = `${(yAxisIntersection / 16).toFixed(4)}rem + ${(slope * 100).toFixed(4)}vw`;
  return `clamp(${(minPx / 16).toFixed(4)}rem, ${preferred}, ${(maxPx / 16).toFixed(4)}rem)`;
}

// --- HTTP Status Codes Reference ---
export type HttpStatusCodeInfo = {
  code: number;
  name: string;
  category: "1xx" | "2xx" | "3xx" | "4xx" | "5xx";
  description: string;
};

export const HTTP_STATUS_CODES: HttpStatusCodeInfo[] = [
  { code: 100, name: "Continue", category: "1xx", description: "Initial part of a request received; client should continue." },
  { code: 101, name: "Switching Protocols", category: "1xx", description: "Server is switching protocols as requested (e.g., Upgrade to WebSocket)." },
  { code: 200, name: "OK", category: "2xx", description: "Standard successful HTTP response." },
  { code: 201, name: "Created", category: "2xx", description: "Request fulfilled and new resource created (typical for POST)." },
  { code: 202, name: "Accepted", category: "2xx", description: "Request accepted for processing, but processing not completed." },
  { code: 204, name: "No Content", category: "2xx", description: "Action succeeded but no body is returned (typical for DELETE/PUT)." },
  { code: 301, name: "Moved Permanently", category: "3xx", description: "Target resource has been assigned a new permanent URI." },
  { code: 302, name: "Found", category: "3xx", description: "Target resource resides temporarily under a different URI." },
  { code: 304, name: "Not Modified", category: "3xx", description: "Resource has not been modified since the version specified in request headers." },
  { code: 307, name: "Temporary Redirect", category: "3xx", description: "Redirect with the same HTTP method guaranteed." },
  { code: 308, name: "Permanent Redirect", category: "3xx", description: "Permanent redirect preserving the HTTP method." },
  { code: 400, name: "Bad Request", category: "4xx", description: "Server cannot process request due to client error (malformed syntax/invalid body)." },
  { code: 401, name: "Unauthorized", category: "4xx", description: "Authentication required or credentials invalid." },
  { code: 403, name: "Forbidden", category: "4xx", description: "Server understood request but refuses authorization (insufficient permissions)." },
  { code: 404, name: "Not Found", category: "4xx", description: "Target resource could not be found on the server." },
  { code: 405, name: "Method Not Allowed", category: "4xx", description: "HTTP method not supported for the requested resource." },
  { code: 408, name: "Request Timeout", category: "4xx", description: "Server timed out waiting for the client request." },
  { code: 409, name: "Conflict", category: "4xx", description: "Request conflicts with current state of resource (e.g. duplicate key)." },
  { code: 413, name: "Payload Too Large", category: "4xx", description: "Request entity is larger than limits defined by server." },
  { code: 415, name: "Unsupported Media Type", category: "4xx", description: "Payload format/Content-Type not supported by server." },
  { code: 422, name: "Unprocessable Content", category: "4xx", description: "Syntax is correct but semantic instructions are invalid (validation error)." },
  { code: 429, name: "Too Many Requests", category: "4xx", description: "Rate limit exceeded. Client has sent too many requests in given timeframe." },
  { code: 500, name: "Internal Server Error", category: "5xx", description: "Generic unexpected server error encountered." },
  { code: 501, name: "Not Implemented", category: "5xx", description: "Server does not support the functionality required to fulfill request." },
  { code: 502, name: "Bad Gateway", category: "5xx", description: "Gateway/proxy received invalid response from upstream server." },
  { code: 503, name: "Service Unavailable", category: "5xx", description: "Server is temporarily unavailable (maintenance, overload)." },
  { code: 504, name: "Gateway Timeout", category: "5xx", description: "Gateway/proxy did not receive timely response from upstream server." },
];

