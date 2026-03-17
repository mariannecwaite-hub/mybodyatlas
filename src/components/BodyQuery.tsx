import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, ChevronUp, Plus } from "lucide-react";
import { useApp, BodyRegion, BodyEvent, REGION_LABELS } from "@/context/AppContext";

/* ── keyword → region mapping ── */
const KEYWORD_MAP: Record<string, BodyRegion[]> = {
  head: ["head_jaw"], jaw: ["head_jaw"], temple: ["head_jaw"], headache: ["head_jaw"],
  neck: ["neck"], throat: ["neck"],
  shoulder: ["shoulder_left", "shoulder_right"], "left shoulder": ["shoulder_left"], "right shoulder": ["shoulder_right"],
  chest: ["chest"], heart: ["chest"], rib: ["chest"],
  "upper back": ["upper_back"], "mid back": ["upper_back"], thoracic: ["upper_back"],
  abdomen: ["abdomen"], stomach: ["abdomen"], gut: ["abdomen"], belly: ["abdomen"],
  "lower back": ["lower_back"], lumbar: ["lower_back"], back: ["lower_back", "upper_back"],
  hip: ["hip_left", "hip_right"], "left hip": ["hip_left"], "right hip": ["hip_right"], pelvis: ["hip_left", "hip_right"],
  knee: ["knee_left", "knee_right"], "left knee": ["knee_left"], "right knee": ["knee_right"],
  ankle: ["ankle_foot_left", "ankle_foot_right"], foot: ["ankle_foot_left", "ankle_foot_right"], feet: ["ankle_foot_left", "ankle_foot_right"],
  "left ankle": ["ankle_foot_left"], "right ankle": ["ankle_foot_right"],
  wrist: ["wrist_hand_left", "wrist_hand_right"], hand: ["wrist_hand_left", "wrist_hand_right"],
  "left wrist": ["wrist_hand_left"], "right wrist": ["wrist_hand_right"],
  skin: ["wrist_hand_left", "wrist_hand_right", "head_jaw"],
  stress: [], tension: ["neck", "shoulder_left", "shoulder_right", "upper_back"],
};

const EVENT_TYPE_KEYWORDS: Record<string, string[]> = {
  injury: ["injury", "sprain", "strain", "broke", "tear", "fracture"],
  symptom: ["ache", "pain", "tingle", "numb", "stiff", "sore", "tight", "click", "burning"],
  stress: ["stress", "anxious", "overwhelm", "burnout", "exhausted"],
  treatment: ["treatment", "physio", "osteopath", "therapy", "massage", "pilates"],
};

function parseQuery(query: string): { regions: BodyRegion[]; textTerms: string[] } {
  const lower = query.toLowerCase().trim();
  const matchedRegions = new Set<BodyRegion>();
  const textTerms: string[] = [];

  // Match multi-word keywords first (longer first)
  const sortedKeywords = Object.keys(KEYWORD_MAP).sort((a, b) => b.length - a.length);
  for (const kw of sortedKeywords) {
    if (lower.includes(kw)) {
      KEYWORD_MAP[kw].forEach((r) => matchedRegions.add(r));
    }
  }

  // Collect words for free-text search
  lower.split(/\s+/).forEach((w) => {
    if (w.length > 2) textTerms.push(w);
  });

  return { regions: Array.from(matchedRegions), textTerms };
}

function timeAgo(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const months = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
  if (months < 1) return "this month";
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (rem === 0) return `${years} year${years > 1 ? "s" : ""} ago`;
  return `${years}y ${rem}m ago`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

interface QueryResults {
  helped: BodyEvent[];
  didntHelp: BodyEvent[];
  matchedRegions: BodyRegion[];
  allMatched: BodyEvent[];
  noRegionMatch: boolean;
  noEventsAtAll: boolean;
}

function searchEvents(events: BodyEvent[], query: string): QueryResults {
  const { regions, textTerms } = parseQuery(query);

  if (regions.length === 0 && textTerms.length > 0) {
    // Try free-text match on titles/notes/descriptions
    const textMatched = events.filter((e) => {
      const blob = `${e.title} ${e.description} ${e.notes || ""} ${e.treatment || ""}`.toLowerCase();
      return textTerms.some((t) => blob.includes(t));
    });
    if (textMatched.length === 0) {
      return { helped: [], didntHelp: [], matchedRegions: [], allMatched: [], noRegionMatch: true, noEventsAtAll: true };
    }
    const helped = textMatched.filter((e) => e.type === "treatment" && e.treatmentOutcome === "helped");
    const didntHelp = textMatched.filter((e) => e.type === "treatment" && (e.treatmentOutcome === "no-change" || e.treatmentOutcome === "worse"));
    return { helped, didntHelp, matchedRegions: [], allMatched: textMatched, noRegionMatch: true, noEventsAtAll: false };
  }

  if (regions.length === 0) {
    return { helped: [], didntHelp: [], matchedRegions: [], allMatched: [], noRegionMatch: true, noEventsAtAll: true };
  }

  const regionMatched = events.filter((e) => e.regions.some((r) => regions.includes(r)));

  if (regionMatched.length === 0) {
    return { helped: [], didntHelp: [], matchedRegions: regions, allMatched: [], noRegionMatch: false, noEventsAtAll: true };
  }

  // Also include free-text matches
  const textMatched = events.filter((e) => {
    const blob = `${e.title} ${e.description} ${e.notes || ""} ${e.treatment || ""}`.toLowerCase();
    return textTerms.some((t) => blob.includes(t));
  });

  const allMatched = [...new Map([...regionMatched, ...textMatched].map((e) => [e.id, e])).values()];

  const helped = allMatched.filter((e) => e.type === "treatment" && e.treatmentOutcome === "helped");
  const didntHelp = allMatched.filter((e) => e.type === "treatment" && (e.treatmentOutcome === "no-change" || e.treatmentOutcome === "worse"));

  return { helped, didntHelp, matchedRegions: regions, allMatched, noRegionMatch: false, noEventsAtAll: false };
}

function buildContextSummary(events: BodyEvent[], regions: BodyRegion[]): string {
  if (events.length === 0) return "";
  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));
  const earliest = sorted[0];
  const latest = sorted[sorted.length - 1];
  const earliestYear = new Date(earliest.date).getFullYear();
  const latestYear = new Date(latest.date).getFullYear();

  const regionLabel = regions.length > 0
    ? regions.slice(0, 2).map((r) => REGION_LABELS[r]?.toLowerCase() || r).join(" and ")
    : "this area";

  const lifeEvents = events.filter((e) => e.type === "stress" || e.type === "life-event");
  const lifeContext = lifeEvents.length > 0
    ? ` Life context around this time included "${lifeEvents[0].title.toLowerCase()}".`
    : "";

  const span = latestYear - earliestYear;
  if (span === 0) {
    return `Based on what you've recorded so far — your ${regionLabel} first appeared in your record in ${earliestYear}, with ${events.length} event${events.length > 1 ? "s" : ""} noted.${lifeContext}`;
  }

  return `Based on what you've recorded so far — your ${regionLabel} has appeared in your record across ${span} years, from ${earliestYear} to ${latestYear}. You've logged ${events.length} event${events.length > 1 ? "s" : ""} in this area.${lifeContext}${events.some((e) => e.ongoing) ? " Some of these are still ongoing." : ""}`;
}

/* ── Pulse icon ── */
const PulseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0">
    <circle cx="12" cy="12" r="4" fill="hsl(var(--sage))" opacity="0.5" />
    <circle cx="12" cy="12" r="4" fill="none" stroke="hsl(var(--sage-foreground))" strokeWidth="1" opacity="0.4" />
    <circle cx="12" cy="12" r="8" fill="none" stroke="hsl(var(--sage-foreground))" strokeWidth="0.5" opacity="0.2">
      <animate attributeName="r" from="6" to="10" dur="2s" repeatCount="indefinite" />
      <animate attributeName="opacity" from="0.3" to="0" dur="2s" repeatCount="indefinite" />
    </circle>
  </svg>
);

/* ── Treatment result card ── */
const TreatmentCard = ({ event, prominent }: { event: BodyEvent; prominent?: boolean }) => (
  <div
    className={`rounded-2xl p-5 ${prominent ? "bg-[hsl(32,24%,94%)] border-l-2 border-[hsl(var(--sage-foreground))]" : "bg-card"}`}
    style={!prominent ? { boxShadow: "var(--shadow-sm)" } : undefined}
  >
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium text-foreground/80">{event.title}</p>
        <p className="text-[12px] text-muted-foreground/50 mt-0.5">
          {formatDate(event.date)} · {timeAgo(event.date)}
        </p>
      </div>
      {event.treatmentOutcome === "helped" && (
        <span className="text-[11px] px-2.5 py-1 rounded-full bg-[hsl(var(--sage))]/40 text-[hsl(var(--sage-foreground))] font-medium shrink-0">
          Helped
        </span>
      )}
      {event.treatmentOutcome === "no-change" && (
        <span className="text-[11px] px-2.5 py-1 rounded-full bg-secondary text-muted-foreground font-medium shrink-0">
          No change
        </span>
      )}
      {event.treatmentOutcome === "worse" && (
        <span className="text-[11px] px-2.5 py-1 rounded-full bg-destructive/10 text-destructive font-medium shrink-0">
          Worsened
        </span>
      )}
    </div>
    {event.treatment && (
      <p className="text-[13px] text-foreground/60 mt-3 leading-relaxed">{event.treatment.split("\n")[0]}</p>
    )}
    {event.notes && (
      <p className="mt-3 text-[14px] leading-relaxed text-foreground/70 italic" style={{ fontFamily: "'DM Serif Display', serif" }}>
        "{event.notes}"
      </p>
    )}
    {!event.ongoing && (
      <p className="text-[11px] text-muted-foreground/40 mt-2">This episode resolved</p>
    )}
    {event.ongoing && (
      <p className="text-[11px] text-[hsl(var(--sage-foreground))]/60 mt-2">Still ongoing</p>
    )}
  </div>
);

/* ── Main component ── */
interface BodyQueryProps {
  onOpenAddEvent: (region?: BodyRegion) => void;
  onSelectRegionOnMap: () => void;
}

const BodyQuery = ({ onOpenAddEvent, onSelectRegionOnMap }: BodyQueryProps) => {
  const { visibleEvents } = useApp();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [results, setResults] = useState<QueryResults | null>(null);
  const [showDidntHelp, setShowDidntHelp] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleSubmit = () => {
    if (!query.trim()) return;
    const r = searchEvents(visibleEvents, query.trim());
    setResults(r);
    inputRef.current?.blur();
  };

  const handleClose = () => {
    setResults(null);
    setQuery("");
    setFocused(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
    if (e.key === "Escape") handleClose();
  };

  // Scroll to results when they appear
  useEffect(() => {
    if (results && resultsRef.current) {
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }
  }, [results]);

  return (
    <div className="w-full">
      {/* ── Input bar ── */}
      <div className="relative">
        <div
          className={`flex items-center gap-2.5 rounded-full px-4 py-3 transition-all duration-300 ${
            focused
              ? "bg-card ring-1 ring-border/40"
              : "bg-[hsl(36,20%,92%)]"
          }`}
          style={focused ? { boxShadow: "var(--shadow-md)" } : undefined}
        >
          <PulseIcon />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => { if (!query && !results) setFocused(false); }}
            onKeyDown={handleKeyDown}
            placeholder="What is your body telling you right now?"
            className="flex-1 bg-transparent text-[15px] text-foreground/80 placeholder:text-muted-foreground/40 focus:outline-none"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          />
          {(query || results) && (
            <button onClick={handleClose} className="p-1 rounded-full hover:bg-secondary/50 transition-colors">
              <X className="w-4 h-4 text-muted-foreground/40" />
            </button>
          )}
          {query && !results && (
            <button
              onClick={handleSubmit}
              className="text-[12px] font-medium px-3.5 py-1.5 rounded-full bg-[hsl(var(--sage))]/30 text-[hsl(var(--sage-foreground))] hover:bg-[hsl(var(--sage))]/50 transition-colors"
            >
              Look back
            </button>
          )}
        </div>
        {/* Framing line in focused state */}
        <AnimatePresence>
          {focused && !results && (
            <motion.p
              className="text-[13px] italic text-center mt-2"
              style={{ color: "#A8A59E", fontFamily: "'DM Sans', sans-serif" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              Your body has said something like this before. Let's look back together.
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* ── Results ── */}
      <AnimatePresence>
        {results && (
          <motion.div
            ref={resultsRef}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="mt-6 space-y-0"
          >
            {/* No region match at all */}
            {results.noRegionMatch && results.noEventsAtAll && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-center py-10 space-y-4"
              >
                <p className="text-[14px] text-foreground/60 leading-relaxed max-w-xs mx-auto">
                  We weren't sure which part of your body you meant — tap the area on your map and we'll look back from there.
                </p>
                <button
                  onClick={() => { handleClose(); onSelectRegionOnMap(); }}
                  className="text-[13px] font-medium text-[hsl(var(--sage-foreground))] underline underline-offset-4 decoration-[hsl(var(--sage))]/40 hover:decoration-[hsl(var(--sage))]"
                >
                  Go to body map
                </button>
              </motion.div>
            )}

            {/* Region matched but no events */}
            {!results.noRegionMatch && results.noEventsAtAll && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-center py-10 space-y-4"
              >
                <p className="text-[14px] text-foreground/60 leading-relaxed max-w-sm mx-auto">
                  Nothing recorded here yet. If you log this episode and what you try, you'll have it for next time.
                </p>
                <button
                  onClick={() => { onOpenAddEvent(results.matchedRegions[0]); handleClose(); }}
                  className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[hsl(var(--sage-foreground))] underline underline-offset-4 decoration-[hsl(var(--sage))]/40 hover:decoration-[hsl(var(--sage))]"
                >
                  <Plus className="w-3.5 h-3.5" /> Log this episode
                </button>
              </motion.div>
            )}

            {/* Has results */}
            {!results.noEventsAtAll && (
              <div className="space-y-8">
                {/* 1. What helped */}
                {results.helped.length > 0 && (
                  <motion.section
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 }}
                  >
                    <h3 className="text-[10px] font-medium tracking-[0.15em] uppercase text-muted-foreground/45 mb-4">
                      What helped last time
                    </h3>
                    <div className="space-y-3">
                      {results.helped.map((e) => (
                        <TreatmentCard key={e.id} event={e} prominent />
                      ))}
                    </div>
                  </motion.section>
                )}

                {results.helped.length === 0 && results.allMatched.some((e) => e.type === "treatment") && (
                  <motion.section
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 }}
                  >
                    <h3 className="text-[10px] font-medium tracking-[0.15em] uppercase text-muted-foreground/45 mb-3">
                      What helped last time
                    </h3>
                    <p className="text-[13px] text-foreground/50 leading-relaxed">
                      You've recorded experiences in this area, but haven't logged what helped yet. Adding outcomes to your treatments means you'll have this for next time.
                    </p>
                  </motion.section>
                )}

                {/* Divider */}
                {results.helped.length > 0 && results.didntHelp.length > 0 && (
                  <div className="border-t border-border/20" />
                )}

                {/* 2. What didn't help — collapsed */}
                {results.didntHelp.length > 0 && (
                  <motion.section
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.25 }}
                  >
                    <button
                      onClick={() => setShowDidntHelp(!showDidntHelp)}
                      className="flex items-center gap-2 text-[10px] font-medium tracking-[0.15em] uppercase text-muted-foreground/45 mb-3 hover:text-muted-foreground/60 transition-colors"
                    >
                      What you've tried that didn't change things
                      {showDidntHelp ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                    <AnimatePresence>
                      {showDidntHelp && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-3 overflow-hidden"
                        >
                          {results.didntHelp.map((e) => (
                            <TreatmentCard key={e.id} event={e} />
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.section>
                )}

                {/* Divider */}
                <div className="border-t border-border/20" />

                {/* 3. Context summary */}
                <motion.section
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                >
                  <h3 className="text-[10px] font-medium tracking-[0.15em] uppercase text-muted-foreground/45 mb-3">
                    What your record shows about this area
                  </h3>
                  <p className="text-[14px] text-foreground/60 leading-[1.75]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    {buildContextSummary(results.allMatched, results.matchedRegions)}
                  </p>
                </motion.section>

                {/* Divider */}
                <div className="border-t border-border/20" />

                {/* 4. Log this episode */}
                <motion.section
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45 }}
                  className="text-center py-4"
                >
                  <p className="text-[13px] text-foreground/50 mb-3">
                    Want to record this episode? You'll have it for next time.
                  </p>
                  <button
                    onClick={() => { onOpenAddEvent(results.matchedRegions[0]); handleClose(); }}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-[hsl(var(--sage-foreground))]/25 text-[hsl(var(--sage-foreground))] text-[13px] font-medium hover:bg-[hsl(var(--sage))]/20 transition-all duration-300 active:scale-[0.97]"
                  >
                    <Plus className="w-3.5 h-3.5" /> Log this episode
                  </button>
                </motion.section>

                {/* Disclaimer */}
                <p className="text-center text-[11px] text-muted-foreground/30 pt-2 pb-4">
                  This reflects your personal record only. It is not medical advice.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BodyQuery;
