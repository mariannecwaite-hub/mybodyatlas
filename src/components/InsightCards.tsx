import { useApp } from "@/context/AppContext";
import { motion } from "framer-motion";

const InsightCards = () => {
  const { state } = useApp();

  // Generate gentle, non-diagnostic insights from data
  const insights = generateInsights();

  function generateInsights() {
    const cards: { title: string; body: string; tone: string }[] = [];
    const ongoingCount = state.events.filter((e) => e.ongoing).length;
    const stressEvents = state.events.filter((e) => e.type === "stress");
    const treatmentEvents = state.events.filter((e) => e.type === "treatment");

    if (ongoingCount > 0) {
      cards.push({
        title: "Active threads",
        body: `You have ${ongoingCount} ongoing ${ongoingCount === 1 ? "entry" : "entries"}. It's okay to have things in progress — tracking them is a gentle first step.`,
        tone: "sage",
      });
    }

    if (stressEvents.length > 0 && state.events.some((e) => e.type === "symptom")) {
      cards.push({
        title: "A possible pattern",
        body: "You've logged both stress periods and physical symptoms. Many people notice these are connected. This isn't a diagnosis — just something worth reflecting on.",
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
        body: "As you add events over time, Body Atlas will gently surface patterns. There's no rush.",
        tone: "sage",
      });
    }

    return cards;
  }

  const toneStyles: Record<string, string> = {
    sage: "border-l-4 border-l-sage",
    lavender: "border-l-4 border-l-lavender",
    warm: "border-l-4 border-l-warm",
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-serif text-foreground">Gentle insights</h3>
      {insights.map((insight, i) => (
        <motion.div
          key={i}
          className={`insight-card ${toneStyles[insight.tone] || ""}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.15, duration: 0.4 }}
        >
          <p className="text-sm font-medium text-foreground mb-1">{insight.title}</p>
          <p className="text-sm text-muted-foreground leading-relaxed">{insight.body}</p>
        </motion.div>
      ))}
    </div>
  );
};

export default InsightCards;
