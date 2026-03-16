import { useMemo } from "react";
import { BodyEvent, BodyRegion, EventType, REGION_LABELS } from "@/context/AppContext";

export interface BodyMemory {
  id: string;
  prompt: string;
  context: string;
  triggerType: "region_cluster" | "post_event" | "pattern" | "timeline_gap" | "general";
  relatedRegion?: BodyRegion;
  relatedEventId?: string;
  responses: BodyMemoryResponse[];
}

export interface BodyMemoryResponse {
  label: string;
  emoji: string;
  eventSeed: {
    type: EventType;
    titleHint: string;
    regions: BodyRegion[];
    dateHint: "childhood" | "earlier" | "stress_period" | "recent" | "unknown";
  };
}

const dateHintToYear: Record<string, number> = {
  childhood: 2000,
  earlier: 2014,
  stress_period: 2019,
  recent: 2023,
  unknown: 2018,
};

export function getDateFromHint(hint: string): string {
  const year = dateHintToYear[hint] ?? 2018;
  return `${year}-06-15`;
}

/** Generate contextual body memories based on user's event history */
export function useBodyMemories(
  events: BodyEvent[],
  options?: { maxResults?: number; lastDismissedIds?: string[] }
): BodyMemory[] {
  const dismissed = new Set(options?.lastDismissedIds ?? []);
  const max = options?.maxResults ?? 3;

  return useMemo(() => {
    const memories: BodyMemory[] = [];

    // Count events per region
    const regionCounts: Partial<Record<BodyRegion, number>> = {};
    const regionEvents: Partial<Record<BodyRegion, BodyEvent[]>> = {};
    events.forEach((e) => {
      e.regions.forEach((r) => {
        regionCounts[r] = (regionCounts[r] || 0) + 1;
        if (!regionEvents[r]) regionEvents[r] = [];
        regionEvents[r]!.push(e);
      });
    });

    // 1. Region cluster prompts — when 2+ events in same region
    const clusteredRegions = Object.entries(regionCounts)
      .filter(([, count]) => count >= 2)
      .sort(([, a], [, b]) => b - a);

    clusteredRegions.forEach(([region]) => {
      const r = region as BodyRegion;
      const label = REGION_LABELS[r].toLowerCase();
      const evts = regionEvents[r] || [];
      const earliest = evts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

      memories.push({
        id: `mem-cluster-${r}`,
        prompt: `Do you remember when your ${label} first started bothering you?`,
        context: `You've recorded ${evts.length} experiences in this area. Sometimes the story goes back further than we first think.`,
        triggerType: "region_cluster",
        relatedRegion: r,
        relatedEventId: earliest?.id,
        responses: [
          {
            label: "Earlier in life",
            emoji: "👶",
            eventSeed: {
              type: "symptom",
              titleHint: `Earlier ${label} memory`,
              regions: [r],
              dateHint: "childhood",
            },
          },
          {
            label: "After an injury",
            emoji: "🩹",
            eventSeed: {
              type: "injury",
              titleHint: `${REGION_LABELS[r]} injury`,
              regions: [r],
              dateHint: "earlier",
            },
          },
          {
            label: "During a stressful time",
            emoji: "🌊",
            eventSeed: {
              type: "stress",
              titleHint: `Stress affecting ${label}`,
              regions: [r],
              dateHint: "stress_period",
            },
          },
          {
            label: "Not sure",
            emoji: "💭",
            eventSeed: {
              type: "symptom",
              titleHint: `${REGION_LABELS[r]} — early memory`,
              regions: [r],
              dateHint: "unknown",
            },
          },
        ],
      });
    });

    // 2. Connected region prompts — ankle injury → ask about knee
    const connectionMap: Partial<Record<BodyRegion, { ask: BodyRegion; prompt: string }[]>> = {
      ankle_foot_left: [{ ask: "knee_left", prompt: "Many people notice earlier injuries when mapping their body story. Did anything happen to your left knee — perhaps connected to your ankle?" }],
      ankle_foot_right: [{ ask: "knee_right", prompt: "Did you ever notice your right knee being affected, perhaps after your ankle experience?" }],
      knee_left: [{ ask: "hip_left", prompt: "Sometimes knee discomfort connects to the hip. Have you noticed anything in your left hip over the years?" }],
      knee_right: [{ ask: "hip_right", prompt: "Sometimes knee issues connect upward. Have you noticed anything in your right hip?" }],
      neck: [{ ask: "head_jaw", prompt: "Neck tension sometimes connects to headaches or jaw tightness. Have you experienced either?" }],
      lower_back: [{ ask: "hip_left", prompt: "Lower back discomfort can relate to the hips. Have you noticed anything in your hip area?" }],
      upper_back: [{ ask: "neck", prompt: "Upper back tension often connects to the neck. Has your neck been affected too?" }],
    };

    Object.entries(connectionMap).forEach(([source, targets]) => {
      const sourceRegion = source as BodyRegion;
      if ((regionCounts[sourceRegion] || 0) > 0) {
        targets.forEach(({ ask, prompt }) => {
          if ((regionCounts[ask] || 0) === 0) {
            memories.push({
              id: `mem-connect-${sourceRegion}-${ask}`,
              prompt,
              context: `Your ${REGION_LABELS[sourceRegion].toLowerCase()} has recorded events. This area is often connected.`,
              triggerType: "pattern",
              relatedRegion: ask,
              responses: [
                {
                  label: "Yes, I've noticed that",
                  emoji: "✓",
                  eventSeed: {
                    type: "symptom",
                    titleHint: `${REGION_LABELS[ask]} — noticed over time`,
                    regions: [ask],
                    dateHint: "recent",
                  },
                },
                {
                  label: "Maybe earlier in life",
                  emoji: "👶",
                  eventSeed: {
                    type: "symptom",
                    titleHint: `${REGION_LABELS[ask]} — earlier memory`,
                    regions: [ask],
                    dateHint: "earlier",
                  },
                },
                {
                  label: "Not that I recall",
                  emoji: "🤷",
                  eventSeed: {
                    type: "symptom",
                    titleHint: "",
                    regions: [],
                    dateHint: "unknown",
                  },
                },
              ],
            });
          }
        });
      }
    });

    // 3. Stress-body connection prompts
    const hasStressEvents = events.some((e) => e.type === "stress");
    const hasPhysicalSymptoms = events.some((e) => e.type === "symptom" || e.type === "injury");

    if (hasStressEvents && hasPhysicalSymptoms) {
      memories.push({
        id: "mem-stress-body",
        prompt: "Was there a time in your life when stress affected your body more strongly?",
        context: "You've recorded both stress periods and physical experiences. These often connect in ways we don't immediately notice.",
        triggerType: "pattern",
        responses: [
          {
            label: "During a major life change",
            emoji: "🌊",
            eventSeed: {
              type: "stress",
              titleHint: "Stress period — body impact",
              regions: ["chest", "neck"],
              dateHint: "stress_period",
            },
          },
          {
            label: "At work or school",
            emoji: "💼",
            eventSeed: {
              type: "stress",
              titleHint: "Work/school stress — physical effects",
              regions: ["neck", "upper_back"],
              dateHint: "earlier",
            },
          },
          {
            label: "During a difficult relationship",
            emoji: "💔",
            eventSeed: {
              type: "stress",
              titleHint: "Relationship stress — body response",
              regions: ["chest", "abdomen"],
              dateHint: "earlier",
            },
          },
          {
            label: "Not sure",
            emoji: "💭",
            eventSeed: {
              type: "stress",
              titleHint: "",
              regions: [],
              dateHint: "unknown",
            },
          },
        ],
      });
    }

    // 4. General enrichment prompts (always available as fallback)
    if (events.length >= 3 && events.length < 15) {
      memories.push({
        id: "mem-childhood-general",
        prompt: "Thinking back to childhood — did your body ever go through something you still remember?",
        context: "Early body experiences sometimes shape patterns we notice later in life.",
        triggerType: "general",
        responses: [
          {
            label: "A broken bone or sprain",
            emoji: "🩹",
            eventSeed: {
              type: "injury",
              titleHint: "Childhood injury",
              regions: [],
              dateHint: "childhood",
            },
          },
          {
            label: "A recurring illness",
            emoji: "🤧",
            eventSeed: {
              type: "symptom",
              titleHint: "Childhood recurring illness",
              regions: ["chest"],
              dateHint: "childhood",
            },
          },
          {
            label: "A surgery or hospital stay",
            emoji: "🏥",
            eventSeed: {
              type: "treatment",
              titleHint: "Childhood surgery",
              regions: ["abdomen"],
              dateHint: "childhood",
            },
          },
          {
            label: "Nothing comes to mind",
            emoji: "✓",
            eventSeed: {
              type: "symptom",
              titleHint: "",
              regions: [],
              dateHint: "unknown",
            },
          },
        ],
      });
    }

    // 5. Treatment exploration prompt
    const treatmentCount = events.filter((e) => e.type === "treatment").length;
    const symptomCount = events.filter((e) => e.type === "symptom" || e.type === "injury").length;

    if (symptomCount >= 3 && treatmentCount === 0) {
      memories.push({
        id: "mem-treatment-explore",
        prompt: "Have you explored any treatments or therapies for what you've noticed in your body?",
        context: "Recording what you've tried can help you see your full body story.",
        triggerType: "general",
        responses: [
          {
            label: "Physiotherapy",
            emoji: "🏋️",
            eventSeed: {
              type: "treatment",
              titleHint: "Physiotherapy",
              regions: [],
              dateHint: "recent",
            },
          },
          {
            label: "Massage or bodywork",
            emoji: "💆",
            eventSeed: {
              type: "treatment",
              titleHint: "Massage or bodywork",
              regions: ["upper_back", "neck"],
              dateHint: "recent",
            },
          },
          {
            label: "Something else",
            emoji: "🌿",
            eventSeed: {
              type: "treatment",
              titleHint: "Treatment explored",
              regions: [],
              dateHint: "recent",
            },
          },
          {
            label: "Not yet",
            emoji: "💭",
            eventSeed: {
              type: "treatment",
              titleHint: "",
              regions: [],
              dateHint: "unknown",
            },
          },
        ],
      });
    }

    return memories.filter((m) => !dismissed.has(m.id)).slice(0, max);
  }, [events, dismissed, max]);
}
