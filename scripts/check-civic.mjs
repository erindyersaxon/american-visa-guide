#!/usr/bin/env node
// Static checker for the Civic Editorial palette reskin.
// Node only, no dependencies. See the spec for the rules each check enforces.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Filled in by later tasks.
export const PAIRS = []; // [fg, bg, min] (Task 3)
export const MARK_RULES = []; // [file, selector] (Task 3)
export const ROUND_ALLOW = []; // selectors allowed to stay round (Task 5)

const MAP_PATH = path.join(ROOT, "scripts", "civic-palette-map.json");
const TOKEN_FILE = path.join(ROOT, "public", "css", "main.css");

// ---------------------------------------------------------------- file set

function listDir(dir, test) {
  let names = [];
  try {
    names = fs.readdirSync(dir).sort();
  } catch {
    return [];
  }
  return names.filter(test).map((n) => path.join(dir, n));
}

export function SCOPE(root = ROOT) {
  const out = [
    ...listDir(path.join(root, "public", "css"), (n) => n.endsWith(".css")),
    ...listDir(path.join(root, "public"), (n) => n.endsWith(".html")),
    ...listDir(path.join(root, "public", "guide"), (n) => n.endsWith(".html")),
    path.join(root, "public", "js", "nav.js"),
    path.join(root, "public", "favicon.svg"),
    path.join(root, "scripts", "og-image-source.html"),
  ];
  return out.filter((p) => fs.existsSync(p));
}

const isStyleFile = (f) => f.endsWith(".css") || f.endsWith(".html");

// ---------------------------------------------------------------- scanner

// Blank out CSS comments, keeping newlines so offsets and lines stay put.
function maskComments(s) {
  let out = "";
  let i = 0;
  while (i < s.length) {
    const a = s.indexOf("/*", i);
    if (a === -1) {
      out += s.slice(i);
      break;
    }
    out += s.slice(i, a);
    let b = s.indexOf("*/", a + 2);
    b = b === -1 ? s.length : b + 2;
    out += s.slice(a, b).replace(/[^\n]/g, " ");
    i = b;
  }
  return out;
}

// Keep only <style> contents of an html file, blanking everything else.
function maskHtml(s) {
  const lower = s.toLowerCase();
  let out = "";
  let i = 0;
  const blank = (t) => t.replace(/[^\n]/g, " ");
  while (i < s.length) {
    const a = lower.indexOf("<style", i);
    if (a === -1) {
      out += blank(s.slice(i));
      break;
    }
    const open = lower.indexOf(">", a);
    if (open === -1) {
      out += blank(s.slice(i));
      break;
    }
    let close = lower.indexOf("</style", open);
    if (close === -1) close = s.length;
    out += blank(s.slice(i, open + 1)) + s.slice(open + 1, close);
    i = close;
    const end = lower.indexOf(">", close);
    const stop = end === -1 ? s.length : end + 1;
    out += blank(s.slice(close, stop));
    i = stop;
  }
  return out;
}

const GROUPING = /^@(media|supports|layer|container|document)\b/i;

// Linear brace scanner. Returns {selector, body, line, decls} for every rule
// block. decls is [{prop, value, line}]. Pass html=true to read <style> only.
export function blocks(text, html = false) {
  const src = maskComments(html ? maskHtml(text) : text);
  const lineStarts = [0];
  for (let i = 0; i < src.length; i++) if (src.charCodeAt(i) === 10) lineStarts.push(i + 1);
  const lineAt = (pos) => {
    let lo = 0;
    let hi = lineStarts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (lineStarts[mid] <= pos) lo = mid;
      else hi = mid - 1;
    }
    return lo + 1;
  };

  const out = [];
  const stack = [];
  let seg = 0; // start of the current selector or declaration text
  let i = 0;
  const n = src.length;
  while (i < n) {
    const c = src[i];
    if (c === '"' || c === "'") {
      i++;
      while (i < n && src[i] !== c && src[i] !== "\n") i += src[i] === "\\" ? 2 : 1;
      i++;
      continue;
    }
    if (c === "{") {
      const raw = src.slice(seg, i);
      const selector = raw.trim();
      const lead = raw.length - raw.trimStart().length;
      const parent = stack[stack.length - 1];
      if (parent) parent.chunks.push([parent.cursor, seg]);
      stack.push({ selector, line: lineAt(seg + lead), chunks: [], cursor: i + 1 });
      seg = i + 1;
    } else if (c === "}") {
      const b = stack.pop();
      if (b) {
        b.chunks.push([b.cursor, i]);
        const decls = [];
        let body = "";
        for (const [s, e] of b.chunks) {
          body += src.slice(s, e);
          parseDecls(src, s, e, lineAt, decls);
        }
        if (!(b.selector.startsWith("@") && decls.length === 0) && !(GROUPING.test(b.selector) && decls.length === 0)) {
          out.push({ selector: b.selector, body, line: b.line, decls });
        }
        const parent = stack[stack.length - 1];
        if (parent) parent.cursor = i + 1;
      }
      seg = i + 1;
    } else if (c === ";" && stack.length === 0) {
      seg = i + 1;
    }
    i++;
  }
  return out;
}

// Split src[s,e) into declarations on top-level semicolons.
function parseDecls(src, s, e, lineAt, decls) {
  let start = s;
  let depth = 0;
  for (let i = s; i <= e; i++) {
    const c = i < e ? src[i] : ";";
    if (c === '"' || c === "'") {
      i++;
      while (i < e && src[i] !== c && src[i] !== "\n") i += src[i] === "\\" ? 2 : 1;
      continue;
    }
    if (c === "(") depth++;
    else if (c === ")") depth = Math.max(0, depth - 1);
    else if (c === ";" && depth === 0) {
      const raw = src.slice(start, i);
      const colon = raw.indexOf(":");
      if (colon > 0) {
        const lead = raw.length - raw.trimStart().length;
        decls.push({
          prop: raw.slice(0, colon).trim().toLowerCase(),
          value: raw.slice(colon + 1).trim(),
          line: lineAt(start + lead),
        });
      }
      start = i + 1;
    }
  }
}

function readBlocks(file) {
  return blocks(fs.readFileSync(file, "utf8"), file.endsWith(".html"));
}

const viol = (file, line, rule, detail) => ({ file, line, rule, detail });
const base = (f) => path.basename(f);

// ---------------------------------------------------------------- hex

function normHex(h) {
  h = h.toLowerCase();
  if (h.length === 3 || h.length === 4) h = [...h.slice(0, 3)].map((c) => c + c).join("");
  return h.slice(0, 6);
}

export function checkHex(files, map, allow = []) {
  const keys = new Set(Object.keys(map.hex || {}).map((k) => normHex(k.replace(/^#/, ""))));
  const ok = new Set(allow.map((a) => normHex(a.replace(/^#/, ""))));
  const out = [];
  const re = /#([0-9a-fA-F]{3,8})(?![0-9a-zA-Z_-])/g;
  for (const f of files) {
    const lines = fs.readFileSync(f, "utf8").split("\n");
    lines.forEach((ln, idx) => {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(ln))) {
        if (![3, 4, 6, 8].includes(m[1].length)) continue;
        const k = normHex(m[1]);
        if (keys.has(k) && !ok.has(k)) {
          out.push(viol(f, idx + 1, "hex", `#${m[1]} should be #${map.hex[k] ?? "?"}`));
        }
      }
    });
  }
  return out;
}

// ---------------------------------------------------------------- shadow

const SHADOW_TOKEN = /^--shadow-(xs|sm|md|lg)$/;

export function checkShadow(files) {
  const out = [];
  for (const f of files.filter(isStyleFile)) {
    const exempt = base(f) === "readability.css" || base(f) === "print.css";
    for (const b of readBlocks(f)) {
      for (const d of b.decls) {
        if (SHADOW_TOKEN.test(d.prop) && d.value.toLowerCase() !== "none") {
          out.push(viol(f, d.line, "shadow", `${d.prop} must be none, found ${d.value}`));
        }
        if (d.prop === "box-shadow" && !exempt) {
          const v = d.value.toLowerCase();
          if (v === "none" || v.includes("var(--shadow-overlay") || b.selector.includes(":focus")) continue;
          out.push(viol(f, d.line, "shadow", `${b.selector} box-shadow: ${d.value}`));
        }
        if (d.prop === "transform" && b.selector.includes(":hover") && /translate/i.test(d.value)) {
          out.push(viol(f, d.line, "lift", `${b.selector} transform: ${d.value}`));
        }
      }
    }
  }
  return out;
}

// ---------------------------------------------------------------- radius

const FULL = new Set(["var(--radius-full)", "9999px", "999px", "100px", "50%"]);

function radiusProblem(value) {
  for (const raw of value.toLowerCase().split(/[\s/]+/)) {
    if (!raw) continue;
    if (FULL.has(raw)) return `round (${raw})`;
    const m = /^(\d*\.?\d+)(px|rem|em)$/.exec(raw);
    if (m) {
      const px = parseFloat(m[1]) * (m[2] === "px" ? 1 : 16);
      if (px >= 10) return `${raw} is 10px or more`;
    }
  }
  return null;
}

export function checkRadius(files, roundAllow = []) {
  const out = [];
  for (const f of files.filter(isStyleFile)) {
    for (const b of readBlocks(f)) {
      for (const d of b.decls) {
        if (!(d.prop === "border-radius" || /^border-.*-radius$/.test(d.prop) || d.prop.startsWith("--radius-"))) continue;
        const why = radiusProblem(d.value);
        if (!why) continue;
        if (roundAllow.some((a) => b.selector.includes(a) || d.prop === a)) continue;
        out.push(viol(f, d.line, "radius", `${b.selector} ${d.prop}: ${d.value} (${why})`));
      }
    }
  }
  return out;
}

// ---------------------------------------------------------------- contrast

function parseColor(h) {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(h.trim());
  if (!m) return null;
  let x = m[1];
  if (x.length === 3) x = [...x].map((c) => c + c).join("");
  return [0, 2, 4].map((i) => parseInt(x.slice(i, i + 2), 16));
}

function luminance([r, g, b]) {
  const [R, G, B] = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

export function contrastRatio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

export function checkContrast(tokenFile, pairs) {
  const root = readBlocks(tokenFile).find((b) => b.selector === ":root");
  const tokens = {};
  for (const d of root ? root.decls : []) tokens[d.prop] = d.value;
  const line = root ? root.line : 1;
  const resolve = (v) => {
    v = v.trim();
    for (let depth = 0; depth < 5; depth++) {
      const ref = /^var\((--[\w-]+)\)$/.exec(v);
      const name = ref ? ref[1] : v.startsWith("--") ? v : null;
      if (!name || tokens[name] === undefined) break;
      v = tokens[name].trim();
    }
    return v;
  };
  const out = [];
  for (const [fg, bg, min] of pairs) {
    const a = parseColor(resolve(fg));
    const b = parseColor(resolve(bg));
    if (!a || !b) {
      out.push(viol(tokenFile, line, "contrast", `cannot resolve ${fg} on ${bg}`));
      continue;
    }
    const r = contrastRatio(a, b);
    if (r < min) out.push(viol(tokenFile, line, "contrast", `${fg} on ${bg} is ${r.toFixed(2)}:1, needs ${min}:1`));
  }
  return out;
}

// ---------------------------------------------------------------- marks

export function checkMarks(rules, root = ROOT) {
  const out = [];
  const cache = {};
  for (const [file, selector] of rules) {
    const p = path.resolve(root, file);
    let bl = cache[p];
    if (!bl) {
      try {
        bl = cache[p] = readBlocks(p);
      } catch {
        out.push(viol(file, 1, "marks", `file not found for ${selector}`));
        continue;
      }
    }
    const hits = bl.filter((b) => b.selector.split(",").map((s) => s.trim()).includes(selector));
    if (hits.length === 0) {
      out.push(viol(file, 1, "marks", `no block for ${selector}`));
    } else if (!hits.some((b) => /--color-mark|991b1b/i.test(b.body))) {
      out.push(viol(file, hits[0].line, "marks", `${selector} lacks --color-mark or #991B1B`));
    }
  }
  return out;
}

// ---------------------------------------------------------------- nav

// Stub. Task 6 implements the nav rules.
export function checkNav(navCss) { // eslint-disable-line no-unused-vars
  return [];
}

// ---------------------------------------------------------------- CLI

function loadMap() {
  if (!fs.existsSync(MAP_PATH)) return null;
  return JSON.parse(fs.readFileSync(MAP_PATH, "utf8"));
}

function run(name) {
  const styleFiles = SCOPE().filter(isStyleFile);
  switch (name) {
    case "hex": {
      const map = loadMap();
      if (!map) return [viol("scripts/civic-palette-map.json", 0, "hex", "map not found")];
      return checkHex(SCOPE(), map, map.allow || []);
    }
    case "shadow": return checkShadow(styleFiles);
    case "radius": return checkRadius(styleFiles, ROUND_ALLOW);
    case "contrast": return checkContrast(TOKEN_FILE, PAIRS);
    case "marks": return checkMarks(MARK_RULES);
    case "nav": {
      const p = path.join(ROOT, "public", "css", "nav.css");
      return checkNav(fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "");
    }
    default: return null;
  }
}

const CHECKS = ["hex", "shadow", "radius", "contrast", "marks", "nav"];

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const arg = process.argv[2];
  const names = arg === "all" ? CHECKS : CHECKS.includes(arg) ? [arg] : null;
  if (!names) {
    console.error("usage: check-civic.mjs <hex|shadow|radius|contrast|marks|nav|all>");
    process.exit(2);
  }
  let failed = false;
  for (const name of names) {
    const v = run(name);
    if (v.length) {
      failed = true;
      for (const x of v) console.log(`${path.relative(ROOT, path.resolve(ROOT, x.file))}:${x.line} ${x.rule} ${String(x.detail).replace(/\s+/g, " ")}`);
    } else {
      console.log(`ok ${name}`);
    }
  }
  process.exit(failed ? 1 : 0);
}
