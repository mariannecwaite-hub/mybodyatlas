import { useState } from "react";
import { useApp, REGION_LABELS } from "@/context/AppContext";
import { usePatternEngine } from "@/hooks/usePatternEngine";
import { motion } from "framer-motion";
import { Bookmark, X as XIcon, BookOpen } from "lucide-react";
import TreatmentGuide from "@/components/TreatmentGuide";

const MAX_INSIGHTS = 2;

const InsightCards = () => {
  const { state, visibleEvents, revealInsights, highlightInsight } = useApp();
  const [savedInsights, setSavedInsights] = useState<string[]>([]);
  const [dismissedInsights, setDismissedInsights] = useState<string[]>([]);
  const [showGuide, setShowGuide] = useState(false);

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

  const allInsights = usePatternEngine(visibleEvents, {
    selectedRegion: state.selectedRegion,
    maxResults: MAX_INSIGHTS + dismissedInsights.length + 2,
  });

  const insights = allInsights
    .filter((c) => !dismissedInsights.includes(c.id))
    .slice(0, MAX_INSIGHTS);

  const toneStyles: Record<string, string> = {
    sage: "bg-sage/15 border-sage/20",
    lavender: "bg-lavender/15 border-lavender/20",
    warm: "bg-warm/18 border-warm/20",
  };

  const toggleSave = (id: string) => {
    setSavedInsights((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const dismiss = (id: string) => {
    setDismissedInsights((prev) => [...prev, id]);
  };

  return (
    <div className="space-y-6" role="region" aria-label="Reflections — gentle observations about patterns you've recorded">
      <div>
        <h2 className="text-[22px] font-serif text-foreground/90 leading-tight">Patterns Worth Noticing</h2>
        {state.selectedRegion && (
          <p className="text-[11px] text-muted-foreground/40 mt-1 tracking-wide">
            About your {REGION_LABELS[state.selectedRegion].toLowerCase()}
          </p>
        )}
      </div>

      <div className="space-y-4">
        {insights.map((insight, i) => {
          const isActive = state.activeInsightId === insight.id;
          return (
            <motion.div
              key={insight.id}
              className={`rounded-2xl p-6 border relative cursor-pointer ${
                toneStyles[insight.tone] || ""
              }`}
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                boxShadow: isActive
                  ? "0 8px 32px -8px hsl(228 10% 22% / 0.08)"
                  : "0 1px 4px 0 hsl(228 10% 22% / 0.02)",
              }}
              whileHover={{
                y: -2,
                boxShadow: "0 6px 24px -6px hsl(228 10% 22% / 0.06)",
                transition: { duration: 0.4 },
              }}
              transition={{
                delay: 0.4 + i * 0.18,
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{
                outline: isActive ? "2px solid hsl(var(--primary) / 0.15)" : "none",
                outlineOffset: "1px",
                transition: "outline 0.4s ease",
              }}
              role="article"
              aria-label={insight.title}
              onClick={() => highlightInsight(insight.id, insight.relatedRegions, insight.relatedEventIds)}
            >
              {/* Region label chip */}
              {insight.regionLabel && (
                <div className="absolute top-4 right-4">
                  <span className="px-2 py-0.5 rounded-full bg-sage/15 text-[9px] font-medium text-sage-foreground/50 tracking-wider uppercase">
                    {insight.regionLabel}
                  </span>
                </div>
              )}

              <p className="text-[15px] font-serif text-foreground/85 mb-2">{insight.title}</p>
              <p className="text-[13px] text-muted-foreground/60 leading-[1.8] mb-4">{insight.body}</p>

              {/* Highlighted regions indicator */}
              {isActive && insight.relatedRegions.length > 0 && (
                <motion.div
                  className="mb-3 flex flex-wrap gap-1.5"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                >
                  {insight.relatedRegions.slice(0, 4).map((r) => (
                    <span key={r} className="px-2 py-0.5 rounded-full bg-primary/10 text-[10px] text-primary/60 font-medium">
                      {REGION_LABELS[r]}
                    </span>
                  ))}
                  <span className="text-[10px] text-muted-foreground/35 self-center ml-1">
                    · {insight.relatedEventIds.length} related events highlighted
                  </span>
                </motion.div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => toggleSave(insight.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all duration-200 ${
                    savedInsights.includes(insight.id)
                      ? "bg-primary/10 text-primary/70"
                      : "bg-secondary/50 text-muted-foreground/50 hover:text-muted-foreground/70"
                  }`}
                >
                  <Bookmark className="w-3 h-3" />
                  {savedInsights.includes(insight.id) ? "Saved" : "Save"}
                </button>
                <button
                  onClick={() => dismiss(insight.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium bg-secondary/50 text-muted-foreground/50 hover:text-muted-foreground/70 transition-all duration-200"
                >
                  <XIcon className="w-3 h-3" />
                  Dismiss
                </button>
                <button
                  onClick={() => setShowGuide(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium bg-secondary/50 text-muted-foreground/50 hover:text-muted-foreground/70 transition-all duration-200"
                >
                  <BookOpen className="w-3 h-3" />
                  Learn more
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Disclaimer */}
      <p className="text-[10px] text-muted-foreground/30 text-center leading-relaxed pt-2">
        Based on what you've recorded so far. This is a reflection, not a medical assessment.
      </p>

      <TreatmentGuide open={showGuide} onClose={() => setShowGuide(false)} />
    </div>
  );
};

export default InsightCards;
