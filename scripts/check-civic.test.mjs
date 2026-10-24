import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  blocks, checkHex, checkShadow, checkRadius, checkContrast, checkMarks, checkNav,
  PAIRS, MARK_RULES, ROUND_ALLOW, SCOPE,
} from "./check-civic.mjs";

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "civic-"));
function fx(name, text) {
  const p = path.join(dir, name);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, text);
  return p;
}

test("hex flags a mapped key case-insensitively", () => {
  const f = fx("a.css", ".a{color:#3E7188}");
  const v = checkHex([f], { hex: { "3e7188": "0f172a" } }, []);
  assert.equal(v.length, 1);
  assert.equal(v[0].rule, "hex");
});

test("hex ignores allowed values", () => {
  const f = fx("b.css", ".a{color:#bf3b3b}");
  assert.equal(checkHex([f], { hex: { bf3b3b: "991b1b" } }, ["bf3b3b"]).length, 0);
});

test("shadow allows none, overlay, :focus selectors, readability.css, print.css", () => {
  assert.equal(checkShadow([fx("s1.css", ".a{box-shadow:none}")]).length, 0);
  assert.equal(checkShadow([fx("s2.css", ".a{box-shadow:var(--shadow-overlay)}")]).length, 0);
  assert.equal(checkShadow([fx("s3.css", ".a:focus-visible{box-shadow:0 0 0 3px #000}")]).length, 0);
  assert.equal(checkShadow([fx("readability.css", ".a{box-shadow:0 1px 2px #000}")]).length, 0);
  assert.equal(checkShadow([fx("print.css", ".a{box-shadow:0 1px 2px #000}")]).length, 0);
  assert.equal(checkShadow([fx("s4.css", ".a{transition:box-shadow .2s}")]).length, 0);
  assert.equal(checkShadow([fx("s5.css", ".card{box-shadow:0 1px 2px #000}")]).length, 1);
});

test("shadow flags hover lifts", () => {
  const v = checkShadow([fx("l.css", ".x:hover{transform:translateY(-2px)}")]);
  assert.equal(v.length, 1);
  assert.equal(v[0].rule, "lift");
});

test("shadow flags non-none shadow tokens", () => {
  assert.equal(checkShadow([fx("t1.css", ":root{--shadow-sm:0 1px 2px #000}")]).length, 1);
  assert.equal(checkShadow([fx("t2.css", ":root{--shadow-sm:none}")]).length, 0);
});

test("radius flags pills unless allow-listed", () => {
  assert.equal(checkRadius([fx("r1.css", ".btn{border-radius:9999px}")], []).length, 1);
  assert.equal(checkRadius([fx("r2.css", ".step-num{border-radius:50%}")], [".step-num"]).length, 0);
  assert.equal(checkRadius([fx("r2b.css", ".step-num{border-radius:50%}")], []).length, 1);
});

test("radius flags 10px+", () => {
  assert.equal(checkRadius([fx("r3.css", ".a{border-radius:12px}")], []).length, 1);
  assert.equal(checkRadius([fx("r4.css", ".a{border-radius:0.75rem}")], []).length, 1);
  assert.equal(checkRadius([fx("r5.css", ".a{border-radius:0.375rem}")], []).length, 0);
  assert.equal(checkRadius([fx("r6.css", ":root{--radius-lg:0.75rem}")], []).length, 1);
});

test("contrast passes and fails on WCAG ratio", () => {
  const tok = fx("tok.css", ":root{--ink:#475569;--bg:#F8FAFC}");
  assert.equal(checkContrast(tok, [["#475569", "#F8FAFC", 4.5]]).length, 0);
  assert.equal(checkContrast(tok, [["#94A3B8", "#F8FAFC", 4.5]]).length, 1);
  assert.equal(checkContrast(tok, [["--ink", "--bg", 4.5]]).length, 0);
  assert.equal(checkContrast(tok, [["--missing", "--bg", 4.5]]).length, 1);
});

test("blocks reports the line of each selector", () => {
  const css = "/* c { x } */\n.a {\n  color: red;\n}\n@media (min-width: 1px) {\n  .b {\n    color: blue;\n  }\n}\n";
  const b = blocks(css);
  const a = b.find((x) => x.selector === ".a");
  const bb = b.find((x) => x.selector === ".b");
  assert.equal(a.line, 2);
  assert.equal(bb.line, 6);
  assert.match(bb.body, /blue/);
});

test("blocks reads only <style> in html with whole-file line numbers", () => {
  const html = "<html>\n<body>{x}</body>\n<style>\n.z { color: red; }\n</style>\n";
  const b = blocks(html, true);
  assert.equal(b.length, 1);
  assert.equal(b[0].line, 4);
});

test("blocks is linear on large input", () => {
  const big = ".a{color:red}\n".repeat(200000);
  const t = Date.now();
  assert.equal(blocks(big).length, 200000);
  assert.ok(Date.now() - t < 3000);
});

test("marks requires --color-mark or 991b1b in the block", () => {
  const f = fx("m.css", ".ok{color:var(--color-mark)}\n.ok2{border-color:#991B1B}\n.bad{color:blue}\n");
  assert.equal(checkMarks([[f, ".ok"], [f, ".ok2"]]).length, 0);
  assert.equal(checkMarks([[f, ".bad"]]).length, 1);
  assert.equal(checkMarks([[f, ".missing"]]).length, 1);
});

test("stubs and exported data", () => {
  assert.deepEqual(checkNav("x"), []);
  assert.ok(Array.isArray(PAIRS) && Array.isArray(MARK_RULES) && Array.isArray(ROUND_ALLOW));
  const s = SCOPE();
  assert.ok(s.some((p) => p.endsWith("public/css/main.css")));
  assert.ok(s.some((p) => p.endsWith("public/guide")|| p.includes("public/guide/")));
});
