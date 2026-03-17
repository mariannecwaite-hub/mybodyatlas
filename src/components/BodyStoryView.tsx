import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp, REGION_LABELS, EventType, BodyRegion, BodyEvent } from "@/context/AppContext";
import { usePatternEngine } from "@/hooks/usePatternEngine";
import { useBodyThreads } from "@/hooks/useBodyThreads";
import BodyThreads from "@/components/BodyThreads";
import { Lock, FileText, Bookmark, X as XIcon, BookOpen, PenLine } from "lucide-react";
import { BodySilhouetteFigure } from "@/components/BodySilhouette";

const typeDotColors: Record<EventType, string> = {
  injury: "bg-body-pain",
  symptom: "bg-body-tension",
  stress: "bg-body-tension",
  treatment: "bg-body-healing",
  "life-event": "bg-body-neutral",
  "safety-experience": "bg-body-neutral",
};

const storyRegionPositions: Record<string, { cx: number; cy: number }> = {
  head_jaw: { cx: 50, cy: 10 }, neck: { cx: 50, cy: 18 },
  shoulder_left: { cx: 35, cy: 24 }, shoulder_right: { cx: 65, cy: 24 },
  chest: { cx: 50, cy: 32 }, upper_back: { cx: 50, cy: 32 },
  abdomen: { cx: 50, cy: 45 }, lower_back: { cx: 50, cy: 45 },
  wrist_hand_left: { cx: 22, cy: 48 }, wrist_hand_right: { cx: 78, cy: 48 },
  hip_left: { cx: 42, cy: 56 }, hip_right: { cx: 58, cy: 56 },
  knee_left: { cx: 42, cy: 72 }, knee_right: { cx: 58, cy: 72 },
  ankle_foot_left: { cx: 42, cy: 88 }, ankle_foot_right: { cx: 58, cy: 88 },
};

interface BodyStoryViewProps {
  onCreateSummary: () => void;
  onOpenCollective?: () => void;
}

/** Splits events into early / middle / recent chapters */
function buildChapters(events: BodyEvent[], birthYear?: number) {
  const sorted = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  if (sorted.length === 0) return { early: [], middle: [], recent: [] };

  const now = new Date();
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

  // Recent = last 12 months
  const recent = sorted.filter((e) => new Date(e.date) >= oneYearAgo);
  const remaining = sorted.filter((e) => new Date(e.date) < oneYearAgo);

  // If birthYear, early = before 25; else earliest 20%
  let early: BodyEvent[];
  let middle: BodyEvent[];

  if (birthYear && birthYear > 1900) {
    const cutoffYear = birthYear + 25;
    early = remaining.filter((e) => new Date(e.date).getFullYear() < cutoffYear);
    middle = remaining.filter((e) => new Date(e.date).getFullYear() >= cutoffYear);
  } else {
    const cutoff = Math.max(1, Math.ceil(remaining.length * 0.2));
    early = remaining.slice(0, cutoff);
    middle = remaining.slice(cutoff);
  }

  return { early, middle, recent };
}

const BodyStoryView = ({ onCreateSummary }: BodyStoryViewProps) => {
  const { visibleEvents, state, highlightInsight, currentProfile } = useApp();
  const [dismissedPatterns, setDismissedPatterns] = useState<string[]>([]);
  const [savedPatterns, setSavedPatterns] = useState<string[]>([]);
  const [reflection, setReflection] = useState("");
  const [highlightedStoryRegion, setHighlightedStoryRegion] = useState<string | null>(null);
  const [insightNotes, setInsightNotes] = useState<Record<string, string>>({});
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [privacyDismissed, setPrivacyDismissed] = useState(() => {
    try { return localStorage.getItem("body-story-privacy-seen") === "true"; } catch { return false; }
  });
  const threads = useBodyThreads(visibleEvents);

  const activeRegions = new Set(visibleEvents.flatMap((e) => e.regions));
  const treatments = visibleEvents.filter((e) => e.type === "treatment");
  const years = [...new Set(visibleEvents.map((e) => new Date(e.date).getFullYear()))].sort();
  const span = years.length > 1 ? `${years[0]}–${years[years.length - 1]}` : years[0]?.toString() || "—";

  const topRegions = Object.entries(
    visibleEvents.flatMap((e) => e.regions).reduce((acc, r) => {
      acc[r] = (acc[r] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).sort((a, b) => b[1] - a[1]).slice(0, 6);

  // Pattern engine
  const allInsights = usePatternEngine(visibleEvents, { maxResults: 5 + dismissedPatterns.length });
  const visibleInsights = allInsights
    .filter((p) => !dismissedPatterns.includes(p.id))
    .slice(0, 3);

  const toneStyles: Record<string, string> = {
    sage: "bg-sage/12 border-sage/18",
    lavender: "bg-lavender/12 border-lavender/18",
    warm: "bg-warm/15 border-warm/18",
  };

  // Chapters
  const chapters = useMemo(
    () => buildChapters(visibleEvents, currentProfile?.birthYear),
    [visibleEvents, currentProfile?.birthYear]
  );

  // Chapter observations
  const earlyObservation = useMemo(() => {
    if (chapters.early.length === 0) return null;
    const regions = [...new Set(chapters.early.flatMap((e) => e.regions))];
    const regionNames = regions.slice(0, 2).map((r) => REGION_LABELS[r as BodyRegion]?.toLowerCase()).filter(Boolean);
    const firstEvt = chapters.early[0];
    const firstYear = new Date(firstEvt.date).getFullYear();
    return `Your earliest recorded experience — "${firstEvt.title.toLowerCase()}" in ${firstYear}${regionNames.length > 0 ? ` — began in your ${regionNames.join(" and ")}` : ""}. This is where your story starts, based on what you've mapped so far.`;
  }, [chapters.early]);

  const middleObservation = useMemo(() => {
    if (chapters.middle.length === 0) return null;
    // Find most recurring region
    const regionCounts: Record<string, number> = {};
    chapters.middle.forEach((e) => e.regions.forEach((r) => { regionCounts[r] = (regionCounts[r] || 0) + 1; }));
    const topRegion = Object.entries(regionCounts).sort((a, b) => b[1] - a[1])[0];
    if (!topRegion) return `${chapters.middle.length} experiences accumulated during this period.`;
    const label = REGION_LABELS[topRegion[0] as BodyRegion]?.toLowerCase() || topRegion[0];
    return `Across this period, your ${label} appears most — with ${topRegion[1]} recorded experiences. Your body has been saying something here for a while.`;
  }, [chapters.middle]);

  const recentObservation = useMemo(() => {
    if (chapters.recent.length === 0) return null;
    const ongoing = chapters.recent.filter((e) => e.ongoing);
    if (ongoing.length > 0) {
      return `"${ongoing[0].title}" is still present. ${ongoing.length > 1 ? `Along with ${ongoing.length - 1} other ongoing experience${ongoing.length > 2 ? "s" : ""}.` : ""} Based on what you've recorded so far.`;
    }
    return `${chapters.recent.length} experience${chapters.recent.length > 1 ? "s" : ""} in the last 12 months. Based on what you've recorded so far.`;
  }, [chapters.recent]);

  const ChapterHeader = ({ label }: { label: string }) => (
    <p className="text-[10px] font-medium text-muted-foreground/40 uppercase tracking-[0.2em] mb-4">
      {label}
    </p>
  );

  const EventCard = ({ event, delay }: { event: BodyEvent; delay: number }) => (
    <motion.div
      className="flex items-start gap-3 py-2"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${typeDotColors[event.type]}`} />
      <div>
        <p className="text-[13px] font-medium text-foreground/70">{event.title}</p>
        <p className="text-[11px] text-muted-foreground/40 mt-0.5">
          {new Date(event.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
          {event.ongoing && <span className="ml-1.5 text-sage-foreground/50">· ongoing</span>}
        </p>
      </div>
    </motion.div>
  );

  return (
    <div className="pt-8 pb-12 space-y-10" role="region" aria-label="Your Body Story">
      {/* Philosophical framing */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
        <p className="text-[18px] font-serif italic text-center leading-[1.8] max-w-[295px] mx-auto mb-8" style={{ color: "#6B6960" }}>
          Your body has been responding to your life — to what has happened, what has been felt, and what has been carried. This is what it has recorded.
        </p>
        <h2 className="text-[30px] font-serif text-foreground/90 leading-tight text-center">Your Body Story</h2>
        <p className="text-[13px] text-muted-foreground/45 mt-2 text-center leading-relaxed italic font-serif">
          For many people, this is the first time their body history has been held in one place.
        </p>
      </motion.div>

      {/* Hero insights — personal, specific observations */}
      {visibleInsights.length > 0 && (
        <motion.div
          className="py-4 px-4 max-w-md mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          {visibleInsights.slice(0, 2).map((insight, i) => (
            <motion.div
              key={insight.id}
              className="text-center"
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

      {/* ═══ CHAPTER 1: Where Your Story Begins ═══ */}
      {chapters.early.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <ChapterHeader label="Chapter 1 — Where your story begins" />
          <div className="rounded-2xl p-5 bg-warm/12 border border-warm/15">
            <div className="space-y-1">
              {chapters.early.slice(0, 3).map((e, i) => (
                <EventCard key={e.id} event={e} delay={0.25 + i * 0.08} />
              ))}
            </div>
            {earlyObservation && (
              <motion.p
                className="text-[12px] text-foreground/55 leading-relaxed italic font-serif mt-4 pt-3 border-t border-warm/15"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {earlyObservation}
              </motion.p>
            )}
          </div>
        </motion.section>
      )}

      {/* ═══ CHAPTER 2: What Built Across Time ═══ */}
      {chapters.middle.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <ChapterHeader label="Chapter 2 — What built across time" />
          <div className="rounded-2xl p-5 bg-lavender/8 border border-lavender/12">
            <p className="text-[22px] font-serif text-foreground/80 mb-1">
              {chapters.middle.length} experiences
            </p>
            <p className="text-[12px] text-muted-foreground/45 mb-4">
              across the middle years of your record
            </p>
            <div className="space-y-1 max-h-[200px] overflow-y-auto" style={{ scrollbarWidth: "none" }}>
              {chapters.middle.slice(0, 6).map((e, i) => (
                <EventCard key={e.id} event={e} delay={0.35 + i * 0.06} />
              ))}
              {chapters.middle.length > 6 && (
                <p className="text-[10px] text-muted-foreground/30 pt-2">
                  + {chapters.middle.length - 6} more recorded
                </p>
              )}
            </div>
            {middleObservation && (
              <motion.p
                className="text-[12px] text-foreground/55 leading-relaxed italic font-serif mt-4 pt-3 border-t border-lavender/15"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                {middleObservation}
              </motion.p>
            )}
          </div>
        </motion.section>
      )}

      {/* ═══ CHAPTER 3: Your Body Right Now ═══ */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <ChapterHeader label="Chapter 3 — Your body right now" />
        <div className="rounded-2xl p-5 bg-sage/8 border border-sage/12">
          {chapters.recent.length > 0 ? (
            <>
              <div className="space-y-1">
                {chapters.recent.slice(0, 4).map((e, i) => (
                  <EventCard key={e.id} event={e} delay={0.45 + i * 0.08} />
                ))}
              </div>
              {recentObservation && (
                <motion.p
                  className="text-[12px] text-foreground/55 leading-relaxed italic font-serif mt-4 pt-3 border-t border-sage/15"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  {recentObservation}
                </motion.p>
              )}
            </>
          ) : (
            <p className="text-[13px] text-muted-foreground/45 text-center py-4">
              Nothing recorded in the last 12 months.
            </p>
          )}
        </div>
      </motion.section>

      {/* Closing line */}
      <motion.div
        className="text-center py-10"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <p className="text-[20px] font-serif italic leading-[1.8] max-w-sm mx-auto" style={{ color: "#2A2A28" }}>
          None of this is malfunction. Your body has been doing exactly what bodies do — responding, adapting, remembering. The question is never what is wrong with your body. It is what your body has been trying to say.
        </p>
      </motion.div>

      {/* Body Map Overview */}
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}>
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

      {/* Body Threads */}
      <BodyThreads />

      {/* Patterns Worth Noticing — with reflective questions */}
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }}>
        <p className="section-label mb-3">Patterns worth noticing</p>
        {visibleInsights.length > 0 ? (
          <div className="space-y-3">
            {visibleInsights.map((insight, idx) => {
              const isSaved = savedPatterns.includes(insight.id);
              const isActive = state.activeInsightId === insight.id;
              const isEditingThis = editingNote === insight.id;
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

                  {/* Reflective question */}
                  {insight.reflectiveQuestion && (
                    <div className="border-t border-border/15 pt-3 mb-3" onClick={(e) => e.stopPropagation()}>
                      <p className="text-[12px] text-muted-foreground/40 italic leading-relaxed">
                        {insight.reflectiveQuestion}
                      </p>
                      {!isEditingThis && !insightNotes[insight.id] && (
                        <button
                          onClick={() => setEditingNote(insight.id)}
                          className="inline-flex items-center gap-1.5 mt-2 text-[11px] text-primary/50 hover:text-primary/70 transition-colors"
                        >
                          <PenLine className="w-3 h-3" />
                          Add a note
                        </button>
                      )}
                      {insightNotes[insight.id] && !isEditingThis && (
                        <div className="mt-2 p-2.5 rounded-lg bg-secondary/40">
                          <p className="text-[12px] text-foreground/60 leading-relaxed">{insightNotes[insight.id]}</p>
                          <button
                            onClick={() => setEditingNote(insight.id)}
                            className="text-[10px] text-primary/40 hover:text-primary/60 mt-1 transition-colors"
                          >
                            Edit note
                          </button>
                        </div>
                      )}
                      <AnimatePresence>
                        {isEditingThis && (
                          <motion.div
                            className="mt-2 space-y-2"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            <textarea
                              value={insightNotes[insight.id] || ""}
                              onChange={(e) => setInsightNotes((n) => ({ ...n, [insight.id]: e.target.value }))}
                              placeholder="Your private reflection…"
                              rows={2}
                              className="field-input resize-none text-[12px]"
                              autoFocus
                            />
                            <button
                              onClick={() => setEditingNote(null)}
                              className="text-[11px] px-3 py-1.5 rounded-full bg-primary/10 text-primary/60 font-medium"
                            >
                              Save note
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

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
              As you record more experiences, patterns may emerge here.
            </p>
          </div>
        )}
      </motion.section>

      {/* Treatments explored */}
      {treatments.length > 0 && (
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.5 }}>
          <p className="section-label mb-3">Treatments explored</p>
          <div className="rounded-2xl p-5 bg-sage/8 border border-sage/12">
            {(() => {
              const withOutcome = treatments.filter((t) => t.treatmentOutcome && t.treatmentOutcome !== "not-sure");
              const helped = treatments.filter((t) => t.treatmentOutcome === "helped").length;
              if (withOutcome.length > 0) {
                return (
                  <div className="mb-4 pb-3 border-b border-sage/15">
                    <p className="text-[13px] text-foreground/65 leading-relaxed italic font-serif">
                      Of the {treatments.length} treatment{treatments.length > 1 ? "s" : ""} you've explored
                      {helped > 0 ? `, ${helped} appear${helped === 1 ? "s" : ""} to have helped` : ""}
                      {helped > 0 && withOutcome.length > helped ? ` — based on what you've recorded so far` : ""}.
                    </p>
                  </div>
                );
              }
              return null;
            })()}
            <div className="space-y-3">
              {treatments.map((t) => (
                <div key={t.id} className="flex items-start gap-3 p-2 -mx-2 rounded-xl">
                  <div className="w-2 h-2 rounded-full bg-body-healing mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-[13px] font-medium text-foreground/70">{t.title}</p>
                    <p className="text-[11px] text-muted-foreground/40 mt-0.5">
                      {new Date(t.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                      {t.ongoing && <span className="ml-1.5 text-sage-foreground/50">· ongoing</span>}
                      {t.treatmentOutcome && t.treatmentOutcome !== "not-sure" && (
                        <span className={`ml-1.5 ${
                          t.treatmentOutcome === "helped" ? "text-sage-foreground/55" :
                          t.treatmentOutcome === "worse" ? "text-body-pain/60" :
                          "text-muted-foreground/35"
                        }`}>
                          · {t.treatmentOutcome === "helped" ? "Helped" : t.treatmentOutcome === "no-change" ? "No change" : "Made things worse"}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* Personal reflection */}
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

      {/* Privacy notice */}
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
