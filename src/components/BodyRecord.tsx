import { motion } from "framer-motion";
import { useApp, REGION_LABELS, EventType } from "@/context/AppContext";
import { usePatternEngine } from "@/hooks/usePatternEngine";
import { useBodyThreads } from "@/hooks/useBodyThreads";
import { MapPin, Calendar, Lightbulb, HeartPulse, Link2 } from "lucide-react";

const BodyRecord = () => {
  const { visibleEvents } = useApp();
  const insights = usePatternEngine(visibleEvents, { maxResults: 10 });
  const threads = useBodyThreads(visibleEvents);

  const totalEvents = visibleEvents.length;
  const uniqueRegions = [...new Set(visibleEvents.flatMap((e) => e.regions))];
  const treatments = visibleEvents.filter((e) => e.type === "treatment");
  const meaningfulInsights = insights.filter((i) => i.type !== "fallback");
  const years = [...new Set(visibleEvents.map((e) => new Date(e.date).getFullYear()))].sort();
  const span = years.length > 1 ? `${years[0]}–${years[years.length - 1]}` : years[0]?.toString() || "—";
  const ongoingCount = visibleEvents.filter((e) => e.ongoing).length;

  const stats = [
    {
      icon: Calendar,
      label: "Body events",
      value: totalEvents,
      sub: `across ${years.length} ${years.length === 1 ? "year" : "years"}`,
      tone: "bg-warm/15 border-warm/18",
    },
    {
      icon: MapPin,
      label: "Regions affected",
      value: uniqueRegions.length,
      sub: uniqueRegions.length > 0
        ? uniqueRegions.slice(0, 2).map((r) => REGION_LABELS[r]?.split(" ").pop()?.toLowerCase()).join(", ") + (uniqueRegions.length > 2 ? ` +${uniqueRegions.length - 2}` : "")
        : "none yet",
      tone: "bg-sage/12 border-sage/18",
    },
    {
      icon: HeartPulse,
      label: "Treatments",
      value: treatments.length,
      sub: treatments.filter((t) => t.ongoing).length > 0
        ? `${treatments.filter((t) => t.ongoing).length} ongoing`
        : "explored",
      tone: "bg-sage/12 border-sage/18",
    },
    {
      icon: Lightbulb,
      label: "Patterns found",
      value: meaningfulInsights.length,
      sub: "worth noticing",
      tone: "bg-lavender/12 border-lavender/18",
    },
  ];

  if (totalEvents === 0) return null;

  return (
    <motion.section
      className="w-full max-w-md mx-auto"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.15 }}
    >
      {/* Header */}
      <div className="mb-4">
        <p className="section-label">Your Body Record</p>
        <p className="text-[11px] text-muted-foreground/35 mt-1 leading-relaxed">
          A living archive of your body experiences · {span}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            className={`rounded-2xl p-4 border ${stat.tone} transition-all duration-300`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 + i * 0.08, duration: 0.4 }}
          >
            <stat.icon className="w-4 h-4 text-muted-foreground/30 mb-2.5" />
            <p className="text-[22px] font-serif text-foreground/80 leading-none">{stat.value}</p>
            <p className="text-[11px] font-medium text-foreground/55 mt-1">{stat.label}</p>
            <p className="text-[10px] text-muted-foreground/35 mt-0.5">{stat.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Ongoing indicator */}
      {ongoingCount > 0 && (
        <motion.div
          className="mt-3 rounded-xl px-4 py-2.5 bg-card border border-border/15 flex items-center justify-between"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{ boxShadow: "var(--shadow-xs)" }}
        >
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-sage/70 animate-breathe" />
            <span className="text-[11px] text-foreground/55">
              {ongoingCount} ongoing {ongoingCount === 1 ? "thread" : "threads"}
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground/30">actively tracked</span>
        </motion.div>
      )}

      {/* Archival message */}
      <p className="text-[10px] text-muted-foreground/25 text-center mt-4 leading-relaxed">
        Your body record grows with you. Every entry adds context to your story.
      </p>
    </motion.section>
  );
};

export default BodyRecord;
