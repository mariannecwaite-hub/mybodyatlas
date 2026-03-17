import { useMemo } from "react";
import { BodyEvent, BodyRegion, REGION_LABELS } from "@/context/AppContext";

export interface PatternInsight {
  id: string;
  type: "origin_reframe" | "stress_body" | "recurring_pattern" | "care_gap" | "fallback" | "unsafe_experience" | "dismissal";
  title: string;
  body: string;
  tone: "sage" | "lavender" | "warm" | "neutral";
  regionLabel: string;
  relatedRegions: BodyRegion[];
  relatedEventIds: string[];
  reflectiveQuestion: string;
  specificity: number;
  /** For unsafe experience insight — timing description */
  timingDescription?: string;
  /** For dismissal insight — events that followed */
  followingEventIds?: string[];
}

const BIOMECHANICAL_CHAINS: Record<string, BodyRegion[]> = {
  lower_back: ["hip_left", "hip_right", "knee_left", "knee_right", "ankle_foot_left", "ankle_foot_right"],
  hip_left: ["knee_left", "ankle_foot_left"],
  hip_right: ["knee_right", "ankle_foot_right"],
  knee_left: ["ankle_foot_left"],
  knee_right: ["ankle_foot_right"],
  neck: ["shoulder_left", "shoulder_right", "upper_back"],
  head_jaw: ["neck", "shoulder_left", "shoulder_right"],
  shoulder_left: ["wrist_hand_left", "upper_back"],
  shoulder_right: ["wrist_hand_right", "upper_back"],
  upper_back: ["lower_back"],
};

const regionLabel = (r: BodyRegion) => REGION_LABELS[r]?.toLowerCase() ?? r;

const REFLECTIVE_QUESTIONS = [
  "Do you remember what was happening in your life when this first started?",
  "Has anything changed in this area, or does it feel the same as it did then?",
  "Is there a connection here you've noticed yourself?",
  "What was your body trying to tell you during that time?",
  "Looking back, does this pattern surprise you — or confirm something you already sensed?",
];

export function usePatternEngine(
  events: BodyEvent[],
  options?: { selectedRegion?: BodyRegion | null; maxResults?: number }
): PatternInsight[] {
  const { selectedRegion = null, maxResults = 3 } = options || {};

  return useMemo(() => {
    if (events.length === 0) {
      return [{
        id: "growing",
        type: "fallback",
        title: "Your map is growing",
        body: "As you add experiences, patterns may gently surface here. There's no rush.",
        tone: "sage",
        regionLabel: "Getting started",
        relatedRegions: [],
        relatedEventIds: [],
        reflectiveQuestion: "",
        specificity: 0,
      }];
    }

    const insights: PatternInsight[] = [];

    // Build region → events index
    const regionEvents: Record<string, BodyEvent[]> = {};
    events.forEach((e) => {
      e.regions.forEach((r) => {
        if (!regionEvents[r]) regionEvents[r] = [];
        regionEvents[r].push(e);
      });
    });

    const regionYears: Record<string, Set<number>> = {};
    Object.entries(regionEvents).forEach(([r, evts]) => {
      regionYears[r] = new Set(evts.map((e) => new Date(e.date).getFullYear()));
    });

    const stressAndLifeEvents = events.filter((e) => e.type === "stress" || e.type === "life-event" || e.type === "safety-experience");
    const treatmentEvents = events.filter((e) => e.type === "treatment");

    // ── Type 1: Origin Reframe — now with specific event names ──
    const regionsToCheck = selectedRegion ? [selectedRegion] : Object.keys(regionEvents) as BodyRegion[];

    for (const currentRegion of regionsToCheck) {
      const origins = BIOMECHANICAL_CHAINS[currentRegion];
      if (!origins) continue;
      const currentEvents = regionEvents[currentRegion] || [];
      if (currentEvents.length < 2) continue;

      for (const originRegion of origins) {
        const originEvts = regionEvents[originRegion];
        if (!originEvts || originEvts.length === 0) continue;

        const earliestOrigin = originEvts.reduce((a, b) =>
          new Date(a.date) < new Date(b.date) ? a : b
        );
        const earliestCurrent = currentEvents.reduce((a, b) =>
          new Date(a.date) < new Date(b.date) ? a : b
        );

        if (new Date(earliestOrigin.date) < new Date(earliestCurrent.date)) {
          const originYear = new Date(earliestOrigin.date).getFullYear();
          const currentYear = new Date(earliestCurrent.date).getFullYear();
          insights.push({
            id: `origin-${currentRegion}-${originRegion}`,
            type: "origin_reframe",
            title: "Your body has been returning to this",
            body: `Your ${regionLabel(currentRegion)} story may start earlier than you think. In ${originYear}, you recorded "${earliestOrigin.title.toLowerCase()}" — and in ${currentYear}, "${earliestCurrent.title.toLowerCase()}" appeared. These two areas are often connected, and it may be worth wondering whether they're part of the same story. Based on what you've recorded so far.`,
            tone: "sage",
            regionLabel: REGION_LABELS[currentRegion] ?? currentRegion,
            relatedRegions: [currentRegion, originRegion],
            relatedEventIds: [...currentEvents, earliestOrigin].map((e) => e.id),
            reflectiveQuestion: "Do you remember what was happening in your life when this first started?",
            specificity: currentEvents.length + originEvts.length,
          });
          break;
        }
      }
    }

    // ── Type 2: Stress-Body Connection — with specific names ──
    if (stressAndLifeEvents.length > 0) {
      const physicalEvents = events.filter((e) => e.type === "symptom" || e.type === "injury");
      const THREE_MONTHS = 90 * 24 * 60 * 60 * 1000;

      const overlapping = physicalEvents.filter((pe) => {
        const peTime = new Date(pe.date).getTime();
        return stressAndLifeEvents.some((se) => {
          const seTime = new Date(se.date).getTime();
          return Math.abs(peTime - seTime) <= THREE_MONTHS;
        });
      });

      if (overlapping.length > 0) {
        const affectedRegions = [...new Set(overlapping.flatMap((e) => e.regions))] as BodyRegion[];
        // Pick most specific stress event and physical event pair
        const bestStress = stressAndLifeEvents[0];
        const bestPhysical = overlapping[0];
        const stressYear = new Date(bestStress.date).getFullYear();

        insights.push({
          id: "stress-body",
          type: "stress_body",
          title: "Your nervous system may still be holding some of this",
          body: `In ${stressYear}, "${bestStress.title.toLowerCase()}" was happening — and "${bestPhysical.title.toLowerCase()}" appeared around the same time. Some of these arrived during harder times — your body often carries what life brings. Based on what you've recorded so far.`,
          tone: "lavender",
          regionLabel: "Stress & body",
          relatedRegions: affectedRegions,
          relatedEventIds: [...overlapping, ...stressAndLifeEvents].map((e) => e.id),
          reflectiveQuestion: "Has anything changed in this area, or does it feel the same as it did then?",
          specificity: overlapping.length + stressAndLifeEvents.length,
        });
      }
    }

    // ── Type 3: Recurring Pattern — with specific events ──
    const regionsForRecurring = selectedRegion ? [selectedRegion] : Object.keys(regionYears) as BodyRegion[];

    for (const region of regionsForRecurring) {
      const years = regionYears[region];
      if (!years || years.size < 3) continue;
      const sortedYears = [...years].sort((a, b) => a - b);
      const evts = regionEvents[region];
      const sortedEvts = [...evts].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const firstEvt = sortedEvts[0];
      const lastEvt = sortedEvts[sortedEvts.length - 1];

      insights.push({
        id: `recurring-${region}`,
        type: "recurring_pattern",
        title: "Your body has been saying something here for a while",
        body: `Your ${regionLabel(region)} has a story — it starts in ${sortedYears[0]} with "${firstEvt.title.toLowerCase()}" and reaches ${sortedYears[sortedYears.length - 1]} — "${lastEvt.title.toLowerCase()}". This area has been speaking up. Based on what you've recorded so far.`,
        tone: "warm",
        regionLabel: REGION_LABELS[region] ?? region,
        relatedRegions: [region],
        relatedEventIds: evts.map((e) => e.id),
        reflectiveQuestion: "Looking back, does this pattern surprise you — or confirm something you already sensed?",
        specificity: sortedYears.length + evts.length,
      });
    }

    // ── Type 4: Care Gap — with specific events ──
    const treatmentRegions = new Set(treatmentEvents.flatMap((e) => e.regions));
    const regionsForCareGap = selectedRegion ? [selectedRegion] : Object.keys(regionEvents) as BodyRegion[];

    for (const region of regionsForCareGap) {
      const evts = regionEvents[region];
      if (!evts || evts.length < 3) continue;
      if (treatmentRegions.has(region)) continue;

      const sortedEvts = [...evts].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const firstEvt = sortedEvts[0];
      const firstYear = new Date(firstEvt.date).getFullYear();

      insights.push({
        id: `care-gap-${region}`,
        type: "care_gap",
        title: "This area has a story",
        body: `Your ${regionLabel(region)} has been speaking up since ${firstYear} — starting with "${firstEvt.title.toLowerCase()}" — but doesn't yet have any treatment logged alongside it. That might be worth exploring when you're ready. Based on what you've recorded so far.`,
        tone: "sage",
        regionLabel: REGION_LABELS[region] ?? region,
        relatedRegions: [region],
        relatedEventIds: evts.map((e) => e.id),
        reflectiveQuestion: "Is there a connection here you've noticed yourself?",
        specificity: evts.length,
      });
    }

    // ── Sort & deduplicate ──
    if (insights.length === 0) {
      return [{
        id: "growing",
        type: "fallback",
        title: "Your map is growing",
        body: "As you add more experiences, your body's patterns may gently surface here. There's no rush — your record will hold everything.",
        tone: "sage",
        regionLabel: "Getting started",
        relatedRegions: [],
        relatedEventIds: [],
        reflectiveQuestion: "",
        specificity: 0,
      }];
    }

    const byType: Record<string, PatternInsight[]> = {};
    insights.forEach((i) => {
      if (!byType[i.type]) byType[i.type] = [];
      byType[i.type].push(i);
    });

    const deduped: PatternInsight[] = [];
    const typeOrder: PatternInsight["type"][] = ["origin_reframe", "stress_body", "recurring_pattern", "care_gap"];
    for (const t of typeOrder) {
      const candidates = byType[t];
      if (!candidates) continue;
      candidates.sort((a, b) => b.specificity - a.specificity);
      deduped.push(candidates[0]);
      if (candidates.length > 1 && deduped.length < maxResults) {
        deduped.push(candidates[1]);
      }
    }

    return deduped.slice(0, maxResults);
  }, [events, selectedRegion, maxResults]);
}
