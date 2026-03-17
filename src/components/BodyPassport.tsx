import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp, REGION_LABELS, EventType, BodyRegion } from "@/context/AppContext";
import { usePatternEngine } from "@/hooks/usePatternEngine";
import { useBodyThreads } from "@/hooks/useBodyThreads";
import { X, MapPin, Clock, Lightbulb, Heart, ChevronDown, ChevronUp } from "lucide-react";
import { miniSilhouettePath } from "@/components/BodySilhouette";

interface BodyPassportProps {
  open: boolean;
  onClose: () => void;
}

/* ─── Body silhouette region positions ─── */
const regionPos: Record<string, { cx: number; cy: number }> = {
  head_jaw: { cx: 50, cy: 10 }, neck: { cx: 50, cy: 18 },
  shoulder_left: { cx: 33, cy: 24 }, shoulder_right: { cx: 67, cy: 24 },
  chest: { cx: 50, cy: 32 }, upper_back: { cx: 50, cy: 32 },
  abdomen: { cx: 50, cy: 45 }, lower_back: { cx: 50, cy: 45 },
  wrist_hand_left: { cx: 22, cy: 48 }, wrist_hand_right: { cx: 78, cy: 48 },
  hip_left: { cx: 42, cy: 56 }, hip_right: { cx: 58, cy: 56 },
  knee_left: { cx: 42, cy: 72 }, knee_right: { cx: 58, cy: 72 },
  ankle_foot_left: { cx: 42, cy: 88 }, ankle_foot_right: { cx: 58, cy: 88 },
};

const typeColor: Record<EventType, string> = {
  injury: "var(--body-pain)",
  symptom: "var(--body-tension)",
  stress: "var(--body-tension)",
  treatment: "var(--body-healing)",
  "life-event": "var(--body-neutral)",
};

const typeDotClass: Record<EventType, string> = {
  injury: "bg-body-pain",
  symptom: "bg-body-tension",
  stress: "bg-body-tension",
  treatment: "bg-body-healing",
  "life-event": "bg-body-neutral",
};

const typeLabel: Record<EventType, string> = {
  injury: "Injury", symptom: "Sensation", stress: "Stress period",
  treatment: "Treatment", "life-event": "Life transition",
};

type Section = "map" | "timeline" | "patterns" | "care";

const sectionMeta: { id: Section; label: string; icon: typeof MapPin; color: string }[] = [
  { id: "map", label: "Body Map Overview", icon: MapPin, color: "sage" },
  { id: "timeline", label: "Timeline of Experiences", icon: Clock, color: "warm" },
  { id: "patterns", label: "Patterns Worth Noticing", icon: Lightbulb, color: "lavender" },
  { id: "care", label: "Care Journey", icon: Heart, color: "sage" },
];

const BodyPassport = ({ open, onClose }: BodyPassportProps) => {
  const { visibleEvents, currentProfile } = useApp();
  const threads = useBodyThreads(visibleEvents);
  const insights = usePatternEngine(visibleEvents, { maxResults: 6 });
  const [expandedSections, setExpandedSections] = useState<Set<Section>>(
    new Set(["map", "timeline", "patterns", "care"])
  );

  const toggleSection = (s: Section) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s); else next.add(s);
      return next;
    });
  };

  // ── Computed data ──
  const allRegions = [...new Set(visibleEvents.flatMap((e) => e.regions))];
  const regionCounts = visibleEvents.flatMap((e) => e.regions).reduce((acc, r) => {
    acc[r] = (acc[r] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topRegions = Object.entries(regionCounts)
    .sort(([, a], [, b]) => b - a);

  const years = [...new Set(visibleEvents.map((e) => new Date(e.date).getFullYear()))].sort();
  const span = years.length > 1 ? `${years[0]}–${years[years.length - 1]}` : years[0]?.toString() || "—";

  const sortedEvents = [...visibleEvents].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Group by year
  const eventsByYear = sortedEvents.reduce((acc, e) => {
    const y = new Date(e.date).getFullYear();
    if (!acc[y]) acc[y] = [];
    acc[y].push(e);
    return acc;
  }, {} as Record<number, typeof sortedEvents>);

  const treatments = visibleEvents.filter((e) => e.type === "treatment");
  const ongoingTreatments = treatments.filter((e) => e.ongoing);
  const pastTreatments = treatments.filter((e) => !e.ongoing);

  const ongoingCount = visibleEvents.filter((e) => e.ongoing).length;

  // Pattern observations
  const patternObservations: string[] = [];
  const lowerBodyRegions: BodyRegion[] = ["knee_left", "knee_right", "ankle_foot_left", "ankle_foot_right", "hip_left", "hip_right", "lower_back"];
  const upperBodyRegions: BodyRegion[] = ["neck", "shoulder_left", "shoulder_right", "upper_back", "head_jaw"];
  const lowerBodyEvents = visibleEvents.filter((e) => e.regions.some((r) => lowerBodyRegions.includes(r)));
  const upperBodyEvents = visibleEvents.filter((e) => e.regions.some((r) => upperBodyRegions.includes(r)));
  const stressEvents = visibleEvents.filter((e) => e.type === "stress");
  const symptomEvents = visibleEvents.filter((e) => e.type === "symptom");

  if (lowerBodyEvents.length >= 2) {
    patternObservations.push("Several lower-body experiences appear across time. Earlier events may be worth exploring alongside current ones.");
  }
  if (upperBodyEvents.length >= 2 && stressEvents.length > 0) {
    patternObservations.push("Periods of stress appear to overlap with upper body tension — neck, shoulders and back.");
  }
  if (stressEvents.length > 0 && symptomEvents.length > 0) {
    patternObservations.push("Stress periods and physical sensations appear connected in your history.");
  }
  if (ongoingCount >= 3) {
    patternObservations.push(`You're currently navigating ${ongoingCount} ongoing experiences. This context may be valuable to share with a practitioner.`);
  }
  if (threads.length >= 2) {
    patternObservations.push(`${threads.length} body threads connect experiences across time — patterns that may be worth exploring.`);
  }
  if (treatments.length >= 2 && symptomEvents.length > 0) {
    patternObservations.push("You've explored multiple approaches to care. Understanding which ones helped most can guide future decisions.");
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
            className="modal-content max-w-lg"
            initial={{ y: 80, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", damping: 32, stiffness: 240, mass: 0.8 }}
          >
            {/* Header */}
            <div className="modal-header">
              <div>
                <h2 className="text-xl leading-tight">Body Passport</h2>
                <p className="text-[11px] text-muted-foreground/40 mt-1 tracking-wide">
                  A record of your body story across time
                </p>
              </div>
              <button onClick={onClose} className="modal-close">
                <X className="w-5 h-5 text-muted-foreground/50" />
              </button>
            </div>

            {/* Summary banner */}
            <motion.div
              className="rounded-2xl p-5 bg-sage/10 border border-sage/15 mb-6"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-[22px] font-serif text-foreground/80">{visibleEvents.length}</p>
                  <p className="text-[9px] text-muted-foreground/40 uppercase tracking-wider">Events</p>
                </div>
                <div className="w-px h-10 bg-border/25" />
                <div className="text-center">
                  <p className="text-[22px] font-serif text-foreground/80">{allRegions.length}</p>
                  <p className="text-[9px] text-muted-foreground/40 uppercase tracking-wider">Regions</p>
                </div>
                <div className="w-px h-10 bg-border/25" />
                <div className="text-center">
                  <p className="text-[22px] font-serif text-foreground/80">{span}</p>
                  <p className="text-[9px] text-muted-foreground/40 uppercase tracking-wider">Span</p>
                </div>
              </div>
              {ongoingCount > 0 && (
                <p className="text-[11px] text-sage-foreground/50 mt-3 text-center">
                  {ongoingCount} ongoing · {threads.length} {threads.length === 1 ? "thread" : "threads"} connecting experiences
                </p>
              )}
            </motion.div>

            {/* Sections */}
            <div className="space-y-3">
              {sectionMeta.map((section, si) => {
                const isExpanded = expandedSections.has(section.id);
                const Icon = section.icon;
                const bgClass = section.color === "sage" ? "bg-sage/8 border-sage/12"
                  : section.color === "warm" ? "bg-warm/10 border-warm/15"
                  : "bg-lavender/8 border-lavender/12";
                const iconClass = section.color === "sage" ? "text-sage-foreground/45"
                  : section.color === "warm" ? "text-warm-foreground/45"
                  : "text-lavender-foreground/45";

                return (
                  <motion.div
                    key={section.id}
                    className={`rounded-2xl border overflow-hidden ${bgClass}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + si * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {/* Section header — collapsible */}
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full flex items-center justify-between p-4 text-left group"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${iconClass}`} />
                        <span className="text-[13px] font-medium text-foreground/75">{section.label}</span>
                      </div>
                      {isExpanded
                        ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground/30" />
                        : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/30" />
                      }
                    </button>

                    {/* Section content */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 pt-0">

                            {/* ── 1. Body Map Overview ── */}
                            {section.id === "map" && (
                              <div className="space-y-4">
                                {/* Mini body silhouette */}
                                {allRegions.length > 0 && (
                                  <div className="flex justify-center">
                                  <div className="relative w-[120px] h-[170px]">
                                      <svg viewBox="10 0 80 100" className="w-full h-full opacity-15">
                                        <path d={miniSilhouettePath} fill="hsl(var(--foreground))" />
                                      </svg>
                                      {allRegions.map((regionId, i) => {
                                        const pos = regionPos[regionId];
                                        if (!pos) return null;
                                        const count = regionCounts[regionId] || 0;
                                        const evts = visibleEvents.filter((e) => e.regions.includes(regionId as BodyRegion));
                                        const primaryType = evts[0]?.type || "symptom";
                                        return (
                                          <motion.div
                                            key={regionId}
                                            className="absolute rounded-full"
                                            style={{
                                              left: `${pos.cx}%`,
                                              top: `${pos.cy}%`,
                                              width: Math.min(14, 8 + count * 2),
                                              height: Math.min(14, 8 + count * 2),
                                              backgroundColor: `hsl(${typeColor[primaryType]} / 0.55)`,
                                              transform: "translate(-50%, -50%)",
                                              boxShadow: `0 0 10px hsl(${typeColor[primaryType]} / 0.25)`,
                                            }}
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ delay: 0.1 + i * 0.05, duration: 0.5 }}
                                          />
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}

                                {/* Region list */}
                                <div className="space-y-1">
                                  {topRegions.map(([region, count], i) => (
                                    <motion.div
                                      key={region}
                                      className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-card/40 transition-colors duration-300"
                                      initial={{ opacity: 0, x: -6 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: 0.05 + i * 0.04, duration: 0.4 }}
                                    >
                                      <div className="flex items-center gap-2.5">
                                        <div
                                          className="w-2 h-2 rounded-full"
                                          style={{
                                            backgroundColor: `hsl(${typeColor[
                                              visibleEvents.find((e) => e.regions.includes(region as BodyRegion))?.type || "symptom"
                                            ]} / 0.6)`,
                                          }}
                                        />
                                        <span className="text-[12px] text-foreground/65">
                                          {REGION_LABELS[region as BodyRegion]}
                                        </span>
                                      </div>
                                      <span className="text-[11px] text-muted-foreground/35">
                                        {count} {count === 1 ? "event" : "events"}
                                      </span>
                                    </motion.div>
                                  ))}
                                </div>

                                {allRegions.length === 0 && (
                                  <p className="text-[12px] text-muted-foreground/40 text-center py-4">
                                    No body regions recorded yet.
                                  </p>
                                )}
                              </div>
                            )}

                            {/* ── 2. Timeline ── */}
                            {section.id === "timeline" && (
                              <div className="space-y-4">
                                {years.map((year, yi) => {
                                  const yearEvents = eventsByYear[year] || [];
                                  return (
                                    <motion.div
                                      key={year}
                                      initial={{ opacity: 0, y: 8 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: yi * 0.05, duration: 0.4 }}
                                    >
                                      <div className="flex items-center gap-2 mb-2">
                                        <span className="text-[12px] font-medium text-foreground/60">{year}</span>
                                        <div className="h-px flex-1 bg-border/20" />
                                      </div>
                                      <div className="space-y-1 pl-3 border-l border-border/20">
                                        {yearEvents.map((event, ei) => (
                                          <motion.div
                                            key={event.id}
                                            className="flex items-start gap-2.5 py-1.5"
                                            initial={{ opacity: 0, x: -4 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: yi * 0.05 + ei * 0.03, duration: 0.35 }}
                                          >
                                            <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-0.5 ${typeDotClass[event.type]}`} />
                                            <div className="min-w-0">
                                              <p className="text-[12px] text-foreground/70 leading-snug truncate">{event.title}</p>
                                              <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] text-muted-foreground/30">
                                                  {typeLabel[event.type]}
                                                </span>
                                                {event.ongoing && (
                                                  <span className="inline-flex items-center gap-1">
                                                    <span className="w-1 h-1 rounded-full bg-sage-foreground/30 animate-soft-pulse" />
                                                    <span className="text-[10px] text-sage-foreground/40">ongoing</span>
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          </motion.div>
                                        ))}
                                      </div>
                                    </motion.div>
                                  );
                                })}

                                {sortedEvents.length === 0 && (
                                  <p className="text-[12px] text-muted-foreground/40 text-center py-4">
                                    No events recorded yet.
                                  </p>
                                )}
                              </div>
                            )}

                            {/* ── 3. Patterns Worth Noticing ── */}
                            {section.id === "patterns" && (
                              <div className="space-y-3">
                                {patternObservations.length > 0 ? (
                                  patternObservations.map((obs, i) => (
                                    <motion.div
                                      key={i}
                                      className="rounded-xl p-3.5 bg-card/50 border border-border/15"
                                      initial={{ opacity: 0, y: 6 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: i * 0.08, duration: 0.45 }}
                                    >
                                      <p className="text-[12px] text-foreground/60 leading-[1.8] italic">
                                        "{obs}"
                                      </p>
                                    </motion.div>
                                  ))
                                ) : (
                                  <p className="text-[12px] text-muted-foreground/40 text-center py-4">
                                    Add more events to discover patterns in your body story.
                                  </p>
                                )}

                                {/* Threads summary */}
                                {threads.length > 0 && (
                                  <div className="pt-2">
                                    <p className="text-[10px] text-muted-foreground/35 uppercase tracking-wider font-medium mb-2">
                                      Body threads
                                    </p>
                                    <div className="space-y-1.5">
                                      {threads.slice(0, 4).map((thread, i) => (
                                        <motion.div
                                          key={thread.id}
                                          className="flex items-center gap-3 py-1.5 px-3 rounded-xl bg-card/30"
                                          initial={{ opacity: 0, x: -4 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          transition={{ delay: 0.2 + i * 0.05, duration: 0.35 }}
                                        >
                                          <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
                                            <div className="w-1 h-1 rounded-full bg-lavender-foreground/30" />
                                            <div className="w-px h-2 bg-border/20" />
                                            <div className="w-1 h-1 rounded-full bg-lavender-foreground/20" />
                                          </div>
                                          <div className="min-w-0">
                                            <p className="text-[12px] font-medium text-foreground/60 truncate">{thread.label}</p>
                                            <p className="text-[10px] text-muted-foreground/30">
                                              {thread.eventCount} events · {thread.yearSpan}
                                            </p>
                                          </div>
                                        </motion.div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                <p className="text-[10px] text-muted-foreground/25 text-center pt-1">
                                  Observations only — not medical advice
                                </p>
                              </div>
                            )}

                            {/* ── 4. Care Journey ── */}
                            {section.id === "care" && (
                              <div className="space-y-4">
                                {treatments.length > 0 ? (
                                  <>
                                    {ongoingTreatments.length > 0 && (
                                      <div>
                                        <p className="text-[10px] text-sage-foreground/45 uppercase tracking-wider font-medium mb-2">
                                          Currently exploring
                                        </p>
                                        <div className="space-y-1.5">
                                          {ongoingTreatments.map((t, i) => (
                                            <motion.div
                                              key={t.id}
                                              className="flex items-center gap-3 py-2 px-3 rounded-xl bg-card/40 border border-border/10"
                                              initial={{ opacity: 0, x: -4 }}
                                              animate={{ opacity: 1, x: 0 }}
                                              transition={{ delay: i * 0.05, duration: 0.35 }}
                                            >
                                              <span className="text-sm">🌿</span>
                                              <div className="min-w-0">
                                                <p className="text-[12px] font-medium text-foreground/70 truncate">{t.title}</p>
                                                <p className="text-[10px] text-muted-foreground/30 mt-0.5">
                                                  Since {new Date(t.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                                                  <span className="ml-1.5 text-sage-foreground/40">· ongoing</span>
                                                </p>
                                              </div>
                                            </motion.div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {pastTreatments.length > 0 && (
                                      <div>
                                        <p className="text-[10px] text-muted-foreground/35 uppercase tracking-wider font-medium mb-2">
                                          Previously explored
                                        </p>
                                        <div className="space-y-1">
                                          {pastTreatments.map((t, i) => (
                                            <motion.div
                                              key={t.id}
                                              className="flex items-center gap-3 py-1.5 px-3"
                                              initial={{ opacity: 0 }}
                                              animate={{ opacity: 1 }}
                                              transition={{ delay: 0.1 + i * 0.04, duration: 0.35 }}
                                            >
                                              <span className="text-[11px] opacity-40">🌿</span>
                                              <div className="min-w-0">
                                                <p className="text-[12px] text-foreground/55 truncate">{t.title}</p>
                                                <p className="text-[10px] text-muted-foreground/25">
                                                  {new Date(t.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                                                </p>
                                              </div>
                                            </motion.div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <div className="text-center py-4">
                                    <p className="text-[12px] text-muted-foreground/40">
                                      No treatments recorded yet.
                                    </p>
                                    <p className="text-[11px] text-muted-foreground/30 mt-1">
                                      As you log treatments, they'll appear here in your care journey.
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}

                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>

            {/* Footer */}
            <motion.div
              className="mt-6 pt-4 border-t border-border/15 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <p className="text-[14px] font-serif text-foreground/70 mb-1">
                Your body story belongs to you
              </p>
              <p className="text-[11px] text-muted-foreground/35 leading-relaxed">
                This passport is a reflection of your experiences across time.
                Nothing is shared unless you choose to share it.
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BodyPassport;
