import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp, REGION_LABELS, EventType } from "@/context/AppContext";
import { X, Sparkles } from "lucide-react";

interface BodyStorySummaryProps {
  open: boolean;
  onClose: () => void;
}

const typeLabels: Record<EventType, string> = {
  injury: "Injuries",
  symptom: "Sensations",
  stress: "Stress periods",
  treatment: "Treatments",
  "life-event": "Life transitions",
};

const BodyStorySummary = ({ open, onClose }: BodyStorySummaryProps) => {
  const { visibleEvents } = useApp();

  const allRegions = [...new Set(visibleEvents.flatMap((e) => e.regions))];
  const years = [...new Set(visibleEvents.map((e) => new Date(e.date).getFullYear()))].sort();
  const span = years.length > 1 ? `${years[0]}–${years[years.length - 1]}` : years[0]?.toString() || "—";

  const typeCounts = visibleEvents.reduce((acc, e) => {
    acc[e.type] = (acc[e.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const treatments = visibleEvents.filter((e) => e.type === "treatment");
  const ongoingCount = visibleEvents.filter((e) => e.ongoing).length;

  const topRegions = Object.entries(
    visibleEvents.flatMap((e) => e.regions).reduce((acc, r) => {
      acc[r] = (acc[r] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  // Simple pattern observations
  const patterns: string[] = [];
  const stressEvents = visibleEvents.filter((e) => e.type === "stress");
  const symptomEvents = visibleEvents.filter((e) => e.type === "symptom");
  if (stressEvents.length > 0 && symptomEvents.length > 0) {
    patterns.push("Stress periods and physical sensations appear connected in your history.");
  }
  if (ongoingCount > 2) {
    patterns.push(`You're currently navigating ${ongoingCount} ongoing threads — that takes resilience.`);
  }
  if (treatments.length > 0) {
    patterns.push(`You've tried ${treatments.length} different forms of care. That shows commitment to yourself.`);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="modal-overlay" onClick={onClose} />
          <motion.div
            className="modal-content max-w-md"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
          >
            <div className="modal-header">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sage-foreground/60" />
                <h2 className="text-xl">Your Body Story So Far</h2>
              </div>
              <button onClick={onClose} className="modal-close">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <motion.p
              className="text-[13px] text-muted-foreground/60 leading-[1.8] mb-7"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              A quiet summary of what you've recorded. This is your story — not a diagnosis.
            </motion.p>

            <div className="space-y-6">
              {/* Timeline span */}
              <motion.div
                className="rounded-2xl p-5 bg-warm/18 border border-warm/20"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <p className="section-label mb-2">Your timeline</p>
                <p className="text-[20px] font-serif text-foreground/85">{span}</p>
                <p className="text-[12px] text-muted-foreground/50 mt-1">
                  {visibleEvents.length} events across {years.length} {years.length === 1 ? "year" : "years"}
                </p>
              </motion.div>

              {/* Highlighted regions */}
              {topRegions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <p className="section-label mb-2.5">Areas that come up most</p>
                  <div className="flex flex-wrap gap-1.5">
                    {topRegions.map(([region, count]) => (
                      <span
                        key={region}
                        className="chip chip-inactive text-[11px]"
                      >
                        {REGION_LABELS[region as keyof typeof REGION_LABELS]} · {count}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Event type breakdown */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <p className="section-label mb-2.5">What you've recorded</p>
                <div className="space-y-2">
                  {Object.entries(typeCounts).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between py-1.5">
                      <span className="text-[13px] text-foreground/70">
                        {typeLabels[type as EventType] || type}
                      </span>
                      <span className="text-[12px] text-muted-foreground/40">{count}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Treatments tried */}
              {treatments.length > 0 && (
                <motion.div
                  className="rounded-2xl p-5 bg-sage/12 border border-sage/20"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <p className="section-label mb-2.5 text-sage-foreground/60">Care you've tried</p>
                  <div className="space-y-1.5">
                    {treatments.slice(0, 4).map((t) => (
                      <p key={t.id} className="text-[13px] text-foreground/70">
                        {t.title}
                        {t.ongoing && (
                          <span className="ml-1.5 text-sage-foreground/50 text-[11px]">· ongoing</span>
                        )}
                      </p>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Patterns worth exploring */}
              {patterns.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <p className="section-label mb-2.5">Patterns worth exploring</p>
                  <div className="space-y-2.5">
                    {patterns.map((p, i) => (
                      <p key={i} className="text-[13px] text-muted-foreground/60 leading-[1.8]">
                        {p}
                      </p>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Validating footer */}
              <motion.div
                className="rounded-2xl p-5 bg-lavender/12 border border-lavender/20 text-center"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <p className="text-[14px] font-serif text-foreground/80 mb-1.5">
                  You've been paying attention
                </p>
                <p className="text-[12px] text-muted-foreground/50 leading-[1.8]">
                  This record reflects care and self-awareness. That matters — regardless of what comes next.
                </p>
              </motion.div>
            </div>

            <p className="text-[10px] text-muted-foreground/30 text-center mt-6">
              This is a personal reflection, not medical advice.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BodyStorySummary;
