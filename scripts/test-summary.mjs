// Turns JUnit XML files into a Markdown table for the GitHub job summary.
// Usage: node scripts/test-summary.mjs <file.xml>...
import { existsSync, readFileSync } from "node:fs";
import { basename } from "node:path";

const rows = [];
for (const file of process.argv.slice(2)) {
  if (!existsSync(file)) {
    rows.push(`| ${basename(file)} | — | — | — | not produced |`);
    continue;
  }
  const xml = readFileSync(file, "utf8");
  const root = xml.match(/<testsuites\b[^>]*>/)?.[0] ?? "";
  const attr = (name) => Number(root.match(new RegExp(`\\b${name}="([\\d.]+)"`))?.[1] ?? 0);
  const tests = attr("tests");
  const failed = attr("failures") + attr("errors");
  const skipped = attr("skipped");
  const status = failed === 0 ? "✅ pass" : "❌ fail";
  rows.push(`| ${basename(file, ".xml").replace("-junit", "")} | ${tests} | ${tests - failed - skipped} | ${failed} | ${status} |`);
}

console.log("### Test results\n");
console.log("| Suite | Tests | Passed | Failed | Status |");
console.log("|---|---:|---:|---:|---|");
console.log(rows.join("\n"));
