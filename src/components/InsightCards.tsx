import { useApp } from "@/context/AppContext";
import { motion } from "framer-motion";

const InsightCards = () => {
  const { state } = useApp();
  const insights = generateInsights();

  function generateInsights() {
    const cards: { title: string; body: string; tone: string }[] = [];
    const ongoingCount = state.events.filter((e) => e.ongoing).length;
    const stressEvents = state.events.filter((e) => e.type === "stress");
    const treatmentEvents = state.events.filter((e) => e.type === "treatment");

    if (ongoingCount > 0) {
      cards.push({
        title: "Active threads",
        body: `You have ${ongoingCount} ongoing ${ongoingCount === 1 ? "entry" : "entries"}. Tracking them is a gentle first step.`,
        tone: "sage",
      });
    }

    if (stressEvents.length > 0 && state.events.some((e) => e.type === "symptom")) {
      cards.push({
        title: "A possible pattern",
        body: "You've logged both stress periods and physical symptoms. Many people notice these are connected — something worth reflecting on.",
        tone: "lavender",
      });
    }

    if (treatmentEvents.length > 0) {
      cards.push({
        title: "You're taking care",
        body: `You've recorded ${treatmentEvents.length} ${treatmentEvents.length === 1 ? "treatment" : "treatments"}. Acknowledging the steps you take matters.`,
        tone: "warm",
      });
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
      <span className="section-label">Reflections</span>
      <div className="space-y-2.5">
        {insights.map((insight, i) => (
          <motion.div
            key={i}
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
