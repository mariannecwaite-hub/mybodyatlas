import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp, REGION_LABELS, EventType, BodyRegion } from "@/context/AppContext";
import { X, Copy, Check, FileText, ChevronRight, ChevronLeft, Shield, MessageSquare } from "lucide-react";

interface PractitionerSummaryProps {
  open: boolean;
  onClose: () => void;
}

type Step = "configure" | "page1" | "page2";

const outcomeOptions = ["Helped", "Neutral", "Unsure", "Short-term relief"] as const;

const PractitionerSummary = ({ open, onClose }: PractitionerSummaryProps) => {
  const { visibleEvents, currentProfile } = useApp();
  const [step, setStep] = useState<Step>("configure");
  const [copied, setCopied] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [currentConcerns, setCurrentConcerns] = useState("");
  const [questions, setQuestions] = useState("");
  const [treatmentOutcomes, setTreatmentOutcomes] = useState<Record<string, string>>({});

  // Include toggles
  const [includeBodyMap, setIncludeBodyMap] = useState(true);
  const [includeTimeline, setIncludeTimeline] = useState(true);
  const [includeTreatments, setIncludeTreatments] = useState(true);
  const [includePatterns, setIncludePatterns] = useState(true);
  const [includeQuestions, setIncludeQuestions] = useState(true);

  const treatments = visibleEvents.filter((e) => e.type === "treatment");
  const stressEvents = visibleEvents.filter((e) => e.type === "stress");
  const symptomEvents = visibleEvents.filter((e) => e.type === "symptom");
  const ongoingCount = visibleEvents.filter((e) => e.ongoing).length;

  const topRegions = Object.entries(
    visibleEvents.flatMap((e) => e.regions).reduce((acc, r) => {
      acc[r] = (acc[r] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const years = [...new Set(visibleEvents.map((e) => new Date(e.date).getFullYear()))].sort();
  const birthYear = currentProfile?.birthYear || 1992;

  const timelineEntries = visibleEvents
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((e) => {
      const year = new Date(e.date).getFullYear();
      const age = year - birthYear;
      const typeLabel: Record<EventType, string> = {
        injury: "Injury",
        symptom: "Sensation",
        stress: "Stress period",
        treatment: "Treatment",
        "life-event": "Life transition",
      };
      return { age, year, title: e.title, type: typeLabel[e.type] || e.type };
    });

  const patterns: string[] = [];
  if (stressEvents.length > 0 && symptomEvents.length > 0) {
    patterns.push(
      "Several stress periods appear to coincide with the onset or intensification of physical sensations. You may wish to explore this correlation."
    );
  }
  const lowerBodyRegions = ["knee_left", "knee_right", "ankle_foot_left", "ankle_foot_right", "hip_left", "hip_right"];
  const lowerBodyEvents = visibleEvents.filter((e) => e.regions.some((r) => lowerBodyRegions.includes(r)));
  if (lowerBodyEvents.length >= 2) {
    patterns.push(
      "Several lower-body experiences appear across time. You may wish to explore how earlier injuries relate to current concerns."
    );
  }
  if (ongoingCount > 2) {
    patterns.push(
      `There are ${ongoingCount} currently ongoing threads. Addressing these in context may reveal connections.`
    );
  }

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setStep("configure");
    onClose();
  };

  const dateGenerated = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const ToggleRow = ({
    label,
    value,
    onToggle,
  }: {
    label: string;
    value: boolean;
    onToggle: () => void;
  }) => (
    <label className="flex items-center justify-between py-2.5 cursor-pointer">
      <span className="text-[13px] text-foreground/70">{label}</span>
      <div
        onClick={onToggle}
        className={`w-10 h-[22px] rounded-full transition-all duration-300 relative cursor-pointer flex-shrink-0 ${
          value ? "bg-primary" : "bg-border"
        }`}
      >
        <div
          className={`absolute top-[2px] w-[18px] h-[18px] rounded-full bg-card transition-transform duration-300 ${
            value ? "translate-x-[20px]" : "translate-x-[2px]"
          }`}
          style={{ boxShadow: "var(--shadow-xs)" }}
        />
      </div>
    </label>
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="modal-overlay" onClick={handleClose} />
          <motion.div
            className="modal-content max-w-lg"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
          >
            <div className="modal-header">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground/50" />
                <h2 className="text-lg">Create Practitioner Summary</h2>
              </div>
              <button onClick={handleClose} className="modal-close">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <AnimatePresence mode="wait">
              {/* ── CONFIGURE ── */}
              {step === "configure" && (
                <motion.div
                  key="configure"
                  className="space-y-5"
                  initial={{ opacity: 0, x: 0 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  <p className="text-[13px] text-muted-foreground/60 leading-relaxed">
                    Generate a structured summary designed to help healthcare professionals understand your body history quickly. You choose exactly what to include.
                  </p>

                  {/* Patient name */}
                  <div>
                    <label className="section-label mb-2 block">Name (optional)</label>
                    <input
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="How you'd like to be addressed"
                      className="field-input"
                    />
                  </div>

                  {/* Current concerns */}
                  <div>
                    <label className="section-label mb-2 block">Current concerns</label>
                    <p className="text-[11px] text-muted-foreground/40 mb-2">
                      Describe what you'd like to discuss in your own words.
                    </p>
                    <textarea
                      value={currentConcerns}
                      onChange={(e) => setCurrentConcerns(e.target.value)}
                      placeholder="e.g., My left knee has been aching more recently, especially going downstairs. I'm wondering if it's connected to an old ankle injury."
                      rows={3}
                      className="field-input resize-none"
                    />
                  </div>

                  {/* Section toggles */}
                  <div className="rounded-2xl p-4 bg-secondary/40 border border-border/15">
                    <p className="section-label mb-2">Include in summary</p>
                    <div className="divide-y divide-border/10">
                      <ToggleRow label="Body map overview" value={includeBodyMap} onToggle={() => setIncludeBodyMap(!includeBodyMap)} />
                      <ToggleRow label="Timeline highlights" value={includeTimeline} onToggle={() => setIncludeTimeline(!includeTimeline)} />
                      <ToggleRow label="Treatments explored" value={includeTreatments} onToggle={() => setIncludeTreatments(!includeTreatments)} />
                      <ToggleRow label="Patterns worth noticing" value={includePatterns} onToggle={() => setIncludePatterns(!includePatterns)} />
                      <ToggleRow label="Questions for practitioner" value={includeQuestions} onToggle={() => setIncludeQuestions(!includeQuestions)} />
                    </div>
                  </div>

                  {/* Questions */}
                  {includeQuestions && (
                    <div>
                      <label className="section-label mb-2 block">Questions for your practitioner</label>
                      <textarea
                        value={questions}
                        onChange={(e) => setQuestions(e.target.value)}
                        placeholder="e.g., Could earlier ankle injuries affect knee mechanics? Should I be concerned about recurring tension in my neck?"
                        rows={3}
                        className="field-input resize-none"
                      />
                    </div>
                  )}

                  {/* Treatment outcomes */}
                  {includeTreatments && treatments.length > 0 && (
                    <div>
                      <label className="section-label mb-2 block">Rate treatment outcomes</label>
                      <div className="space-y-2">
                        {treatments.map((t) => (
                          <div key={t.id} className="p-3.5 rounded-xl bg-secondary/30 border border-border/10">
                            <p className="text-[12px] text-foreground/70 mb-2">{t.title}</p>
                            <div className="flex flex-wrap gap-1.5">
                              {outcomeOptions.map((outcome) => (
                                <button
                                  key={outcome}
                                  onClick={() =>
                                    setTreatmentOutcomes((prev) => ({ ...prev, [t.id]: outcome }))
                                  }
                                  className={`px-3 py-1.5 rounded-full text-[11px] transition-all duration-200 ${
                                    treatmentOutcomes[t.id] === outcome
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-secondary/60 text-muted-foreground/50 hover:bg-secondary/80"
                                  }`}
                                >
                                  {outcome}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button onClick={() => setStep("page1")} className="btn-primary flex items-center justify-center gap-2">
                    Generate summary
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}

              {/* ── PAGE 1 ── */}
              {step === "page1" && (
                <motion.div
                  key="page1"
                  className="space-y-0"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  {/* Clinical document */}
                  <div className="rounded-2xl border border-border/30 bg-card overflow-hidden" style={{ boxShadow: "var(--shadow-sm)" }}>
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-border/20">
                      <p className="text-[15px] font-serif text-foreground/85">
                        My Body Atlas — Body History Summary
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        {patientName && (
                          <p className="text-[11px] text-muted-foreground/50">
                            Name: {patientName}
                          </p>
                        )}
                        <p className="text-[11px] text-muted-foreground/40">
                          Date: {dateGenerated}
                        </p>
                      </div>
                    </div>

                    <div className="px-6 py-5 space-y-5">
                      {/* Current concerns */}
                      {currentConcerns && (
                        <div>
                          <p className="text-[10px] text-muted-foreground/40 uppercase tracking-wider font-medium mb-2">
                            Current Concerns
                          </p>
                          <p className="text-[12px] text-foreground/65 leading-relaxed">
                            {currentConcerns}
                          </p>
                        </div>
                      )}

                      {/* Body map overview */}
                      {includeBodyMap && topRegions.length > 0 && (
                        <div>
                          <p className="text-[10px] text-muted-foreground/40 uppercase tracking-wider font-medium mb-2">
                            Body Map Overview
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {topRegions.map(([region, count]) => (
                              <span
                                key={region}
                                className="px-2.5 py-1 rounded-lg bg-secondary/50 text-[11px] text-foreground/60"
                              >
                                {REGION_LABELS[region as BodyRegion]} · {count} {count === 1 ? "event" : "events"}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Timeline highlights */}
                      {includeTimeline && timelineEntries.length > 0 && (
                        <div>
                          <p className="text-[10px] text-muted-foreground/40 uppercase tracking-wider font-medium mb-2">
                            Timeline Highlights
                          </p>
                          <div className="space-y-1">
                            {timelineEntries.slice(0, 10).map((entry, i) => (
                              <div key={i} className="flex items-baseline gap-3 py-1">
                                <span className="text-[11px] text-muted-foreground/35 font-mono w-16 flex-shrink-0">
                                  Age {entry.age}
                                </span>
                                <span className="text-[11px] text-foreground/60 leading-relaxed">
                                  {entry.title}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Page indicator + nav */}
                  <div className="flex items-center justify-between pt-5">
                    <button
                      onClick={() => setStep("configure")}
                      className="flex items-center gap-1 text-[12px] text-muted-foreground/45 hover:text-muted-foreground/65 transition-colors"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" /> Edit
                    </button>
                    <span className="text-[10px] text-muted-foreground/30">Page 1 of 2</span>
                    <button
                      onClick={() => setStep("page2")}
                      className="flex items-center gap-1 text-[12px] text-primary/70 hover:text-primary transition-colors"
                    >
                      Next <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── PAGE 2 ── */}
              {step === "page2" && (
                <motion.div
                  key="page2"
                  className="space-y-0"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="rounded-2xl border border-border/30 bg-card overflow-hidden" style={{ boxShadow: "var(--shadow-sm)" }}>
                    <div className="px-6 py-5 space-y-5">
                      {/* Treatments */}
                      {includeTreatments && treatments.length > 0 && (
                        <div>
                          <p className="text-[10px] text-muted-foreground/40 uppercase tracking-wider font-medium mb-2">
                            Treatments Explored
                          </p>
                          <div className="border border-border/15 rounded-xl overflow-hidden">
                            <div className="grid grid-cols-[1fr_auto] text-[10px] text-muted-foreground/35 uppercase tracking-wider font-medium px-3.5 py-2 bg-secondary/30 border-b border-border/10">
                              <span>Treatment</span>
                              <span>Outcome</span>
                            </div>
                            {treatments.map((t) => (
                              <div
                                key={t.id}
                                className="grid grid-cols-[1fr_auto] px-3.5 py-2.5 border-b border-border/8 last:border-0"
                              >
                                <span className="text-[12px] text-foreground/60">{t.title}</span>
                                <span className="text-[11px] text-muted-foreground/45">
                                  {treatmentOutcomes[t.id] || "—"}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Patterns */}
                      {includePatterns && patterns.length > 0 && (
                        <div>
                          <p className="text-[10px] text-muted-foreground/40 uppercase tracking-wider font-medium mb-2">
                            Patterns Worth Noticing
                          </p>
                          <div className="space-y-2">
                            {patterns.map((p, i) => (
                              <p key={i} className="text-[12px] text-foreground/60 leading-relaxed">
                                {p}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Questions */}
                      {includeQuestions && questions.trim() && (
                        <div>
                          <p className="text-[10px] text-muted-foreground/40 uppercase tracking-wider font-medium mb-2">
                            Questions for Practitioner
                          </p>
                          <div className="flex items-start gap-2.5">
                            <MessageSquare className="w-3.5 h-3.5 text-muted-foreground/30 mt-0.5 flex-shrink-0" />
                            <p className="text-[12px] text-foreground/60 leading-relaxed whitespace-pre-line">
                              {questions}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Footer disclosure */}
                      <div className="pt-4 border-t border-border/15">
                        <p className="text-[10px] text-muted-foreground/30 leading-relaxed italic">
                          This summary reflects user-reported body experiences organised by My Body Atlas.
                          It is intended to support conversation with healthcare professionals.
                          It does not constitute a medical record or diagnosis.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Page indicator + nav */}
                  <div className="flex items-center justify-between pt-5">
                    <button
                      onClick={() => setStep("page1")}
                      className="flex items-center gap-1 text-[12px] text-muted-foreground/45 hover:text-muted-foreground/65 transition-colors"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" /> Page 1
                    </button>
                    <span className="text-[10px] text-muted-foreground/30">Page 2 of 2</span>
                    <div />
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-4">
                    <button onClick={handleCopy} className="btn-primary flex items-center justify-center gap-2">
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" /> Summary copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" /> Copy summary text
                        </>
                      )}
                    </button>
                    <button className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-secondary/50 text-[12px] text-muted-foreground/60 hover:bg-secondary/70 transition-colors duration-200">
                      <FileText className="w-3.5 h-3.5" /> Export as PDF
                    </button>
                  </div>

                  <p className="text-[10px] text-muted-foreground/30 text-center pt-3 leading-relaxed">
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

export default PractitionerSummary;
