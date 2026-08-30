import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const records = JSON.parse(
  readFileSync(new URL("../data/filters.json", import.meta.url), "utf8"),
);

const COVERAGE = new Set(["Central America", "International", "EV / premium"]);
const CONFIDENCE = new Set(["Verified", "Conditional"]);
const REQUIRED_STRINGS = [
  "slug",
  "year",
  "make",
  "model",
  "focus",
  "market",
  "partReference",
  "filterCount",
  "replacementInterval",
  "access",
  "airflow",
  "confidence",
  "verifiedAt",
  "summary",
  "caution",
];

test("filters.json is a non-empty array", () => {
  assert.ok(Array.isArray(records));
  assert.ok(records.length >= 1);
});

test("every record has the required non-empty fields", () => {
  for (const record of records) {
    for (const field of REQUIRED_STRINGS) {
      assert.equal(
        typeof record[field],
        "string",
        `${record.slug ?? "?"}: ${field} must be a string`,
      );
      assert.ok(
        record[field].trim().length > 0,
        `${record.slug ?? "?"}: ${field} must not be empty`,
      );
    }
  }
});

test("slugs are unique and kebab-case", () => {
  const seen = new Set();
  for (const record of records) {
    assert.match(
      record.slug,
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      `invalid slug: ${record.slug}`,
    );
    assert.ok(!seen.has(record.slug), `duplicate slug: ${record.slug}`);
    seen.add(record.slug);
  }
});

test("focus and confidence use known values", () => {
  for (const record of records) {
    assert.ok(COVERAGE.has(record.focus), `${record.slug}: bad focus "${record.focus}"`);
    assert.ok(
      CONFIDENCE.has(record.confidence),
      `${record.slug}: bad confidence "${record.confidence}"`,
    );
  }
});

test("verifiedAt is an ISO date that parses", () => {
  for (const record of records) {
    assert.match(
      record.verifiedAt,
      /^\d{4}-\d{2}-\d{2}$/,
      `${record.slug}: verifiedAt must be YYYY-MM-DD`,
    );
    assert.ok(
      !Number.isNaN(Date.parse(record.verifiedAt)),
      `${record.slug}: verifiedAt does not parse as a date`,
    );
  }
});

test("every record keeps at least one https source", () => {
  for (const record of records) {
    assert.ok(Array.isArray(record.sources), `${record.slug}: sources missing`);
    assert.ok(record.sources.length >= 1, `${record.slug}: needs at least one source`);
    for (const source of record.sources) {
      assert.ok(source.label?.trim(), `${record.slug}: source label missing`);
      assert.ok(source.type?.trim(), `${record.slug}: source type missing`);
      assert.ok(source.supports?.trim(), `${record.slug}: source supports missing`);
      const url = new URL(source.url);
      assert.equal(url.protocol, "https:", `${record.slug}: source URL must be https`);
    }
  }
});
