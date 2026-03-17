import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import { useApp, REGION_LABELS, BodyRegion } from "@/context/AppContext";
import { ContributionSettings } from "./CollectiveConsent";
import AtlasSymbol from "@/components/AtlasSymbol";

interface CollectiveAtlasProps {
  open: boolean;
  onClose: () => void;
}

const COLLECTIVE_INSIGHTS = [
  {
    id: "ci1",
    text: "Stress periods and physical flares appear within 3 months of each other in the majority of records that include both.",
    supporting: "The most commonly affected regions: neck, lower back, and abdomen.",
    count: 2847,
  },
  {
    id: "ci2",
    text: "The combination of fatigue and hormonal changes is one of the most logged patterns — and among the most frequently dismissed in clinical settings.",
    supporting: "Women who logged this pattern waited an average of 4.2 years before receiving acknowledgement.",
    count: 3156,
  },
  {
    id: "ci3",
    text: "Lower-body experiences are the most common thread across the Collective — often beginning earlier in life than the person first recognises.",
    supporting: "Hip, knee, and lower back experiences account for the largest share of logged events.",
    count: 4203,
  },
];

const CollectiveAtlas = ({ open, onClose }: CollectiveAtlasProps) => {
  const { visibleEvents, state } = useApp();
  const [expandedInfo, setExpandedInfo] = useState<string | null>(null);

  const isContributing = useMemo(() => {
    try {
      return localStorage.getItem("collective-atlas-consented") === "true";
    } catch { return false; }
  }, []);

  // Generate personal comparison based on user's events
  const personalComparison = useMemo(() => {
    if (!isContributing) return null;
    const stressEvents = visibleEvents.filter((e) => e.type === "stress");
    const physicalEvents = visibleEvents.filter((e) =>
      ["injury", "symptom"].includes(e.type) && e.regions.some((r) => ["neck", "lower_back", "abdomen"].includes(r))
    );
    if (stressEvents.length > 0 && physicalEvents.length > 0) {
      return "Your stress-body pattern is one shared by many women in the Collective. You're not alone in this.";
    }
    const lowerBodyEvents = visibleEvents.filter((e) =>
      e.regions.some((r) => ["lower_back", "hip_left", "hip_right", "knee_left", "knee_right", "ankle_foot_left", "ankle_foot_right"].includes(r))
    );
    if (lowerBodyEvents.length >= 2) {
      return "Your lower-body experiences are part of a pattern that many women share. This area of the body tells a story across the Collective.";
    }
    return "Your record is part of a growing picture. As more women contribute, the collective understanding deepens.";
  }, [isContributing, visibleEvents]);

  const InfoExpander = ({ id, label }: { id: string; label: string }) => {
    const isExpanded = expandedInfo === id;
    return (
      <div className="border-b border-border/15">
        <button
          onClick={() => setExpandedInfo(isExpanded ? null : id)}
          className="w-full flex items-center justify-between py-3.5 text-left"
        >
          <span className="text-[13px] font-medium" style={{ color: "#2A2A28" }}>{label}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground/40" /> : <ChevronDown className="w-4 h-4 text-muted-foreground/40" />}
        </button>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="pb-4">
                {id === "what-we-do" && (
                  <p className="text-[13px] leading-[1.75]" style={{ color: "#6B6960" }}>
                    Your patterns are stripped of all identifying details — no names, no specific dates, no written notes. Only the anonymous shape of your experiences is included: which body regions, what type of event, the rough timing, and whether treatments helped. These experiences are combined with patterns from other women to surface collective insights that no single record could reveal.
                  </p>
                )}
                {id === "who-access" && (
                  <p className="text-[13px] leading-[1.75]" style={{ color: "#6B6960" }}>
                    The collective patterns are visible to all contributing members of the Atlas. In time, anonymised and aggregated insights may be shared with researchers and healthcare organisations working to improve women's health — always in aggregate, never as individual records, and always with full transparency about who and why.
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 bg-background overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="max-w-lg mx-auto px-6 py-8 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between mb-10">
              <div />
              <button onClick={onClose} className="p-2 -mr-2 rounded-full hover:bg-secondary/60 transition-colors">
                <X className="w-5 h-5 text-muted-foreground/50" />
              </button>
            </div>

            {/* Title */}
            <motion.div
              className="mb-12"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <AtlasSymbol size={24} />
              </div>
              <h2 className="text-[28px] font-serif leading-tight" style={{ color: "#2A2A28" }}>
                What we're learning together
              </h2>
              <p className="text-[15px] italic mt-3 leading-relaxed" style={{ color: "#6B6960", fontFamily: "'DM Sans', sans-serif" }}>
                Anonymous patterns from women who've chosen to share
              </p>
            </motion.div>

            {/* Collective insight cards */}
            <div className="space-y-5 mb-12">
              {COLLECTIVE_INSIGHTS.map((insight, i) => (
                <motion.div
                  key={insight.id}
                  className="rounded-xl p-5"
                  style={{
                    background: "#F5F2FA",
                    borderLeft: "2px solid #9B8EC4",
                    borderRadius: "12px",
                  }}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + i * 0.12, duration: 0.5 }}
                >
                  <p className="text-[10px] font-medium uppercase tracking-[0.2em] mb-3" style={{ color: "#9B8EC4" }}>
                    COLLECTIVE PATTERN
                  </p>
                  <p className="text-[18px] font-serif italic leading-[1.6] mb-3" style={{ color: "#2A2A28" }}>
                    {insight.text}
                  </p>
                  <p className="text-[13px] leading-relaxed mb-2" style={{ color: "#6B6960" }}>
                    {insight.supporting}
                  </p>
                  <p className="text-[11px]" style={{ color: "#A8A59E" }}>
                    Based on {insight.count.toLocaleString()} contributing women's records
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Personal comparison */}
            <motion.div
              className="mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              {isContributing && personalComparison ? (
                <div>
                  <p className="text-[15px] font-medium mb-3" style={{ color: "#2A2A28", fontFamily: "'DM Sans', sans-serif" }}>
                    How your record compares
                  </p>
                  <p className="text-[14px] leading-[1.75] italic font-serif" style={{ color: "#6B6960" }}>
                    {personalComparison}
                  </p>
                </div>
              ) : (
                <p className="text-[13px] italic text-center leading-relaxed" style={{ color: "#A8A59E" }}>
                  Contribute your patterns to see how your experience relates to the Collective →
                </p>
              )}
            </motion.div>

            {/* Info expanders */}
            <div className="mb-8">
              <InfoExpander id="what-we-do" label="What we do with your patterns →" />
              <InfoExpander id="who-access" label="Who can access the collective data →" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CollectiveAtlas;
