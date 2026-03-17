import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp, REGION_LABELS, EventType, BodyRegion } from "@/context/AppContext";
import { useBodyThreads } from "@/hooks/useBodyThreads";
import { X, Shield, Copy, Check, FileText, Link2, BookOpen, Lock } from "lucide-react";

/** Mini silhouette region positions for summary */
const summaryRegionPos: Record<string, { cx: number; cy: number }> = {
  head_jaw: { cx: 50, cy: 10 }, neck: { cx: 50, cy: 18 },
  shoulder_left: { cx: 35, cy: 24 }, shoulder_right: { cx: 65, cy: 24 },
  chest: { cx: 50, cy: 32 }, upper_back: { cx: 50, cy: 32 },
  abdomen: { cx: 50, cy: 45 }, lower_back: { cx: 50, cy: 45 },
  wrist_hand_left: { cx: 22, cy: 48 }, wrist_hand_right: { cx: 78, cy: 48 },
  hip_left: { cx: 42, cy: 56 }, hip_right: { cx: 58, cy: 56 },
  knee_left: { cx: 42, cy: 72 }, knee_right: { cx: 58, cy: 72 },
  ankle_foot_left: { cx: 42, cy: 88 }, ankle_foot_right: { cx: 58, cy: 88 },
};

interface BodyStorySummaryProps {
  open: boolean;
  onClose: () => void;
}

const typeLabels: Record<EventType, string> = {
  injury: "Injuries",
  symptom: "Sensations",
  stress: "Stress periods",
  treatment: "Treatments explored",
  "life-event": "Life transitions",
  "safety-experience": "Experiences",
};

type Step = "story" | "configure" | "preview";

const BodyStorySummary = ({ open, onClose }: BodyStorySummaryProps) => {
  const { visibleEvents } = useApp();
  const threads = useBodyThreads(visibleEvents);
  const [step, setStep] = useState<Step>("story");
  const [reflection, setReflection] = useState("");
  const [copied, setCopied] = useState(false);

  // Summary configuration toggles
  const [includeBodyMap, setIncludeBodyMap] = useState(true);
  const [includeTimeline, setIncludeTimeline] = useState(true);
  const [includeTreatments, setIncludeTreatments] = useState(true);
  const [includeStress, setIncludeStress] = useState(false);
  const [includeLifeTransitions, setIncludeLifeTransitions] = useState(false);
  const [includeNotes, setIncludeNotes] = useState(false);

  const allRegions = [...new Set(visibleEvents.flatMap((e) => e.regions))];
  const years = [...new Set(visibleEvents.map((e) => new Date(e.date).getFullYear()))].sort();
  const span = years.length > 1 ? `${years[0]}–${years[years.length - 1]}` : years[0]?.toString() || "—";

  const typeCounts = visibleEvents.reduce((acc, e) => {
    acc[e.type] = (acc[e.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const treatments = visibleEvents.filter((e) => e.type === "treatment");
  const stressEvents = visibleEvents.filter((e) => e.type === "stress");
  const symptomEvents = visibleEvents.filter((e) => e.type === "symptom");
  const lifeEvents = visibleEvents.filter((e) => e.type === "life-event");
  const ongoingCount = visibleEvents.filter((e) => e.ongoing).length;

  const topRegions = Object.entries(
    visibleEvents.flatMap((e) => e.regions).reduce((acc, r) => {
      acc[r] = (acc[r] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const patterns: string[] = [];
  if (stressEvents.length > 0 && symptomEvents.length > 0) {
    patterns.push("Stress periods and physical sensations appear connected in your history.");
  }
  if (ongoingCount > 2) {
    patterns.push(`You're currently navigating ${ongoingCount} ongoing threads — that takes resilience.`);
  }
  if (treatments.length > 0) {
    patterns.push(`You've explored ${treatments.length} different forms of care. That shows commitment to yourself.`);
  }

  const handleCopy = () => { setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const handleClose = () => {
    setStep("story");
    onClose();
  };

  const ToggleRow = ({ label, description, value, onToggle }: { label: string; description: string; value: boolean; onToggle: () => void }) => (
    <label className="flex items-center justify-between p-3.5 rounded-2xl bg-secondary/40 cursor-pointer hover:bg-secondary/55 transition-all duration-200">
      <div className="pr-3">
        <p className="text-[13px] font-medium text-foreground/80">{label}</p>
        <p className="text-[11px] text-muted-foreground/50 mt-0.5">{description}</p>
      </div>
      <div onClick={onToggle}
        className={`w-11 h-[26px] rounded-full transition-all duration-300 relative cursor-pointer flex-shrink-0 ${value ? "bg-primary" : "bg-border"}`}>
        <div className={`absolute top-[3px] w-5 h-5 rounded-full bg-card transition-transform duration-300 ${value ? "translate-x-[22px]" : "translate-x-[3px]"}`}
          style={{ boxShadow: "var(--shadow-xs)" }} />
      </div>
    </label>
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="modal-overlay" onClick={handleClose} />
          <motion.div
            className="modal-content max-w-md"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
          >
            <div className="modal-header">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-sage-foreground/60" />
                <h2 className="text-xl">Your Body Story So Far</h2>
              </div>
              <button onClick={handleClose} className="modal-close">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Privacy reassurance — always visible */}
            <motion.div
              className="rounded-2xl p-4 bg-sage/10 border border-sage/15 mb-6 flex items-start gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Lock className="w-4 h-4 text-sage-foreground/50 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[13px] text-foreground/75 leading-relaxed">
                  Your body story is private.
                </p>
                <p className="text-[12px] text-muted-foreground/50 leading-relaxed mt-0.5">
                  You can create summaries when it's helpful to share with someone you trust.
                </p>
              </div>
            </motion.div>

            <AnimatePresence mode="wait">
              {/* ── STEP 1: Story view ── */}
              {step === "story" && (
                <motion.div
                  key="story"
                  className="space-y-6"
                  initial={{ opacity: 0, x: 0 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  {/* 1. Body map overview */}
                  {topRegions.length > 0 && (
                    <div>
                      <p className="section-label mb-2.5">Body map overview</p>
                      <div className="flex flex-wrap gap-1.5">
                        {topRegions.map(([region, count]) => (
                          <span key={region} className="chip chip-inactive text-[11px]">
                            {REGION_LABELS[region as keyof typeof REGION_LABELS]} · {count}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 2. Timeline highlights */}
                  <div className="rounded-2xl p-5 bg-warm/18 border border-warm/20">
                    <p className="section-label mb-2">Timeline highlights</p>
                    <p className="text-[20px] font-serif text-foreground/85">{span}</p>
                    <p className="text-[12px] text-muted-foreground/50 mt-1">
                      {visibleEvents.length} events across {years.length} {years.length === 1 ? "year" : "years"}
                    </p>
                    <div className="space-y-1.5 mt-3">
                      {Object.entries(typeCounts).map(([type, count]) => (
                        <div key={type} className="flex items-center justify-between py-1">
                          <span className="text-[12px] text-foreground/65">
                            {typeLabels[type as EventType] || type}
                          </span>
                          <span className="text-[11px] text-muted-foreground/35">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 3. Patterns worth noticing */}
                  {patterns.length > 0 && (
                    <div>
                      <p className="section-label mb-2.5">Patterns worth noticing</p>
                      <div className="space-y-2.5">
                        {patterns.map((p, i) => (
                          <div key={i} className="rounded-xl p-3.5 bg-lavender/10 border border-lavender/15">
                            <p className="text-[12px] text-muted-foreground/60 leading-[1.8]">{p}</p>
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] text-muted-foreground/30 mt-2">
                        Things you may wish to explore with a practitioner.
                      </p>
                    </div>
                  )}

                  {/* 4. Treatments explored */}
                  {treatments.length > 0 && (
                    <div className="rounded-2xl p-5 bg-sage/12 border border-sage/20">
                      <p className="section-label mb-2.5 text-sage-foreground/60">Treatments explored</p>
                      <div className="space-y-1.5">
                        {treatments.slice(0, 5).map((t) => (
                          <p key={t.id} className="text-[13px] text-foreground/70">
                            {t.title}
                            {t.ongoing && (
                              <span className="ml-1.5 text-sage-foreground/50 text-[11px]">· ongoing</span>
                            )}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 5. Reflection prompt */}
                  <div>
                    <p className="section-label mb-2">Personal reflection</p>
                    <p className="text-[11px] text-muted-foreground/45 mb-2.5 leading-relaxed">
                      An optional space for your own thoughts. This stays private unless you choose to include it in a summary.
                    </p>
                    <textarea
                      value={reflection}
                      onChange={(e) => setReflection(e.target.value)}
                      placeholder="What do you notice looking back at your body story?"
                      rows={3}
                      className="field-input resize-none"
                    />
                  </div>

                  {/* Validating message */}
                  <div className="rounded-2xl p-5 bg-lavender/10 border border-lavender/15 text-center">
                    <p className="text-[14px] font-serif text-foreground/80 mb-1.5">
                      You've been paying attention
                    </p>
                    <p className="text-[12px] text-muted-foreground/50 leading-[1.8]">
                      This record reflects care and self-awareness. That matters — regardless of what comes next.
                    </p>
                  </div>

                  {/* CTA */}
                  <button
                    onClick={() => setStep("configure")}
                    className="btn-primary flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Create Body Story Summary
                  </button>

                  <p className="text-[10px] text-muted-foreground/30 text-center">
                    Your body story belongs to you. Nothing is shared unless you choose to share it.
                  </p>
                </motion.div>
              )}

              {/* ── STEP 2: Configure summary ── */}
              {step === "configure" && (
                <motion.div
                  key="configure"
                  className="space-y-5"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  <div>
                    <h3 className="text-[17px] font-serif text-foreground/85 mb-1">Configure your summary</h3>
                    <p className="text-[12px] text-muted-foreground/50 leading-relaxed">
                      Choose what to include. Every section is optional — include only what feels right.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <ToggleRow
                      label="Body map overview"
                      description="Highlighted regions where events occurred"
                      value={includeBodyMap}
                      onToggle={() => setIncludeBodyMap(!includeBodyMap)}
                    />
                    <ToggleRow
                      label="Timeline events"
                      description="Key body events across life phases"
                      value={includeTimeline}
                      onToggle={() => setIncludeTimeline(!includeTimeline)}
                    />
                    <ToggleRow
                      label="Treatments explored"
                      description="What you've tried and your experience"
                      value={includeTreatments}
                      onToggle={() => setIncludeTreatments(!includeTreatments)}
                    />
                    <ToggleRow
                      label="Stress history"
                      description="Stress periods and their timing"
                      value={includeStress}
                      onToggle={() => setIncludeStress(!includeStress)}
                    />
                    <ToggleRow
                      label="Life transitions"
                      description="Significant life events you've recorded"
                      value={includeLifeTransitions}
                      onToggle={() => setIncludeLifeTransitions(!includeLifeTransitions)}
                    />
                    <ToggleRow
                      label="Personal notes"
                      description="Your private reflections and observations"
                      value={includeNotes}
                      onToggle={() => setIncludeNotes(!includeNotes)}
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setStep("story")}
                      className="flex-1 py-3 rounded-2xl text-[13px] text-muted-foreground/60 bg-secondary/50 hover:bg-secondary/70 transition-colors duration-200"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setStep("preview")}
                      className="flex-[2] btn-primary"
                    >
                      Generate summary
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 3: Summary output ── */}
              {step === "preview" && (
                <motion.div
                  key="preview"
                  className="space-y-5"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  <div>
                    <h3 className="text-[17px] font-serif text-foreground/85 mb-1">Your summary is ready</h3>
                    <p className="text-[12px] text-muted-foreground/50 leading-relaxed">
                      Use this for appointments, personal reflection, or to share with someone you trust.
                    </p>
                  </div>

                  {/* Summary preview card */}
                  <div className="rounded-2xl p-5 bg-card border border-border/30 space-y-4" style={{ boxShadow: "var(--shadow-sm)" }}>
                    <div className="text-center pb-3 border-b border-border/20">
                      <p className="text-[15px] font-serif text-foreground/85">My Body Story Summary</p>
                      <p className="text-[10px] text-muted-foreground/40 mt-1">
                        Generated {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                      </p>
                    </div>

                    {/* Body silhouette with highlighted regions */}
                    {includeBodyMap && allRegions.length > 0 && (
                      <div className="flex justify-center py-2">
                        <svg viewBox="10 0 80 100" className="w-20 h-28" aria-label="Body summary showing affected areas">
                          <ellipse cx="50" cy="10" rx="7" ry="8" fill="hsl(var(--body-fill))" stroke="hsl(var(--body-stroke))" strokeWidth="0.5" />
                          <rect x="43" y="18" width="14" height="4" rx="2" fill="hsl(var(--body-fill))" />
                          <rect x="35" y="22" width="30" height="18" rx="4" fill="hsl(var(--body-fill))" stroke="hsl(var(--body-stroke))" strokeWidth="0.3" />
                          <rect x="38" y="40" width="24" height="18" rx="3" fill="hsl(var(--body-fill))" stroke="hsl(var(--body-stroke))" strokeWidth="0.3" />
                          <rect x="20" y="24" width="15" height="5" rx="2.5" fill="hsl(var(--body-fill))" />
                          <rect x="65" y="24" width="15" height="5" rx="2.5" fill="hsl(var(--body-fill))" />
                          <rect x="16" y="38" width="8" height="14" rx="3" fill="hsl(var(--body-fill))" />
                          <rect x="76" y="38" width="8" height="14" rx="3" fill="hsl(var(--body-fill))" />
                          <rect x="38" y="58" width="10" height="20" rx="3" fill="hsl(var(--body-fill))" stroke="hsl(var(--body-stroke))" strokeWidth="0.3" />
                          <rect x="52" y="58" width="10" height="20" rx="3" fill="hsl(var(--body-fill))" stroke="hsl(var(--body-stroke))" strokeWidth="0.3" />
                          <rect x="38" y="78" width="10" height="16" rx="3" fill="hsl(var(--body-fill))" />
                          <rect x="52" y="78" width="10" height="16" rx="3" fill="hsl(var(--body-fill))" />
                          {allRegions.map((region) => {
                            const pos = summaryRegionPos[region];
                            if (!pos) return null;
                            return (
                              <circle key={region} cx={pos.cx} cy={pos.cy} r="2.5"
                                fill="hsl(var(--primary) / 0.35)" stroke="hsl(var(--primary) / 0.15)" strokeWidth="2" />
                            );
                          })}
                        </svg>
                      </div>
                    )}

                    {includeBodyMap && topRegions.length > 0 && (
                      <div>
                        <p className="text-[10px] text-muted-foreground/40 uppercase tracking-wider mb-1.5">Body areas</p>
                        <p className="text-[12px] text-foreground/65">
                          {topRegions.map(([r]) => REGION_LABELS[r as keyof typeof REGION_LABELS]).join(", ")}
                        </p>
                      </div>
                    )}

                    {includeTimeline && (
                      <div>
                        <p className="text-[10px] text-muted-foreground/40 uppercase tracking-wider mb-1.5">Timeline</p>
                        <p className="text-[12px] text-foreground/65">{span} · {visibleEvents.length} events</p>
                        {threads.length > 0 && (
                          <p className="text-[11px] text-muted-foreground/40 mt-1">
                            {threads.length} connecting {threads.length === 1 ? "thread" : "threads"}
                          </p>
                        )}
                      </div>
                    )}

                    {includeTreatments && treatments.length > 0 && (
                      <div>
                        <p className="text-[10px] text-muted-foreground/40 uppercase tracking-wider mb-1.5">Treatments explored</p>
                        <p className="text-[12px] text-foreground/65">
                          {treatments.slice(0, 3).map((t) => t.title).join(", ")}
                        </p>
                      </div>
                    )}

                    {includeStress && stressEvents.length > 0 && (
                      <div>
                        <p className="text-[10px] text-muted-foreground/40 uppercase tracking-wider mb-1.5">Stress periods</p>
                        <p className="text-[12px] text-foreground/65">
                          {stressEvents.slice(0, 3).map((e) => e.title).join(", ")}
                        </p>
                      </div>
                    )}

                    {includeLifeTransitions && lifeEvents.length > 0 && (
                      <div>
                        <p className="text-[10px] text-muted-foreground/40 uppercase tracking-wider mb-1.5">Life transitions</p>
                        <p className="text-[12px] text-foreground/65">
                          {lifeEvents.slice(0, 3).map((e) => e.title).join(", ")}
                        </p>
                      </div>
                    )}

                    {patterns.length > 0 && (
                      <div>
                        <p className="text-[10px] text-muted-foreground/40 uppercase tracking-wider mb-1.5">Patterns worth noticing</p>
                        {patterns.map((p, i) => (
                          <p key={i} className="text-[12px] text-foreground/65 leading-relaxed">{p}</p>
                        ))}
                      </div>
                    )}

                    <div className="pt-2 border-t border-border/15">
                      <p className="text-[10px] text-muted-foreground/30 italic">
                        User-reported context for personal reflection or practitioner conversations. Not a diagnosis.
                      </p>
                    </div>
                  </div>

                  {/* Output actions */}
                  <div className="space-y-2">
                    <button
                      onClick={handleCopy}
                      className="btn-primary flex items-center justify-center gap-2"
                    >
                      {copied
                        ? <><Check className="w-4 h-4" /> Summary copied</>
                        : <><Copy className="w-4 h-4" /> Copy summary text</>
                      }
                    </button>
                    <div className="grid grid-cols-3 gap-2">
                      <button className="flex flex-col items-center gap-1.5 py-3.5 rounded-2xl bg-secondary/50 text-muted-foreground/55 hover:bg-secondary/70 transition-colors duration-200">
                        <BookOpen className="w-4 h-4" />
                        <span className="text-[10px] font-medium">Save for reflection</span>
                      </button>
                      <button className="flex flex-col items-center gap-1.5 py-3.5 rounded-2xl bg-secondary/50 text-muted-foreground/55 hover:bg-secondary/70 transition-colors duration-200">
                        <FileText className="w-4 h-4" />
                        <span className="text-[10px] font-medium">Export PDF</span>
                      </button>
                      <button className="flex flex-col items-center gap-1.5 py-3.5 rounded-2xl bg-secondary/50 text-muted-foreground/55 hover:bg-secondary/70 transition-colors duration-200">
                        <Link2 className="w-4 h-4" />
                        <span className="text-[10px] font-medium">Temporary link</span>
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => setStep("story")}
                    className="w-full py-2.5 text-[12px] text-muted-foreground/45 hover:text-muted-foreground/65 transition-colors duration-200"
                  >
                    ← Back to your body story
                  </button>

                  <p className="text-[10px] text-muted-foreground/30 text-center leading-relaxed">
                    Your body story belongs to you. Nothing is shared unless you choose to share it.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BodyStorySummary;
