import { z } from "zod";
import rawRecords from "./filters.json";

export const coverageValues = [
  "Central America",
  "International",
  "EV / premium",
] as const;

export type Coverage = (typeof coverageValues)[number];

const filterSourceSchema = z.object({
  label: z.string().min(1),
  url: z.string().url().startsWith("https://"),
  type: z.string().min(1),
  supports: z.string().min(1),
});

const filterRecordSchema = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be lowercase kebab-case"),
  year: z.string().min(1),
  make: z.string().min(1),
  model: z.string().min(1),
  focus: z.enum(coverageValues),
  market: z.string().min(1),
  partReference: z.string().min(1),
  filterCount: z.string().min(1),
  replacementInterval: z.string().min(1),
  access: z.string().min(1),
  airflow: z.string().min(1),
  confidence: z.enum(["Verified", "Conditional"]),
  verifiedAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "verifiedAt must be an ISO date (YYYY-MM-DD)"),
  summary: z.string().min(1),
  caution: z.string().min(1),
  sources: z.array(filterSourceSchema).min(1),
});

export type FilterSource = z.infer<typeof filterSourceSchema>;
export type FilterRecord = z.infer<typeof filterRecordSchema>;

const filterRecordsSchema = z
  .array(filterRecordSchema)
  .min(1)
  .superRefine((records, ctx) => {
    const seen = new Set<string>();
    for (const record of records) {
      if (seen.has(record.slug)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `duplicate slug: ${record.slug}`,
        });
      }
      seen.add(record.slug);
    }
  });

// Validated at module load: a malformed record fails the build instead of
// shipping a broken page.
export const filterRecords: FilterRecord[] = filterRecordsSchema.parse(rawRecords);

export function getFilterRecord(slug: string) {
  return filterRecords.find((record) => record.slug === slug);
}

export function partReferenceSlug(partReference: string) {
  return partReference
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getRecordsByPartSlug(refSlug: string) {
  return filterRecords.filter(
    (record) => partReferenceSlug(record.partReference) === refSlug,
  );
}

export function getUniquePartSlugs() {
  return [...new Set(filterRecords.map((r) => partReferenceSlug(r.partReference)))];
}

export function getRelatedByPart(record: FilterRecord) {
  return filterRecords.filter(
    (other) =>
      other.slug !== record.slug &&
      partReferenceSlug(other.partReference) ===
        partReferenceSlug(record.partReference),
  );
}
