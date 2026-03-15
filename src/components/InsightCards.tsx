import { useApp, REGION_LABELS } from "@/context/AppContext";
import { motion } from "framer-motion";

const MAX_INSIGHTS = 3;

const InsightCards = () => {
  const { state, visibleEvents, revealInsights } = useApp();

  // ── Consent gate ──
  if (!state.insightsRevealed) {
    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-[22px] font-serif text-foreground/90 leading-tight">Reflections</h2>
          <p className="text-[11px] text-muted-foreground/40 mt-1 tracking-wide">
            Patterns we've gently noticed
          </p>
        </div>

        <motion.div
          className="rounded-2xl p-7 border border-sage/20 bg-sage/10 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-[14px] font-serif text-foreground/80 mb-2">
            We've noticed some patterns
          </p>
          <p className="text-[13px] text-muted-foreground/55 leading-[1.8] mb-5">
            Based on what you've recorded, there are a few gentle observations we can share. Only when you're ready.
          </p>
          <button
            onClick={revealInsights}
            className="inline-flex items-center px-5 py-2.5 rounded-full bg-primary/85 text-primary-foreground text-[12px] font-medium transition-all duration-300 hover:bg-primary active:scale-[0.97]"
            style={{ boxShadow: "var(--shadow-sm)" }}
          >
            I'd like to explore them
          </button>
        </motion.div>
      </div>
    );
  }

  const insights = generateInsights();

  function generateInsights() {
    const cards: { title: string; body: string; tone: string }[] = [];

    const scopedEvents = state.selectedRegion
      ? visibleEvents.filter((e) => e.regions.includes(state.selectedRegion!))
      : visibleEvents;

    const allEvents = visibleEvents;
    const ongoingCount = scopedEvents.filter((e) => e.ongoing).length;
    const stressEvents = allEvents.filter((e) => e.type === "stress");
    const symptomEvents = allEvents.filter((e) => e.type === "symptom");
    const treatmentEvents = scopedEvents.filter((e) => e.type === "treatment");
    const injuryEvents = allEvents.filter((e) => e.type === "injury");
    const lifeEvents = allEvents.filter((e) => e.type === "life-event");

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

      const dates = regionEvents.map((e) => new Date(e.date).getFullYear());
      const uniqueYears = [...new Set(dates)];
      if (uniqueYears.length >= 3) {
        cards.push({
          title: "A recurring area",
          body: `Your ${regionLabel.toLowerCase()} has come up across ${uniqueYears.length} different years. Patterns like this can be worth sharing with someone you trust — not as a diagnosis, but as context.`,
          tone: "lavender",
        });
      }

      const regionStress = stressEvents.filter((e) => e.regions.some((r) => state.selectedRegion === r));
      if (regionStress.length > 0) {
        cards.push({
          title: "Stress tends to settle here",
          body: `You've noticed stress showing up in your ${regionLabel.toLowerCase()}. Many people carry tension in familiar places — your body is consistent, not broken.`,
          tone: "lavender",
        });
      }
    }

    const stressRegions = new Set(stressEvents.flatMap((e) => e.regions));
    const symptomRegions = new Set(symptomEvents.flatMap((e) => e.regions));
    const overlappingRegions = [...stressRegions].filter((r) => symptomRegions.has(r));

    if (!state.selectedRegion) {
      if (overlappingRegions.length > 0) {
        const regionNames = overlappingRegions.slice(0, 2).map((r) => REGION_LABELS[r]?.toLowerCase() || r.replace(/_/g, " ")).join(" and ");
        cards.push({
          title: "Stress and your body",
          body: `You've noticed stress periods and physical sensations in your ${regionNames}. Many people find tension follows stress — it's a common pattern, not something wrong with you.`,
          tone: "lavender",
        });
      } else if (stressEvents.length > 0 && symptomEvents.length > 0) {
        cards.push({
          title: "A thread worth noticing",
          body: "You've recorded both stress periods and physical sensations. Many people find these are connected — something worth reflecting on gently.",
          tone: "lavender",
        });
      }
    }

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
        body: "An earlier injury may have quietly changed how you move. Later sensations in nearby areas can sometimes trace back. This is your body adapting — not failing.",
        tone: "sage",
      });
    }

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
          body: "New sensations appeared in the months after a significant life event. Your body was adapting to a lot — physically and emotionally. That takes time.",
          tone: "warm",
        });
      }
    }

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
          body: `${ongoingCount} ongoing ${ongoingCount === 1 ? "entry" : "entries"}. Noticing them is a gentle first step.`,
          tone: "sage",
        });
      }
    }

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
        body: "As you add events, My Body Atlas will gently surface patterns. There's no rush.",
        tone: "sage",
      });
    }

    // Emotional pacing: limit to MAX_INSIGHTS to prevent overwhelm
    return cards.slice(0, MAX_INSIGHTS);
  }

  const toneStyles: Record<string, string> = {
    sage: "bg-sage/15 border-sage/20",
    lavender: "bg-lavender/15 border-lavender/20",
    warm: "bg-warm/18 border-warm/20",
  };

  return (
    <div className="space-y-6" role="region" aria-label="Reflections — gentle observations about patterns you've recorded">
      <div>
        <h2 className="text-[22px] font-serif text-foreground/90 leading-tight">Reflections</h2>
        {state.selectedRegion && (
          <p className="text-[11px] text-muted-foreground/40 mt-1 tracking-wide">
            About your {REGION_LABELS[state.selectedRegion].toLowerCase()}
          </p>
        )}
      </div>

      <div className="space-y-4">
        {insights.map((insight, i) => (
          <motion.div
            key={`${insight.title}-${i}`}
            className={`rounded-2xl p-6 border transition-all duration-600 ${toneStyles[insight.tone] || ""}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 + i * 0.15, duration: 0.55, ease: "easeOut" }}
            role="article"
            aria-label={insight.title}
          >
            <p className="text-[15px] font-serif text-foreground/85 mb-2">{insight.title}</p>
            <p className="text-[13px] text-muted-foreground/60 leading-[1.8]">{insight.body}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default InsightCards;
