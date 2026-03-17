import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp, BodyRegion, REGION_LABELS } from "@/context/AppContext";
import { PatternInsight } from "@/hooks/usePatternEngine";

const STORAGE_KEY = "aha-dismissed-insights";

function getDismissedIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveDismissedId(id: string) {
  const ids = getDismissedIds();
  if (!ids.includes(id)) {
    ids.push(id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }
}

/** Generate a deeply personal "aha" insight referencing specific events */
function generateAhaInsight(
  events: ReturnType<typeof useApp>["visibleEvents"],
  dismissed: string[]
): { id: string; text: string } | null {
  if (events.length < 8) return null;

  const years = new Set(events.map((e) => new Date(e.date).getFullYear()));
  if (years.size < 3) return null;

  const sorted = [...events].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Build region → events for cross-referencing
  const regionEvents: Record<string, typeof events> = {};
  events.forEach((e) => {
    e.regions.forEach((r) => {
      if (!regionEvents[r]) regionEvents[r] = [];
      regionEvents[r].push(e);
    });
  });

  const candidates: { id: string; text: string }[] = [];

  // Strategy 1: Two events in related regions across different years
  const pairs: [string, string][] = [
    ["ankle_foot_left", "lower_back"], ["ankle_foot_right", "lower_back"],
    ["ankle_foot_left", "knee_left"], ["ankle_foot_right", "knee_right"],
    ["knee_left", "hip_left"], ["knee_right", "hip_right"],
    ["neck", "shoulder_left"], ["neck", "shoulder_right"],
    ["lower_back", "hip_left"], ["lower_back", "hip_right"],
  ];

  for (const [regionA, regionB] of pairs) {
    const evtsA = regionEvents[regionA];
    const evtsB = regionEvents[regionB];
    if (!evtsA?.length || !evtsB?.length) continue;

    const earliest = [...evtsA].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )[0];
    const later = [...evtsB].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )[0];

    if (new Date(earliest.date).getFullYear() === new Date(later.date).getFullYear()) continue;

    const yearA = new Date(earliest.date).getFullYear();
    const yearB = new Date(later.date).getFullYear();
    const labelA = REGION_LABELS[regionA as BodyRegion]?.toLowerCase() || regionA;
    const labelB = REGION_LABELS[regionB as BodyRegion]?.toLowerCase() || regionB;
    const id = `aha-${regionA}-${regionB}`;

    if (dismissed.includes(id)) continue;

    candidates.push({
      id,
      text: `Your ${labelA} took a knock in ${yearA} — "${earliest.title.toLowerCase()}". Your ${labelB} started speaking up in ${yearB} with "${later.title.toLowerCase()}". Bodies have long memories — it may be worth wondering whether they're part of the same story.`,
    });
  }

  // Strategy 2: Stress event followed by physical events
  const stressEvents = sorted.filter((e) => e.type === "stress" || e.type === "life-event");
  const physicalEvents = sorted.filter((e) => e.type === "injury" || e.type === "symptom");

  for (const stress of stressEvents) {
    const stressTime = new Date(stress.date).getTime();
    const THREE_MONTHS = 90 * 24 * 60 * 60 * 1000;
    const nearby = physicalEvents.filter((p) => {
      const pTime = new Date(p.date).getTime();
      return pTime > stressTime && pTime - stressTime < THREE_MONTHS;
    });

    if (nearby.length === 0) continue;
    const first = nearby[0];
    const stressYear = new Date(stress.date).getFullYear();
    const id = `aha-stress-${stress.id}-${first.id}`;

    if (dismissed.includes(id)) continue;

    candidates.push({
      id,
      text: `In ${stressYear}, "${stress.title.toLowerCase()}" happened. Shortly after, "${first.title.toLowerCase()}" appeared. Some of these arrived during harder times — your body often carries what life brings. Based on what you've recorded so far.`,
    });
  }

  // Strategy 3: Region recurring across many years
  for (const [region, evts] of Object.entries(regionEvents)) {
    if (evts.length < 3) continue;
    const regionYears = [...new Set(evts.map((e) => new Date(e.date).getFullYear()))].sort();
    if (regionYears.length < 3) continue;

    const label = REGION_LABELS[region as BodyRegion]?.toLowerCase() || region;
    const firstEvt = evts.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )[0];
    const lastEvt = evts.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];
    const id = `aha-recurring-${region}`;

    if (dismissed.includes(id)) continue;

    candidates.push({
      id,
      text: `Your ${label} story starts in ${regionYears[0]} with "${firstEvt.title.toLowerCase()}" and reaches all the way to ${regionYears[regionYears.length - 1]} — "${lastEvt.title.toLowerCase()}". Your body has been saying something here for a while. Based on what you've recorded so far.`,
    });
  }

  if (candidates.length === 0) return null;

  // Pick the longest (most specific) candidate
  candidates.sort((a, b) => b.text.length - a.text.length);
  return candidates[0];
}

interface AhaMomentProps {
  onSave?: (insightId: string) => void;
}

const AhaMoment = ({ onSave }: AhaMomentProps) => {
  const { visibleEvents } = useApp();
  const [dismissed, setDismissed] = useState(getDismissedIds);
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  const insight = useMemo(
    () => generateAhaInsight(visibleEvents, dismissed),
    [visibleEvents, dismissed]
  );

  useEffect(() => {
    if (insight && !visible && !closing) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [insight, visible, closing]);

  const handleDismiss = (save: boolean) => {
    if (!insight) return;
    saveDismissedId(insight.id);
    setDismissed(getDismissedIds());
    if (save && onSave) onSave(insight.id);
    setClosing(true);
    setTimeout(() => {
      setVisible(false);
      setClosing(false);
    }, 500);
  };

  return (
    <AnimatePresence>
      {visible && insight && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center px-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Background */}
          <div className="absolute inset-0 bg-background" />

          {/* Content */}
          <motion.div
            className="relative z-10 max-w-md w-full text-center space-y-8"
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Label */}
            <motion.p
              className="text-[10.5px] font-medium text-muted-foreground/40 uppercase tracking-[0.2em]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              Something worth noticing
            </motion.p>

            {/* Insight text */}
            <motion.p
              className="text-[22px] md:text-[26px] font-serif italic text-foreground/80 leading-[1.8]"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              {insight.text}
            </motion.p>

            {/* Disclaimer */}
            <motion.p
              className="text-[10px] text-muted-foreground/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0 }}
            >
              Based on what you've recorded so far. This is a reflection, not a medical assessment.
            </motion.p>

            {/* Actions */}
            <motion.div
              className="flex flex-col items-center gap-3 pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.5 }}
            >
              <button
                onClick={() => handleDismiss(true)}
                className="px-6 py-3 rounded-full bg-primary/85 text-primary-foreground text-[13px] font-medium transition-all duration-300 hover:bg-primary active:scale-[0.97]"
                style={{ boxShadow: "var(--shadow-sm)" }}
              >
                Save this to my story
              </button>
              <button
                onClick={() => handleDismiss(false)}
                className="px-6 py-2.5 text-[12px] text-muted-foreground/45 hover:text-muted-foreground/65 transition-colors duration-300"
              >
                I'll reflect on this later
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AhaMoment;
