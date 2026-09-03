import { z } from "zod";
import rawRecords from "./routes.json";

export const categoryValues = [
  "Airport transfer",
  "City to city",
  "Island & ferry",
  "Border crossing",
] as const;

export type Category = (typeof categoryValues)[number];

export const confidenceValues = ["Verified", "Conditional"] as const;
export type Confidence = (typeof confidenceValues)[number];

// Partner slots a transport option can point to. The slot is resolved to a
// real affiliate link only when the matching program in data/monetizacion.json
// is active with a real ID; otherwise nothing is rendered.
export const partnerSlotValues = ["cars", "tours", "ground", "flights"] as const;
export type PartnerSlot = (typeof partnerSlotValues)[number];

const sourceSchema = z.object({
  label: z.string().min(1),
  url: z.string().url().startsWith("https://"),
  type: z.string().min(1),
  supports: z.string().min(1),
});

const optionSchema = z.object({
  mode: z.string().min(1),
  cost: z.string().min(1),
  duration: z.string().min(1),
  detail: z.string().min(1),
  partner: z.enum(partnerSlotValues).nullable(),
});

const kebab = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const routeRecordSchema = z.object({
  slug: z.string().min(1).regex(kebab, "slug must be lowercase kebab-case"),
  title: z.string().min(1),
  origin: z.string().min(1),
  destination: z.string().min(1),
  destinationSlug: z.string().min(1).regex(kebab, "destinationSlug must be kebab-case"),
  category: z.enum(categoryValues),
  distance: z.string().min(1),
  duration: z.string().min(1),
  summary: z.string().min(1),
  options: z.array(optionSchema).min(1),
  recommended: z.string().min(1),
  caution: z.string().min(1),
  confidence: z.enum(confidenceValues),
  verifiedAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "verifiedAt must be an ISO date (YYYY-MM-DD)"),
  sources: z.array(sourceSchema).min(1),
});

export type RouteSource = z.infer<typeof sourceSchema>;
export type RouteOption = z.infer<typeof optionSchema>;
export type RouteRecord = z.infer<typeof routeRecordSchema>;

const routeRecordsSchema = z
  .array(routeRecordSchema)
  .min(1)
  .superRefine((records, ctx) => {
    const seen = new Set<string>();
    for (const record of records) {
      if (seen.has(record.slug)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `duplicate slug: ${record.slug}` });
      }
      seen.add(record.slug);
    }
  });

// Validated at module load: a malformed record fails the build instead of
// shipping a broken page.
export const routeRecords: RouteRecord[] = routeRecordsSchema.parse(rawRecords);

export function getRouteRecord(slug: string) {
  return routeRecords.find((record) => record.slug === slug);
}

export function getRoutesByDestination(destinationSlug: string) {
  return routeRecords.filter((record) => record.destinationSlug === destinationSlug);
}

export function getUniqueDestinationSlugs() {
  return [...new Set(routeRecords.map((record) => record.destinationSlug))];
}

export function getRelatedByDestination(record: RouteRecord) {
  return routeRecords.filter(
    (other) => other.slug !== record.slug && other.destinationSlug === record.destinationSlug,
  );
}
