import type { Category, Confidence } from "@/data/routes";

// Internal data values are stable keys; the UI reads its labels from here so a
// wording change never touches the data files.
export const categoryLabels: Record<Category, string> = {
  "Airport transfer": "Airport transfer",
  "City to city": "City to city",
  "Island & ferry": "Island & ferry",
  "Border crossing": "Border crossing",
};

export const confidenceLabels: Record<Confidence, string> = {
  Verified: "Verified",
  Conditional: "Conditional",
};

export const confidenceHelp: Record<Confidence, string> = {
  Verified:
    "Every figure on this page comes from an operator or government source that states it directly.",
  Conditional:
    "Sources are solid but at least one figure (a fare, a timetable or a fee) is set by operators and changes with season or demand. Confirm before you rely on it.",
};
