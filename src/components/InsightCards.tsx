import { useApp, REGION_LABELS } from "@/context/AppContext";
import { motion } from "framer-motion";

const InsightCards = () => {
  const { state } = useApp();
  const insights = generateInsights();

  function generateInsights() {
    const cards: { title: string; body: string; tone: string }[] = [];

    // Scope events to selected region if one is active
    const scopedEvents = state.selectedRegion
      ? state.events.filter((e) => e.regions.includes(state.selectedRegion!))
      : state.events;

    const allEvents = state.events; // for cross-region insights
    const ongoingCount = scopedEvents.filter((e) => e.ongoing).length;
    const stressEvents = allEvents.filter((e) => e.type === "stress");
    const symptomEvents = allEvents.filter((e) => e.type === "symptom");
    const treatmentEvents = scopedEvents.filter((e) => e.type === "treatment");
    const injuryEvents = allEvents.filter((e) => e.type === "injury");
    const lifeEvents = allEvents.filter((e) => e.type === "life-event");

    // ── Region-specific insights ──
    if (state.selectedRegion) {
      const regionLabel = REGION_LABELS[state.selectedRegion];
      const regionEvents = scopedEvents;

      if (regionEvents.length === 0) {
        cards.push({
          title: "A quiet area",
          body: `Nothing recorded in your ${regionLabel.toLowerCase()} yet. That's perfectly fine — not every area needs a story.`,
          tone: "sage",
        });
        return cards;
      }

      // Check for recurring patterns in this region
      const dates = regionEvents.map((e) => new Date(e.date).getFullYear());
      const uniqueYears = [...new Set(dates)];
      if (uniqueYears.length >= 3) {
        cards.push({
          title: "A recurring area",
          body: `Your ${regionLabel.toLowerCase()} has come up across ${uniqueYears.length} different years. Patterns like this can be worth sharing with a practitioner — not as a diagnosis, but as context.`,
          tone: "lavender",
        });
      }

      // Check if stress overlaps with this region
      const regionStress = stressEvents.filter((e) => e.regions.some((r) => state.selectedRegion === r));
      const regionSymptoms = symptomEvents.filter((e) => e.regions.includes(state.selectedRegion!));
      if (regionStress.length > 0 || (regionSymptoms.length > 0 && stressEvents.length > 0)) {
        const stressInSameRegion = regionStress.length > 0;
        if (stressInSameRegion) {
          cards.push({
            title: "Stress lives here too",
            body: `You've logged stress that shows up in your ${regionLabel.toLowerCase()}. Many people carry tension in familiar places — your body is consistent, not broken.`,
            tone: "lavender",
          });
        }
      }
    }

    // ── Cross-region insights (always shown) ──

    // Stress-symptom overlap
    const stressRegions = new Set(stressEvents.flatMap((e) => e.regions));
    const symptomRegions = new Set(symptomEvents.flatMap((e) => e.regions));
    const overlappingRegions = [...stressRegions].filter((r) => symptomRegions.has(r));

    if (!state.selectedRegion) {
      if (overlappingRegions.length > 0) {
        const regionNames = overlappingRegions.slice(0, 2).map((r) => REGION_LABELS[r]?.toLowerCase() || r.replace(/_/g, " ")).join(" and ");
        cards.push({
          title: "Stress and your body",
          body: `You've logged stress periods and physical symptoms in your ${regionNames}. Many people notice tension follows stress — it's a common pattern, not something wrong with you.`,
          tone: "lavender",
        });
      } else if (stressEvents.length > 0 && symptomEvents.length > 0) {
        cards.push({
          title: "A thread worth noticing",
          body: "You've logged both stress periods and physical symptoms. Many people find these are connected — something worth reflecting on gently.",
          tone: "lavender",
        });
      }
    }

    // Injury echo / compensatory pattern
    const injuryRegions = injuryEvents.flatMap((e) => e.regions);
    const laterSymptomRegions = symptomEvents
      .filter((e) => new Date(e.date) > new Date(Math.min(...injuryEvents.map((i) => new Date(i.date).getTime()))))
      .flatMap((e) => e.regions);

    const relatedPairs: Record<string, string[]> = {
      ankle_foot_left: ["knee_left", "hip_left", "lower_back"],
      ankle_foot_right: ["knee_right", "hip_right", "lower_back"],
      knee_left: ["hip_left", "lower_back"],
      knee_right: ["hip_right", "lower_back"],
    };

    const echoFound = injuryRegions.some((ir) => {
      const related = relatedPairs[ir] || [];
      return related.some((r) => laterSymptomRegions.includes(r as any));
    });

    if (echoFound && !state.selectedRegion) {
      cards.push({
        title: "Your body remembers",
        body: "An earlier injury may have quietly changed how you move. Later symptoms in nearby areas can sometimes trace back. This is your body adapting — not failing.",
        tone: "sage",
      });
    }

    // Postpartum pattern
    const postpartumEvent = lifeEvents.find((e) =>
      e.title.toLowerCase().includes("born") || e.description.toLowerCase().includes("delivery")
    );
    if (postpartumEvent && !state.selectedRegion) {
      const postpartumDate = new Date(postpartumEvent.date);
      const postpartumSymptoms = symptomEvents.filter((e) => {
        const d = new Date(e.date);
        const monthsAfter = (d.getTime() - postpartumDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
        return monthsAfter > 0 && monthsAfter < 18;
      });
      if (postpartumSymptoms.length > 0) {
        cards.push({
          title: "After a big change",
          body: "New symptoms appeared in the months after a significant life event. Your body was adapting to a lot — physically and emotionally. That takes time.",
          tone: "warm",
        });
      }
    }

    // Ongoing threads
    if (ongoingCount > 0) {
      const ongoingTreatments = treatmentEvents.filter((e) => e.ongoing).length;
      if (ongoingTreatments > 0) {
        cards.push({
          title: "You're showing up",
          body: `${ongoingCount} ongoing ${ongoingCount === 1 ? "thread" : "threads"}, including ${ongoingTreatments} active ${ongoingTreatments === 1 ? "treatment" : "treatments"}. Staying with the process is itself a form of care.`,
          tone: "sage",
        });
      } else {
        cards.push({
          title: "Active threads",
          body: `${ongoingCount} ongoing ${ongoingCount === 1 ? "entry" : "entries"}. Tracking them is a gentle first step.`,
          tone: "sage",
        });
      }
    }

    // Timeline breadth
    if (!state.selectedRegion) {
      const dates = allEvents.map((e) => new Date(e.date).getFullYear());
      const span = Math.max(...dates) - Math.min(...dates);
      if (span >= 5) {
        cards.push({
          title: `${span} years of your story`,
          body: "Your body map spans over a decade. Looking back can reveal how much you've navigated — and how much your body has carried for you.",
          tone: "warm",
        });
      }
    }

    if (cards.length === 0) {
      cards.push({
        title: "Your map is growing",
        body: "As you add events, Body Atlas will gently surface patterns. There's no rush.",
        tone: "sage",
      });
    }

    return cards;
  }

  const toneStyles: Record<string, string> = {
    sage: "bg-sage/30 border-sage/40",
    lavender: "bg-lavender/30 border-lavender/40",
    warm: "bg-warm/40 border-warm/40",
  };

  return (
    <div className="space-y-3">
      <span className="section-label">
        Reflections
        {state.selectedRegion && (
          <span className="ml-1 normal-case font-normal text-muted-foreground/40">
            · {REGION_LABELS[state.selectedRegion]}
          </span>
        )}
      </span>
      <div className="space-y-2.5">
        {insights.map((insight, i) => (
          <motion.div
            key={`${insight.title}-${i}`}
            className={`rounded-2xl p-4 border transition-all duration-500 ${toneStyles[insight.tone] || ""}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.12, duration: 0.5 }}
          >
            <p className="text-[13px] font-medium text-foreground/85 mb-0.5">{insight.title}</p>
            <p className="text-[13px] text-muted-foreground leading-relaxed">{insight.body}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default InsightCards;
