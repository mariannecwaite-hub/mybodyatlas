import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp, REGION_LABELS, EventType, BodyRegion } from "@/context/AppContext";
import { usePatternEngine } from "@/hooks/usePatternEngine";
import { useBodyThreads } from "@/hooks/useBodyThreads";
import BodyThreads from "@/components/BodyThreads";
import { Lock, FileText, Bookmark, X as XIcon, BookOpen } from "lucide-react";
import { miniSilhouettePath } from "@/components/BodySilhouette";

const typeLabels: Record<EventType, string> = {
  injury: "Injuries",
  symptom: "Sensations",
  stress: "Stress periods",
  treatment: "Treatments explored",
  "life-event": "Life transitions",
};

const typeDotColors: Record<EventType, string> = {
  injury: "bg-body-pain",
  symptom: "bg-body-tension",
  stress: "bg-body-tension",
  treatment: "bg-body-healing",
  "life-event": "bg-body-neutral",
};

const MAX_STORY_INSIGHTS = 3;
const MAGIC_MOMENT_THRESHOLD = 10;

interface BodyStoryViewProps {
  onCreateSummary: () => void;
}

/** Minimal body silhouette regions for the story overview */
const storyRegionPositions: Record<string, { cx: number; cy: number }> = {
  head_jaw: { cx: 50, cy: 10 },
  neck: { cx: 50, cy: 18 },
  shoulder_left: { cx: 35, cy: 24 },
  shoulder_right: { cx: 65, cy: 24 },
  chest: { cx: 50, cy: 32 },
  upper_back: { cx: 50, cy: 32 },
  abdomen: { cx: 50, cy: 45 },
  lower_back: { cx: 50, cy: 45 },
  wrist_hand_left: { cx: 22, cy: 48 },
  wrist_hand_right: { cx: 78, cy: 48 },
  hip_left: { cx: 42, cy: 56 },
  hip_right: { cx: 58, cy: 56 },
  knee_left: { cx: 42, cy: 72 },
  knee_right: { cx: 58, cy: 72 },
  ankle_foot_left: { cx: 42, cy: 88 },
  ankle_foot_right: { cx: 58, cy: 88 },
};

/** Build a narrative sentence from type counts */
function buildNarrativeSummary(typeCounts: Record<string, number>): string {
  const parts: string[] = [];
  const entries = Object.entries(typeCounts).sort(([, a], [, b]) => b - a);

  entries.forEach(([type, count]) => {
    if (type === "symptom") parts.push(`${count} sensation${count > 1 ? "s" : ""} noticed`);
    else if (type === "injury") parts.push(`${count} injur${count > 1 ? "ies" : "y"}`);
    else if (type === "treatment") parts.push(`${count} treatment${count > 1 ? "s" : ""} explored`);
    else if (type === "stress") parts.push(`${count} stress period${count > 1 ? "s" : ""}`);
    else if (type === "life-event") parts.push(`${count} life transition${count > 1 ? "s" : ""}`);
  });

  if (parts.length === 0) return "";
  if (parts.length === 1) return `Mostly ${parts[0]}.`;
  const last = parts.pop();
  return `${parts.join(", ")}, and ${last}.`;
}

const BodyStoryView = ({ onCreateSummary }: BodyStoryViewProps) => {
  const { visibleEvents, state, highlightInsight } = useApp();
  const [dismissedPatterns, setDismissedPatterns] = useState<string[]>([]);
  const [savedPatterns, setSavedPatterns] = useState<string[]>([]);
  const [reflection, setReflection] = useState("");
  const [animationPhase, setAnimationPhase] = useState(0);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [highlightedStoryRegion, setHighlightedStoryRegion] = useState<string | null>(null);
  const [privacyDismissed, setPrivacyDismissed] = useState(() => {
    try { return localStorage.getItem("body-story-privacy-seen") === "true"; } catch { return false; }
  });
  const threads = useBodyThreads(visibleEvents);

  const years = [...new Set(visibleEvents.map((e) => new Date(e.date).getFullYear()))].sort();
  const span = years.length > 1 ? `${years[0]}–${years[years.length - 1]}` : years[0]?.toString() || "—";

  const typeCounts = visibleEvents.reduce((acc, e) => {
    acc[e.type] = (acc[e.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const treatments = visibleEvents.filter((e) => e.type === "treatment");

  const topRegions = Object.entries(
    visibleEvents.flatMap((e) => e.regions).reduce((acc, r) => {
      acc[r] = (acc[r] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const activeRegions = new Set(visibleEvents.flatMap((e) => e.regions));

  // ── Timeline animation data ──
  const timelinePhases = useMemo(() => {
    const sorted = [...visibleEvents].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const phases: { year: number; regions: BodyRegion[]; event: typeof sorted[0] }[] = [];
    sorted.forEach((event) => {
      const year = new Date(event.date).getFullYear();
      phases.push({ year, regions: event.regions, event });
    });
    return phases;
  }, [visibleEvents]);

  const showMagicMoment = visibleEvents.length >= MAGIC_MOMENT_THRESHOLD;

  useEffect(() => {
    if (!showMagicMoment || animationComplete) return;
    if (timelinePhases.length === 0) { setAnimationComplete(true); return; }

    const totalPhases = Math.min(timelinePhases.length, 8);
    const interval = setInterval(() => {
      setAnimationPhase((prev) => {
        if (prev >= totalPhases) {
          clearInterval(interval);
          setAnimationComplete(true);
          return prev;
        }
        return prev + 1;
      });
    }, 600);

    return () => clearInterval(interval);
  }, [showMagicMoment, timelinePhases.length, animationComplete]);

  const revealedRegions = useMemo(() => {
    if (animationComplete) return activeRegions;
    const revealed = new Set<BodyRegion>();
    timelinePhases.slice(0, animationPhase).forEach((p) => {
      p.regions.forEach((r) => revealed.add(r));
    });
    return revealed;
  }, [animationPhase, animationComplete, timelinePhases, activeRegions]);

  const currentAnimPhase = animationPhase > 0 && animationPhase <= timelinePhases.length
    ? timelinePhases[animationPhase - 1]
    : null;

  // Life phase clusters
  const lifeClusters: { label: string; count: number; types: EventType[] }[] = [];
  if (years.length > 0) {
    let clusterStart = years[0];
    let clusterEvents: typeof visibleEvents = [];
    years.forEach((year, i) => {
      const yearEvents = visibleEvents.filter((e) => new Date(e.date).getFullYear() === year);
      clusterEvents.push(...yearEvents);
      const isLast = i === years.length - 1;
      const gap = !isLast && years[i + 1] - year > 2;
      if (isLast || gap || clusterEvents.length >= 4) {
        lifeClusters.push({
          label: year === clusterStart ? `${year}` : `${clusterStart}–${year}`,
          count: clusterEvents.length,
          types: [...new Set(clusterEvents.map((e) => e.type))],
        });
        clusterEvents = [];
        if (!isLast) clusterStart = years[i + 1];
      }
    });
    if (clusterEvents.length > 0) {
      const lastYear = years[years.length - 1];
      lifeClusters.push({
        label: lastYear === clusterStart ? `${lastYear}` : `${clusterStart}–${lastYear}`,
        count: clusterEvents.length,
        types: [...new Set(clusterEvents.map((e) => e.type))],
      });
    }
  }

  // Pattern engine
  const allInsights = usePatternEngine(visibleEvents, { maxResults: MAX_STORY_INSIGHTS + dismissedPatterns.length + 2 });
  const visibleInsights = allInsights
    .filter((p) => !dismissedPatterns.includes(p.id))
    .slice(0, MAX_STORY_INSIGHTS);

  const toneStyles: Record<string, string> = {
    sage: "bg-sage/12 border-sage/18",
    lavender: "bg-lavender/12 border-lavender/18",
    warm: "bg-warm/15 border-warm/18",
  };

  const narrativeSummary = buildNarrativeSummary(typeCounts);

  return (
    <div className="pt-8 pb-12 space-y-8" role="region" aria-label="Your Body Story So Far">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
        <h2 className="text-[30px] font-serif text-foreground/90 leading-tight text-center">Your Body Story So Far</h2>
      </motion.div>

      {/* Hero insights — calm, direct observations */}
      {visibleInsights.length > 0 && (
        <motion.div
          className="py-4 px-4 max-w-md mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          {visibleInsights.slice(0, 3).map((insight, i) => (
            <motion.div
              key={insight.id}
              className={`text-center ${i > 0 ? "mt-0" : ""}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              {i > 0 && (
                <div className="flex justify-center py-6">
                  <div className="w-12 h-px bg-border/30" />
                </div>
              )}
              <span className="inline-block px-3 py-1 rounded-full bg-sage/15 text-[10px] font-medium text-sage-foreground/60 tracking-wider uppercase mb-4">
                {insight.regionLabel}
              </span>
              <p className="text-[18px] font-serif text-foreground/70 leading-[2] italic">
                {insight.body}
              </p>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Narrative summary — replaces tabular type counts */}
      {narrativeSummary && (
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <p className="text-[13px] text-muted-foreground/50 leading-relaxed max-w-sm mx-auto">
            {narrativeSummary}
          </p>
        </motion.div>
      )}

      {/* ── Magic Moment with Timeline Animation ── */}
      {showMagicMoment && (
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6 }}
        >
          <div className="rounded-2xl p-6 bg-lavender/8 border border-lavender/12 overflow-hidden">
            <p className="text-[10.5px] font-medium text-muted-foreground/50 uppercase tracking-[0.18em] mb-4">
              Your body at a glance
            </p>

            {/* Animated body silhouette */}
            <div className="flex justify-center mb-4">
              <svg viewBox="10 0 80 100" className="w-24 h-36" aria-label="Body overview — regions illuminate as your story unfolds">
                <path d={miniSilhouettePath} fill="hsl(var(--body-fill))" stroke="hsl(var(--body-stroke))" strokeWidth="0.5" />
                {Object.entries(storyRegionPositions).map(([region, pos]) => {
                  if (!revealedRegions.has(region as BodyRegion)) return null;
                  const isNew = currentAnimPhase?.regions.includes(region as BodyRegion) && !animationComplete;
                  const isChipHighlighted = highlightedStoryRegion === region;
                  return (
                    <motion.circle
                      key={region}
                      cx={pos.cx}
                      cy={pos.cy}
                      r={isChipHighlighted ? 5 : isNew ? 4 : 3}
                      fill={isChipHighlighted ? "hsl(var(--sage) / 0.7)" : isNew ? "hsl(var(--primary) / 0.5)" : "hsl(var(--primary) / 0.35)"}
                      stroke={isChipHighlighted ? "hsl(var(--sage) / 0.3)" : isNew ? "hsl(var(--primary) / 0.2)" : "hsl(var(--primary) / 0.12)"}
                      strokeWidth={isChipHighlighted ? 5 : isNew ? 4 : 3}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="animate-breathe"
                    />
                  );
                })}
              </svg>
            </div>

            {/* Animation year indicator */}
            {!animationComplete && currentAnimPhase && (
              <motion.div
                className="text-center mb-3"
                key={animationPhase}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-[18px] font-serif text-foreground/70">{currentAnimPhase.year}</p>
                <p className="text-[11px] text-muted-foreground/45 mt-0.5 truncate max-w-[240px] mx-auto">
                  {currentAnimPhase.event.title}
                </p>
              </motion.div>
            )}

            {/* Post-animation summary */}
            <AnimatePresence>
              {animationComplete && (
                <motion.div
                  className="text-center space-y-2"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <p className="text-[15px] font-serif text-foreground/80">
                    {visibleEvents.length} recorded experiences across {activeRegions.size} areas
                  </p>
                  <p className="text-[12px] text-muted-foreground/50 leading-relaxed">
                    Spanning {span} · from what you've mapped so far
                  </p>

                  {visibleInsights.length > 0 && (
                    <motion.div
                      className="mt-4 pt-4 border-t border-lavender/15"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <span className="inline-block px-2 py-0.5 rounded-full bg-sage/15 text-[9px] font-medium text-sage-foreground/50 tracking-wider uppercase mb-2">
                        {visibleInsights[0].regionLabel}
                      </span>
                      <p className="text-[13px] text-foreground/65 leading-[1.8] italic font-serif">
                        {visibleInsights[0].body}
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Skip animation button */}
            {!animationComplete && (
              <div className="text-center mt-2">
                <button
                  onClick={() => { setAnimationComplete(true); setAnimationPhase(timelinePhases.length); }}
                  className="text-[10px] text-muted-foreground/35 hover:text-muted-foreground/55 transition-colors"
                >
                  Skip animation
                </button>
              </div>
            )}
          </div>
        </motion.section>
      )}

      {/* 1. Body Map Overview with tappable region chips */}
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
        <p className="section-label mb-3">Body map overview</p>
        {topRegions.length > 0 ? (
          <div className="rounded-2xl p-5 bg-card border border-border/20" style={{ boxShadow: "var(--shadow-xs)" }}>
            <div className="flex flex-wrap gap-2 mb-4">
              {topRegions.map(([region, count]) => (
                <button
                  key={region}
                  onClick={() => setHighlightedStoryRegion(highlightedStoryRegion === region ? null : region)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] border transition-all duration-300 ${
                    highlightedStoryRegion === region
                      ? "bg-sage/20 border-sage/30 text-foreground/80"
                      : "bg-secondary/50 text-foreground/65 border-border/15 hover:bg-secondary/70"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full transition-colors duration-300 ${highlightedStoryRegion === region ? "bg-sage/80" : "bg-sage/60"}`} />
                  {REGION_LABELS[region as keyof typeof REGION_LABELS]}
                  <span className="text-muted-foreground/30 ml-0.5">· {count}</span>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground/35 leading-relaxed">
              {topRegions.length} areas appear in your record so far. The regions above are those you've recorded most.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl p-6 bg-card border border-border/20 text-center">
            <p className="text-[13px] text-muted-foreground/40">No body regions recorded yet.</p>
          </div>
        )}
      </motion.section>

      {/* 2. Timeline of Experiences */}
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}>
        <p className="section-label mb-3">Timeline of experiences</p>
        <div className="rounded-2xl p-5 bg-warm/12 border border-warm/15">
          <div className="flex items-baseline gap-3 mb-4">
            <p className="text-[22px] font-serif text-foreground/85">{span}</p>
            <p className="text-[12px] text-muted-foreground/45">
              {visibleEvents.length} events · {years.length} {years.length === 1 ? "year" : "years"}
            </p>
          </div>
          {lifeClusters.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1" style={{ scrollbarWidth: "none" }}>
              {lifeClusters.map((cluster) => (
                <div key={cluster.label} className="flex-shrink-0 rounded-xl p-3 bg-card/60 border border-border/15 min-w-[120px]">
                  <p className="text-[11px] font-medium text-foreground/65">{cluster.label}</p>
                  <p className="text-[10px] text-muted-foreground/35 mt-0.5">{cluster.count} events</p>
                  <div className="flex gap-1 mt-2">
                    {cluster.types.slice(0, 4).map((t) => (
                      <div key={t} className={`w-1.5 h-1.5 rounded-full ${typeDotColors[t]}`} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Narrative summary replaces the tabular breakdown */}
          {narrativeSummary && (
            <div className="mt-4 pt-3 border-t border-warm/15">
              <p className="text-[12px] text-foreground/55 leading-relaxed italic font-serif">
                {narrativeSummary}
              </p>
            </div>
          )}
        </div>
      </motion.section>

      {/* 3. Body Threads */}
      <BodyThreads />

      {/* 4. Patterns Worth Noticing */}
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }}>
        <p className="section-label mb-3">Patterns worth noticing</p>
        {visibleInsights.length > 0 ? (
          <div className="space-y-3">
            {visibleInsights.map((insight, idx) => {
              const isSaved = savedPatterns.includes(insight.id);
              const isActive = state.activeInsightId === insight.id;
              return (
                <motion.div
                  key={insight.id}
                  className={`rounded-2xl p-5 border relative cursor-pointer transition-all duration-300 ${
                    toneStyles[insight.tone] || ""
                  } ${isActive ? "ring-2 ring-primary/20 shadow-md" : ""}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 + idx * 0.1, duration: 0.4 }}
                  onClick={() => highlightInsight(insight.id, insight.relatedRegions, insight.relatedEventIds)}
                >
                  <p className="text-[15px] font-serif text-foreground/80 mb-1.5">{insight.title}</p>
                  <p className="text-[13px] text-muted-foreground/55 leading-[1.8] mb-3">{insight.body}</p>

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
                        · {insight.relatedEventIds.length} events
                      </span>
                    </motion.div>
                  )}

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setSavedPatterns((p) => isSaved ? p.filter((x) => x !== insight.id) : [...p, insight.id])}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all duration-200 ${
                        isSaved ? "bg-primary/10 text-primary/70" : "bg-secondary/50 text-muted-foreground/45 hover:text-muted-foreground/65"
                      }`}
                    >
                      <Bookmark className="w-3 h-3" />
                      {isSaved ? "Saved" : "Save"}
                    </button>
                    <button
                      onClick={() => setDismissedPatterns((p) => [...p, insight.id])}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium bg-secondary/50 text-muted-foreground/45 hover:text-muted-foreground/65 transition-all duration-200"
                    >
                      <XIcon className="w-3 h-3" />
                      Dismiss
                    </button>
                    <button
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium bg-secondary/50 text-muted-foreground/45 hover:text-muted-foreground/65 transition-all duration-200"
                    >
                      <BookOpen className="w-3 h-3" />
                      Learn more
                    </button>
                  </div>
                </motion.div>
              );
            })}
            <p className="text-[10px] text-muted-foreground/28 leading-relaxed">
              Based on what you've recorded so far. This is a reflection, not a medical assessment.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl p-5 bg-sage/8 border border-sage/12 text-center">
            <p className="text-[13px] text-muted-foreground/45">
              {allInsights.length > 0 ? "All patterns dismissed." : "As you record more experiences, patterns may emerge here."}
            </p>
          </div>
        )}
      </motion.section>

      {/* 5. Treatments Explored */}
      {treatments.length > 0 && (
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.5 }}>
          <p className="section-label mb-3">Treatments explored</p>
          <div className="rounded-2xl p-5 bg-sage/8 border border-sage/12">
            <div className="space-y-3">
              {treatments.map((t) => (
                <div
                  key={t.id}
                  className={`flex items-start gap-3 p-2 -mx-2 rounded-xl transition-all duration-300 ${
                    state.highlightedEventIds.includes(t.id) ? "bg-primary/8 ring-1 ring-primary/15" : ""
                  }`}
                >
                  <div className="w-2 h-2 rounded-full bg-body-healing mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-[13px] font-medium text-foreground/70">{t.title}</p>
                    <p className="text-[11px] text-muted-foreground/40 mt-0.5">
                      {new Date(t.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                      {t.ongoing && <span className="ml-1.5 text-sage-foreground/50">· ongoing</span>}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* 6. Reflection */}
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.5 }}>
        <p className="section-label mb-2">Personal reflection</p>
        <p className="text-[11px] text-muted-foreground/40 mb-3 leading-relaxed">
          An optional space for your own thoughts. This stays private.
        </p>
        <textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="What do you notice looking back at your body story?"
          rows={3}
          className="field-input resize-none"
        />
      </motion.section>

      {/* Privacy notice — small, at the bottom, dismissible */}
      <AnimatePresence>
        {!privacyDismissed && (
          <motion.div
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-sage/8 border border-sage/12 w-fit mx-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            <Lock className="w-3 h-3 text-sage-foreground/35" />
            <span className="text-[10px] text-muted-foreground/45">Your body story is private</span>
            <button
              onClick={() => { setPrivacyDismissed(true); try { localStorage.setItem("body-story-privacy-seen", "true"); } catch {} }}
              className="ml-1 p-0.5 rounded-full hover:bg-secondary/40 transition-colors"
            >
              <XIcon className="w-2.5 h-2.5 text-muted-foreground/25" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Calm reflection message */}
      <motion.div
        className="rounded-2xl p-6 bg-lavender/8 border border-lavender/12 text-center"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <p className="text-[15px] font-serif text-foreground/80 mb-1.5">You've been paying attention</p>
        <p className="text-[12px] text-muted-foreground/45 leading-[1.8]">
          This record reflects care and self-awareness, based on what you've chosen to share so far.
        </p>
      </motion.div>

      {/* Create summary CTA */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}>
        <button onClick={onCreateSummary} className="btn-primary flex items-center justify-center gap-2">
          <FileText className="w-4 h-4" />
          Create Body Story Summary
        </button>
        <p className="text-[10px] text-muted-foreground/28 text-center mt-3">
          Your body story belongs to you. Nothing is shared unless you choose to share it.
        </p>
      </motion.div>
    </div>
  );
};

export default BodyStoryView;
