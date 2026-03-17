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
        prompt: `Do you remember when you first noticed something in your ${label}?`,
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
              titleHint: `Stress period — ${label}`,
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

    // 2. Connected region prompts — explore biomechanical connections
    const connectionMap: Partial<Record<BodyRegion, { ask: BodyRegion; prompt: string }[]>> = {
      ankle_foot_left: [{ ask: "knee_left", prompt: "Your left ankle and left knee are often connected. Have you noticed anything in your left knee over the years?" }],
      ankle_foot_right: [{ ask: "knee_right", prompt: "Your right ankle and right knee are often connected. Have you noticed anything in your right knee?" }],
      knee_left: [{ ask: "hip_left", prompt: "Your left knee and left hip are closely connected areas. Have you noticed anything in your left hip over the years?" }],
      knee_right: [{ ask: "hip_right", prompt: "Your right knee and right hip are closely connected areas. Have you noticed anything in your right hip?" }],
      neck: [{ ask: "head_jaw", prompt: "Your neck and head are closely connected areas. Have you experienced headaches or jaw tension?" }],
      lower_back: [{ ask: "hip_left", prompt: "Your lower back and hips are closely connected areas. Have you noticed anything in your hip area?" }],
      upper_back: [{ ask: "neck", prompt: "Your upper back and neck are closely connected areas. Have you noticed anything in your neck?" }],
    };

    Object.entries(connectionMap).forEach(([source, targets]) => {
      const sourceRegion = source as BodyRegion;
      if ((regionCounts[sourceRegion] || 0) > 0) {
        targets.forEach(({ ask, prompt }) => {
          if ((regionCounts[ask] || 0) === 0) {
            memories.push({
              id: `mem-connect-${sourceRegion}-${ask}`,
              prompt,
              context: `You've recorded experiences in your ${REGION_LABELS[sourceRegion].toLowerCase()}. These areas are often related.`,
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
    const hasPhysicalExperiences = events.some((e) => e.type === "symptom" || e.type === "injury");

    if (hasStressEvents && hasPhysicalExperiences) {
      memories.push({
        id: "mem-stress-body",
        prompt: "Was there a time in your life when stress showed up in your body more strongly?",
        context: "You've recorded both stress periods and physical experiences. These sometimes appear close together in ways worth noticing.",
        triggerType: "pattern",
        responses: [
          {
            label: "During a major life change",
            emoji: "🌊",
            eventSeed: {
              type: "stress",
              titleHint: "Stress period — body response",
              regions: ["chest", "neck"],
              dateHint: "stress_period",
            },
          },
          {
            label: "At work or school",
            emoji: "💼",
            eventSeed: {
              type: "stress",
              titleHint: "Work/school stress period",
              regions: ["neck", "upper_back"],
              dateHint: "earlier",
            },
          },
          {
            label: "During a difficult relationship",
            emoji: "💔",
            eventSeed: {
              type: "stress",
              titleHint: "Relationship stress period",
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
        context: "Early body experiences sometimes shape what we notice later in life.",
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
            label: "A recurring experience",
            emoji: "🤧",
            eventSeed: {
              type: "symptom",
              titleHint: "Childhood recurring experience",
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
    const experienceCount = events.filter((e) => e.type === "symptom" || e.type === "injury").length;

    if (experienceCount >= 3 && treatmentCount === 0) {
      memories.push({
        id: "mem-treatment-explore",
        prompt: "Have you explored any treatments or therapies for what you've noticed in your body?",
        context: "Recording what you've tried can help you see more of your body story over time.",
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
