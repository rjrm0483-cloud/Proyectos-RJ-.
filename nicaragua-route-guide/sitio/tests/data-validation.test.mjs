import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const records = JSON.parse(
  readFileSync(new URL("../data/routes.json", import.meta.url), "utf8"),
);

const CATEGORY = new Set(["Airport transfer", "City to city", "Island & ferry", "Border crossing"]);
const CONFIDENCE = new Set(["Verified", "Conditional"]);
const PARTNER = new Set(["cars", "tours", "ground", "flights"]);
const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const REQUIRED_STRINGS = [
  "slug",
  "title",
  "origin",
  "destination",
  "destinationSlug",
  "category",
  "distance",
  "duration",
  "summary",
  "recommended",
  "caution",
  "confidence",
  "verifiedAt",
];

test("routes.json is a non-empty array", () => {
  assert.ok(Array.isArray(records));
  assert.ok(records.length >= 1);
});

test("every route has the required non-empty fields", () => {
  for (const record of records) {
    for (const field of REQUIRED_STRINGS) {
      assert.equal(typeof record[field], "string", `${record.slug ?? "?"}: ${field} must be a string`);
      assert.ok(record[field].trim().length > 0, `${record.slug ?? "?"}: ${field} must not be empty`);
    }
  }
});

test("slugs are unique and kebab-case; destinationSlug is kebab-case", () => {
  const seen = new Set();
  for (const record of records) {
    assert.match(record.slug, KEBAB, `invalid slug: ${record.slug}`);
    assert.match(record.destinationSlug, KEBAB, `${record.slug}: invalid destinationSlug`);
    assert.ok(!seen.has(record.slug), `duplicate slug: ${record.slug}`);
    seen.add(record.slug);
  }
});

test("one destination name per destinationSlug", () => {
  const names = new Map();
  for (const record of records) {
    const previous = names.get(record.destinationSlug);
    assert.ok(
      !previous || previous === record.destination,
      `${record.destinationSlug}: destination name differs ("${previous}" vs "${record.destination}")`,
    );
    names.set(record.destinationSlug, record.destination);
  }
});

test("category and confidence use known values", () => {
  for (const record of records) {
    assert.ok(CATEGORY.has(record.category), `${record.slug}: bad category "${record.category}"`);
    assert.ok(CONFIDENCE.has(record.confidence), `${record.slug}: bad confidence "${record.confidence}"`);
  }
});

test("verifiedAt is an ISO date that parses and is not in the future", () => {
  const today = new Date().toISOString().slice(0, 10);
  for (const record of records) {
    assert.match(record.verifiedAt, /^\d{4}-\d{2}-\d{2}$/, `${record.slug}: verifiedAt must be YYYY-MM-DD`);
    assert.ok(!Number.isNaN(Date.parse(record.verifiedAt)), `${record.slug}: verifiedAt does not parse`);
    assert.ok(record.verifiedAt <= today, `${record.slug}: verifiedAt is in the future`);
  }
});

test("every route compares at least one option with mode, cost, duration, detail and a valid partner slot", () => {
  for (const record of records) {
    assert.ok(Array.isArray(record.options) && record.options.length >= 1, `${record.slug}: options missing`);
    for (const option of record.options) {
      for (const field of ["mode", "cost", "duration", "detail"]) {
        assert.ok(option[field]?.trim(), `${record.slug}: option ${field} missing`);
      }
      assert.ok(
        option.partner === null || PARTNER.has(option.partner),
        `${record.slug}: bad partner slot "${option.partner}" in option "${option.mode}"`,
      );
    }
  }
});

test("every route keeps at least one https source", () => {
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
