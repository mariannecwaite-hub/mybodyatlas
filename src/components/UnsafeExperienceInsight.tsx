import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { REGION_LABELS, BodyRegion } from "@/context/AppContext";
import { PenLine } from "lucide-react";

interface UnsafeExperienceInsightProps {
  regions: BodyRegion[];
  timingDescription: string;
  onLearnMore?: () => void;
}

/**
 * A distinct, trauma-informed insight card for when physical patterns
 * cluster near an unsafe experience event. Visually recedes rather than advances.
 */
const UnsafeExperienceInsight = ({ regions, timingDescription, onLearnMore }: UnsafeExperienceInsightProps) => {
  const [showNote, setShowNote] = useState(false);
  const [note, setNote] = useState("");

  const regionText = regions.length === 0
    ? null
    : regions.length === 1
      ? `your ${REGION_LABELS[regions[0]]?.toLowerCase() || regions[0]}`
      : `your ${REGION_LABELS[regions[0]]?.toLowerCase() || regions[0]} and ${REGION_LABELS[regions[1]]?.toLowerCase() || regions[1]}`;

  const connectionLine = regionText
    ? `Some of the patterns in your record — particularly around ${regionText} — ${timingDescription}. This may or may not feel relevant to you.`
    : `Some of the patterns in your record ${timingDescription}. This may or may not feel relevant to you.`;

  return (
    <motion.div
      className="rounded-2xl p-7"
      style={{
        background: "#FAF8F5",
        border: "1px solid rgba(155,142,196,0.3)",
      }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Opening line */}
      <p
        className="text-[18px] italic leading-[1.6] mb-4"
        style={{ color: "#2A2A28", fontFamily: "'DM Serif Display', serif" }}
      >
        Experiences that affected how safe you felt in your body can have lasting effects on the nervous system and physical experience.
      </p>

      {/* Connection line */}
      <p
        className="text-[15px] leading-[1.75] mb-6"
        style={{ color: "#6B6960", fontFamily: "'DM Sans', sans-serif" }}
      >
        {connectionLine}
      </p>

      {/* Divider */}
      <div className="h-px mb-6" style={{ background: "rgba(155,142,196,0.2)" }} />

      {/* Gentle orientation */}
      <p
        className="text-[14px] italic leading-[1.7]"
        style={{ color: "#A8A59E", fontFamily: "'DM Sans', sans-serif" }}
      >
        Some people find it helpful to explore this with a somatic therapist, trauma-informed practitioner, or counsellor — in their own time, when it feels right.
      </p>

      {/* Quiet action links */}
      <div className="flex flex-col gap-2 mt-6">
        <button
          onClick={() => setShowNote(true)}
          className="text-left text-[13px] transition-colors duration-200 hover:opacity-80"
          style={{ color: "#A8A59E", fontFamily: "'DM Sans', sans-serif" }}
        >
          <PenLine className="w-3 h-3 inline mr-1.5" style={{ verticalAlign: "middle" }} />
          Add a private note
        </button>
        {onLearnMore && (
          <button
            onClick={onLearnMore}
            className="text-left text-[13px] transition-colors duration-200 hover:opacity-80"
            style={{ color: "#9B8EC4", fontFamily: "'DM Sans', sans-serif" }}
          >
            I'd like to understand this more
          </button>
        )}
      </div>

      {/* Private note field */}
      <AnimatePresence>
        {showNote && (
          <motion.div
            className="mt-4 space-y-2"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="This note is private and only for you…"
              rows={2}
              className="field-input resize-none text-[12px]"
              autoFocus
            />
            <button
              onClick={() => setShowNote(false)}
              className="text-[11px] px-3 py-1.5 rounded-full bg-primary/10 text-primary/60 font-medium"
            >
              Save note
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default UnsafeExperienceInsight;
