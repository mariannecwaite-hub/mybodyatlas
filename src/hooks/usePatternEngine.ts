import { useMemo } from "react";
import { BodyEvent, BodyRegion, EventType, REGION_LABELS } from "@/context/AppContext";

export interface PatternInsight {
  id: string;
  type: "repeated_region" | "cross_region" | "stress_overlap" | "treatment_response" | "body_echo" | "life_change" | "ongoing" | "span" | "fallback";
  title: string;
  body: string;
  tone: "sage" | "lavender" | "warm";
  premium?: boolean;
  relatedRegions: BodyRegion[];
  relatedEventIds: string[];
}

/** Biomechanical compensation chains */
const COMPENSATION_CHAINS: Record<string, BodyRegion[]> = {
  ankle_foot_left: ["knee_left", "hip_left", "lower_back"],
  ankle_foot_right: ["knee_right", "hip_right", "lower_back"],
  knee_left: ["hip_left", "lower_back"],
  knee_right: ["hip_right", "lower_back"],
  hip_left: ["lower_back", "knee_left"],
  hip_right: ["lower_back", "knee_right"],
  lower_back: ["hip_left", "hip_right", "upper_back"],
  upper_back: ["neck", "shoulder_left", "shoulder_right"],
  neck: ["head_jaw", "shoulder_left", "shoulder_right"],
};

export function usePatternEngine(
  events: BodyEvent[],
  options?: { selectedRegion?: BodyRegion | null; maxResults?: number }
): PatternInsight[] {
  const { selectedRegion = null, maxResults = 5 } = options || {};

  return useMemo(() => {
    const insights: PatternInsight[] = [];
    const scopedEvents = selectedRegion
      ? events.filter((e) => e.regions.includes(selectedRegion))
      : events;

    const stressEvents = events.filter((e) => e.type === "stress");
    const symptomEvents = events.filter((e) => e.type === "symptom");
    const injuryEvents = events.filter((e) => e.type === "injury");
    const treatmentEvents = events.filter((e) => e.type === "treatment");
    const lifeEvents = events.filter((e) => e.type === "life-event");
    const ongoingCount = scopedEvents.filter((e) => e.ongoing).length;

    // ── 1. Repeated body region ──
    const regionCounts: Record<string, { count: number; years: Set<number>; eventIds: string[] }> = {};
    events.forEach((e) => {
      e.regions.forEach((r) => {
        if (!regionCounts[r]) regionCounts[r] = { count: 0, years: new Set(), eventIds: [] };
        regionCounts[r].count++;
        regionCounts[r].years.add(new Date(e.date).getFullYear());
        regionCounts[r].eventIds.push(e.id);
      });
    });

    if (selectedRegion) {
      const rc = regionCounts[selectedRegion];
      if (rc && rc.years.size >= 2) {
        const label = REGION_LABELS[selectedRegion].toLowerCase();
        insights.push({
          id: `repeated-${selectedRegion}`,
          type: "repeated_region",
          title: "A recurring area",
          body: `You've logged several experiences affecting your ${label} across ${rc.years.size} different years. Patterns like this can be worth sharing with someone you trust.`,
          tone: "lavender",
          premium: true,
          relatedRegions: [selectedRegion],
          relatedEventIds: rc.eventIds,
        });
      }
    } else {
      const topRepeated = Object.entries(regionCounts)
        .filter(([, v]) => v.years.size >= 3)
        .sort((a, b) => b[1].count - a[1].count);
      if (topRepeated.length > 0) {
        const [region, data] = topRepeated[0];
        const label = REGION_LABELS[region as BodyRegion]?.toLowerCase() || region;
        insights.push({
          id: `repeated-${region}`,
          type: "repeated_region",
          title: "A recurring area of attention",
          body: `You've logged several experiences affecting your ${label} across ${data.years.size} different years. This may be worth exploring with a practitioner.`,
          tone: "lavender",
          premium: true,
          relatedRegions: [region as BodyRegion],
          relatedEventIds: data.eventIds,
        });
      }
    }

    // ── 2. Cross-region compensation ──
    if (!selectedRegion) {
      const injuryRegions = injuryEvents.flatMap((e) => e.regions);
      const laterSymptoms = symptomEvents.filter(
        (e) => new Date(e.date) > new Date(Math.min(...injuryEvents.map((i) => new Date(i.date).getTime())))
      );
      const laterSymptomRegions = laterSymptoms.flatMap((e) => e.regions);

      for (const ir of injuryRegions) {
        const chain = COMPENSATION_CHAINS[ir] || [];
        const compensating = chain.filter((r) => laterSymptomRegions.includes(r));
        if (compensating.length > 0) {
          const relatedInjuries = injuryEvents.filter((e) => e.regions.includes(ir as BodyRegion));
          const relatedSymptoms = laterSymptoms.filter((e) => e.regions.some((r) => compensating.includes(r)));
          const allRelated = [...relatedInjuries, ...relatedSymptoms];
          const allRegions = [ir as BodyRegion, ...compensating];

          insights.push({
            id: `compensation-${ir}`,
            type: "cross_region",
            title: "Your body remembers",
            body: `Some lower-body experiences appear across time. You may wish to explore whether earlier ${REGION_LABELS[ir as BodyRegion]?.toLowerCase()} events influenced later ${compensating.map((r) => REGION_LABELS[r]?.toLowerCase()).join(" and ")} discomfort.`,
            tone: "sage",
            premium: true,
            relatedRegions: allRegions,
            relatedEventIds: allRelated.map((e) => e.id),
          });
          break; // Only one compensation insight
        }
      }
    }

    // ── 3. Stress overlap ──
    if (stressEvents.length > 0 && symptomEvents.length > 0) {
      const stressRanges = stressEvents.map((e) => ({
        start: new Date(e.date).getTime(),
        end: e.ongoing ? Date.now() : new Date(e.date).getTime() + 180 * 24 * 60 * 60 * 1000, // 6 months window
        event: e,
      }));

      const overlapping = symptomEvents.filter((s) => {
        const sTime = new Date(s.date).getTime();
        return stressRanges.some((sr) => sTime >= sr.start - 30 * 24 * 60 * 60 * 1000 && sTime <= sr.end);
      });

      if (overlapping.length > 0) {
        const stressRegions = stressEvents.flatMap((e) => e.regions);
        const symptomRegions = overlapping.flatMap((e) => e.regions);
        const sharedRegions = [...new Set([...stressRegions, ...symptomRegions])] as BodyRegion[];
        const regionNames = [...new Set(stressRegions.filter((r) => symptomRegions.includes(r)))]
          .slice(0, 2)
          .map((r) => REGION_LABELS[r]?.toLowerCase())
          .filter(Boolean);

        const bodyText = regionNames.length > 0
          ? `Some symptoms appear during periods of higher life stress, particularly in your ${regionNames.join(" and ")}. Many people notice this connection.`
          : "Some symptoms appear during periods of higher life stress. Many people find these are connected — something worth reflecting on gently.";

        insights.push({
          id: "stress-overlap",
          type: "stress_overlap",
          title: "Stress and your body",
          body: bodyText,
          tone: "lavender",
          premium: true,
          relatedRegions: sharedRegions,
          relatedEventIds: [...stressEvents, ...overlapping].map((e) => e.id),
        });
      }
    }

    // ── 4. Treatment response ──
    if (treatmentEvents.length >= 2) {
      const ongoingTreatments = treatmentEvents.filter((e) => e.ongoing);
      const treatmentRegions = [...new Set(treatmentEvents.flatMap((e) => e.regions))] as BodyRegion[];

      // Check if treatment descriptions mention positive outcomes
      const helpfulTreatments = treatmentEvents.filter((e) =>
        e.treatment?.toLowerCase().includes("help") ||
        e.treatment?.toLowerCase().includes("settled") ||
        e.treatment?.toLowerCase().includes("improved") ||
        e.treatment?.toLowerCase().includes("better") ||
        e.description?.toLowerCase().includes("help")
      );

      if (helpfulTreatments.length >= 1) {
        // Find the most common treatment type from titles
        const approaches = helpfulTreatments.map((t) => t.title.split("—")[0].trim());
        const approachCounts: Record<string, number> = {};
        approaches.forEach((a) => { approachCounts[a] = (approachCounts[a] || 0) + 1; });
        const topApproach = Object.entries(approachCounts).sort((a, b) => b[1] - a[1])[0];

        insights.push({
          id: "treatment-response",
          type: "treatment_response",
          title: "Care that's made a difference",
          body: topApproach && topApproach[1] > 1
            ? `${topApproach[0]} appears to have helped with several experiences. Noting what works is valuable context for future care.`
            : `You've explored ${treatmentEvents.length} different forms of care. That shows commitment to understanding your body.`,
          tone: "sage",
          relatedRegions: treatmentRegions,
          relatedEventIds: treatmentEvents.map((e) => e.id),
        });
      } else {
        insights.push({
          id: "treatment-explored",
          type: "treatment_response",
          title: "Care you've explored",
          body: `You've tried ${treatmentEvents.length} different approaches. Each one adds to your understanding of what works for your body.`,
          tone: "sage",
          relatedRegions: treatmentRegions,
          relatedEventIds: treatmentEvents.map((e) => e.id),
        });
      }
    }

    // ── 5. Life change + symptoms ──
    if (!selectedRegion) {
      const postpartumEvent = lifeEvents.find(
        (e) => e.title.toLowerCase().includes("born") || e.description.toLowerCase().includes("delivery")
      );
      if (postpartumEvent) {
        const postpartumDate = new Date(postpartumEvent.date);
        const postpartumSymptoms = symptomEvents.filter((e) => {
          const d = new Date(e.date);
          const monthsAfter = (d.getTime() - postpartumDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
          return monthsAfter > 0 && monthsAfter < 18;
        });
        if (postpartumSymptoms.length > 0) {
          insights.push({
            id: "life-change",
            type: "life_change",
            title: "After a big change",
            body: "New sensations appeared in the months after a significant life event. Your body was adapting to a lot — physically and emotionally. That takes time.",
            tone: "warm",
            premium: true,
            relatedRegions: [...new Set([...postpartumEvent.regions, ...postpartumSymptoms.flatMap((e) => e.regions)])] as BodyRegion[],
            relatedEventIds: [postpartumEvent.id, ...postpartumSymptoms.map((e) => e.id)],
          });
        }
      }
    }

    // ── 6. Ongoing threads ──
    if (ongoingCount > 0) {
      const ongoingEvents = scopedEvents.filter((e) => e.ongoing);
      const ongoingTreatments = ongoingEvents.filter((e) => e.type === "treatment").length;
      insights.push({
        id: "ongoing-threads",
        type: "ongoing",
        title: ongoingTreatments > 0 ? "You're showing up" : "Active threads",
        body: ongoingTreatments > 0
          ? `${ongoingCount} ongoing ${ongoingCount === 1 ? "thread" : "threads"}, including ${ongoingTreatments} active ${ongoingTreatments === 1 ? "treatment" : "treatments"}. Staying with the process is itself a form of care.`
          : `${ongoingCount} ongoing ${ongoingCount === 1 ? "entry" : "entries"}. Noticing them is a gentle first step.`,
        tone: "sage",
        relatedRegions: [...new Set(ongoingEvents.flatMap((e) => e.regions))] as BodyRegion[],
        relatedEventIds: ongoingEvents.map((e) => e.id),
      });
    }

    // ── 7. Span insight ──
    if (!selectedRegion) {
      const dates = events.map((e) => new Date(e.date).getFullYear());
      const span = Math.max(...dates) - Math.min(...dates);
      if (span >= 5) {
        insights.push({
          id: "years-span",
          type: "span",
          title: `${span} years of your story`,
          body: "Your body map spans over a decade. Looking back can reveal how much you've navigated — and how much your body has carried for you.",
          tone: "warm",
          relatedRegions: [],
          relatedEventIds: events.map((e) => e.id),
        });
      }
    }

    // ── Fallback ──
    if (insights.length === 0) {
      insights.push({
        id: "growing",
        type: "fallback",
        title: "Your map is growing",
        body: "As you add events, My Body Atlas will gently surface patterns. There's no rush.",
        tone: "sage",
        relatedRegions: [],
        relatedEventIds: [],
      });
    }

    // Region-specific quiet area
    if (selectedRegion && scopedEvents.length === 0) {
      return [{
        id: "quiet-area",
        type: "fallback" as const,
        title: "A quiet area",
        body: `Nothing recorded in your ${REGION_LABELS[selectedRegion].toLowerCase()} yet. That's perfectly fine — not every area needs a story.`,
        tone: "sage" as const,
        relatedRegions: [selectedRegion],
        relatedEventIds: [],
      }];
    }

    return insights.slice(0, maxResults);
  }, [events, selectedRegion, maxResults]);
}
