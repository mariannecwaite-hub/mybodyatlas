import { useMemo } from "react";
import { motion } from "framer-motion";

/** A soft inline note shown when an event strengthens a collective pattern */
const CollectivePatternNote = ({ regionIds }: { regionIds: string[] }) => {
  const isContributing = useMemo(() => {
    try { return localStorage.getItem("collective-atlas-consented") === "true"; } catch { return false; }
  }, []);

  // Common collective regions
  const collectiveRegions = ["neck", "lower_back", "abdomen", "hip_left", "hip_right", "knee_left", "knee_right"];
  const matches = regionIds.some((r) => collectiveRegions.includes(r));

  if (!isContributing || !matches) return null;

  return (
    <motion.div
      className="flex items-center gap-2 py-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#9B8EC4" }} />
      <p className="text-[12px] italic leading-relaxed" style={{ color: "#A8A59E", fontFamily: "'DM Sans', sans-serif" }}>
        This pattern appears across many women's records in the Collective.
      </p>
    </motion.div>
  );
};

export default CollectivePatternNote;
