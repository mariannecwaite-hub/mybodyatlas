import { BodyEvent, BodyRegion } from "@/context/AppContext";

/** Region string → numeric code for anonymisation */
const REGION_CODES: Record<string, number> = {
  head_jaw: 1, neck: 2, shoulder_left: 3, shoulder_right: 4,
  chest: 5, upper_back: 6, abdomen: 7, lower_back: 8,
  hip_left: 9, hip_right: 10, knee_left: 11, knee_right: 12,
  ankle_foot_left: 13, ankle_foot_right: 14, wrist_hand_left: 15, wrist_hand_right: 16,
};

/** Event type → category string (safe) */
const TYPE_MAP: Record<string, string> = {
  injury: "injury",
  symptom: "sensation",
  stress: "stress",
  treatment: "treatment",
  "life-event": "life_transition",
  "safety-experience": "__excluded__",
};

/** Outcome → category */
const OUTCOME_MAP: Record<string, string> = {
  helped: "helped",
  "no-change": "neutral",
  worse: "worsened",
  "not-sure": "unsure",
};

export interface AnonymisedEvent {
  regionCodes: number[];
  eventCategory: string;
  yearQuarter: string; // e.g. "2019-Q2"
  outcome?: string;
  isOngoing: boolean;
  isResolved: boolean;
}

function getQuarter(dateStr: string): string {
  const d = new Date(dateStr);
  const q = Math.ceil((d.getMonth() + 1) / 3);
  return `${d.getFullYear()}-Q${q}`;
}

/** Takes a user's events and returns ONLY what would be shared — with strict exclusions */
export function anonymiseEvents(events: BodyEvent[]): AnonymisedEvent[] {
  return events
    .filter((e) => {
      // Never include private events
      if (e.isPrivate) return false;
      // Never include safety-experience
      if (e.type === "safety-experience") return false;
      // Never include archived
      if (e.archived) return false;
      return true;
    })
    .map((e) => ({
      regionCodes: e.regions.map((r) => REGION_CODES[r]).filter(Boolean),
      eventCategory: TYPE_MAP[e.type] || "other",
      yearQuarter: getQuarter(e.date),
      outcome: e.treatmentOutcome ? OUTCOME_MAP[e.treatmentOutcome] : undefined,
      isOngoing: e.ongoing,
      isResolved: !e.ongoing,
    }));
}

/** Human-readable preview of what would be shared */
export function generateDataPreview(events: BodyEvent[]): string[] {
  const anonymised = anonymiseEvents(events);
  if (anonymised.length === 0) return ["No events would be shared based on your current record."];

  const lines: string[] = [];
  lines.push(`${anonymised.length} event${anonymised.length > 1 ? "s" : ""} would be included (out of ${events.length} total)`);

  const regionSet = new Set(anonymised.flatMap((e) => e.regionCodes));
  lines.push(`${regionSet.size} body region${regionSet.size > 1 ? "s" : ""} referenced (as numeric codes, not names)`);

  const categories = new Set(anonymised.map((e) => e.eventCategory));
  lines.push(`Event categories: ${[...categories].join(", ")}`);

  const withOutcome = anonymised.filter((e) => e.outcome);
  if (withOutcome.length > 0) {
    lines.push(`${withOutcome.length} treatment outcome${withOutcome.length > 1 ? "s" : ""} included`);
  }

  lines.push("Dates reduced to year and quarter only");
  lines.push("No names, notes, descriptions, or specific dates included");

  return lines;
}
