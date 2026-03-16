import { useMemo } from "react";
import { BodyEvent, BodyRegion, REGION_LABELS } from "@/context/AppContext";

export interface BodyThread {
  id: string;
  label: string;
  description: string;
  eventIds: string[];
  regions: BodyRegion[];
  yearSpan: string;
  eventCount: number;
  isOngoing: boolean;
}

/** Regions that are biomechanically or functionally related */
const REGION_GROUPS: Record<string, { label: string; regions: BodyRegion[] }> = {
  lower_body: {
    label: "Lower Body Movement",
    regions: ["ankle_foot_left", "ankle_foot_right", "knee_left", "knee_right", "hip_left", "hip_right", "lower_back"],
  },
  upper_body: {
    label: "Upper Body & Tension",
    regions: ["neck", "shoulder_left", "shoulder_right", "upper_back", "chest"],
  },
  left_chain: {
    label: "Left Side",
    regions: ["shoulder_left", "hip_left", "knee_left", "ankle_foot_left", "wrist_hand_left"],
  },
  right_chain: {
    label: "Right Side",
    regions: ["shoulder_right", "hip_right", "knee_right", "ankle_foot_right", "wrist_hand_right"],
  },
  core_spine: {
    label: "Core & Spine",
    regions: ["lower_back", "upper_back", "abdomen", "chest"],
  },
  head_neck: {
    label: "Head & Neck",
    regions: ["head_jaw", "neck", "shoulder_left", "shoulder_right"],
  },
  hands_wrists: {
    label: "Hands & Wrists",
    regions: ["wrist_hand_left", "wrist_hand_right"],
  },
};

function getYearSpan(events: BodyEvent[]): string {
  const years = events.map((e) => new Date(e.date).getFullYear()).sort((a, b) => a - b);
  if (years.length === 0) return "—";
  const min = years[0];
  const max = years[years.length - 1];
  return min === max ? `${min}` : `${min}–${max}`;
}

export function useBodyThreads(events: BodyEvent[]): BodyThread[] {
  return useMemo(() => {
    const threads: BodyThread[] = [];

    // 1. Region-group threads — find groups with 3+ events across 2+ regions
    for (const [groupId, group] of Object.entries(REGION_GROUPS)) {
      const groupEvents = events.filter((e) =>
        e.regions.some((r) => group.regions.includes(r))
      );

      const touchedRegions = [...new Set(
        groupEvents.flatMap((e) => e.regions.filter((r) => group.regions.includes(r)))
      )] as BodyRegion[];

      if (groupEvents.length >= 3 && touchedRegions.length >= 2) {
        const regionNames = touchedRegions
          .slice(0, 3)
          .map((r) => REGION_LABELS[r].toLowerCase());

        threads.push({
          id: `thread-${groupId}`,
          label: group.label,
          description: `${groupEvents.length} experiences across your ${regionNames.join(", ")}${touchedRegions.length > 3 ? ` and ${touchedRegions.length - 3} more areas` : ""}.`,
          eventIds: groupEvents.map((e) => e.id),
          regions: touchedRegions,
          yearSpan: getYearSpan(groupEvents),
          eventCount: groupEvents.length,
          isOngoing: groupEvents.some((e) => e.ongoing),
        });
      }
    }

    // 2. Stress-body thread — stress events temporally near symptom events
    const stressEvents = events.filter((e) => e.type === "stress");
    const symptomEvents = events.filter((e) => e.type === "symptom");

    if (stressEvents.length >= 1 && symptomEvents.length >= 1) {
      const stressRanges = stressEvents.map((e) => ({
        start: new Date(e.date).getTime(),
        end: e.ongoing ? Date.now() : new Date(e.date).getTime() + 180 * 86400000,
        event: e,
      }));

      const overlapping = symptomEvents.filter((s) => {
        const t = new Date(s.date).getTime();
        return stressRanges.some((sr) => t >= sr.start - 30 * 86400000 && t <= sr.end);
      });

      if (overlapping.length >= 1) {
        const allThreadEvents = [...stressEvents, ...overlapping];
        const allRegions = [...new Set(allThreadEvents.flatMap((e) => e.regions))] as BodyRegion[];

        threads.push({
          id: "thread-stress-body",
          label: "Stress & Body Response",
          description: `Sensations that appeared during or near periods of life stress.`,
          eventIds: allThreadEvents.map((e) => e.id),
          regions: allRegions,
          yearSpan: getYearSpan(allThreadEvents),
          eventCount: allThreadEvents.length,
          isOngoing: allThreadEvents.some((e) => e.ongoing),
        });
      }
    }

    // 3. Treatment journey thread
    const treatmentEvents = events.filter((e) => e.type === "treatment");
    if (treatmentEvents.length >= 2) {
      const relatedRegions = [...new Set(treatmentEvents.flatMap((e) => e.regions))] as BodyRegion[];
      threads.push({
        id: "thread-care-journey",
        label: "Your Care Journey",
        description: `${treatmentEvents.length} different approaches you've explored over time.`,
        eventIds: treatmentEvents.map((e) => e.id),
        regions: relatedRegions,
        yearSpan: getYearSpan(treatmentEvents),
        eventCount: treatmentEvents.length,
        isOngoing: treatmentEvents.some((e) => e.ongoing),
      });
    }

    // 4. Life transitions thread
    const lifeEvents = events.filter((e) => e.type === "life-event");
    if (lifeEvents.length >= 2) {
      const relatedRegions = [...new Set(lifeEvents.flatMap((e) => e.regions))] as BodyRegion[];
      threads.push({
        id: "thread-life-transitions",
        label: "Life Transitions",
        description: `${lifeEvents.length} significant moments that shaped your body's story.`,
        eventIds: lifeEvents.map((e) => e.id),
        regions: relatedRegions,
        yearSpan: getYearSpan(lifeEvents),
        eventCount: lifeEvents.length,
        isOngoing: lifeEvents.some((e) => e.ongoing),
      });
    }

    // Sort by event count descending, take top threads
    return threads.sort((a, b) => b.eventCount - a.eventCount).slice(0, 8);
  }, [events]);
}
