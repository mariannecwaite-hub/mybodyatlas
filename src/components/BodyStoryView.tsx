import { useState } from "react";
import { motion } from "framer-motion";
import { useApp, REGION_LABELS, EventType } from "@/context/AppContext";
import { Shield, Lock, FileText, Bookmark, X as XIcon } from "lucide-react";

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

interface BodyStoryViewProps {
  onCreateSummary: () => void;
}

const BodyStoryView = ({ onCreateSummary }: BodyStoryViewProps) => {
  const { visibleEvents } = useApp();
  const [dismissedPatterns, setDismissedPatterns] = useState<number[]>([]);
  const [savedPatterns, setSavedPatterns] = useState<number[]>([]);
  const [reflection, setReflection] = useState("");

  const years = [...new Set(visibleEvents.map((e) => new Date(e.date).getFullYear()))].sort();
  const span = years.length > 1 ? `${years[0]}–${years[years.length - 1]}` : years[0]?.toString() || "—";

  const typeCounts = visibleEvents.reduce((acc, e) => {
    acc[e.type] = (acc[e.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

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

  // Timeline clusters by life phase
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

  // Patterns
  const patterns: { title: string; body: string; tone: string }[] = [];
  if (stressEvents.length > 0 && symptomEvents.length > 0) {
    const stressRegions = new Set(stressEvents.flatMap((e) => e.regions));
    const symptomRegions = new Set(symptomEvents.flatMap((e) => e.regions));
    const overlap = [...stressRegions].filter((r) => symptomRegions.has(r));
    if (overlap.length > 0) {
      patterns.push({
        title: "Stress and your body",
        body: `Stress periods and physical sensations overlap in your ${overlap.slice(0, 2).map((r) => REGION_LABELS[r]?.toLowerCase()).join(" and ")}. Many people notice this connection.`,
        tone: "lavender",
      });
    } else {
      patterns.push({
        title: "A thread worth noticing",
        body: "You've recorded both stress periods and physical sensations. Many people find these are connected — something worth reflecting on gently.",
        tone: "lavender",
      });
    }
  }
  if (ongoingCount > 2) {
    patterns.push({
      title: "You're navigating a lot",
      body: `${ongoingCount} ongoing threads. Staying with the process is itself a form of care.`,
      tone: "sage",
    });
  }
  if (treatments.length > 0) {
    patterns.push({
      title: "Care you've explored",
      body: `You've tried ${treatments.length} different forms of care. That shows commitment to understanding your body.`,
      tone: "sage",
    });
  }
  const injuryEvents = visibleEvents.filter((e) => e.type === "injury");
  if (injuryEvents.length > 0) {
    const injuryRegions = injuryEvents.flatMap((e) => e.regions);
    const laterSymptomRegions = symptomEvents
      .filter((e) => new Date(e.date) > new Date(Math.min(...injuryEvents.map((i) => new Date(i.date).getTime()))))
      .flatMap((e) => e.regions);
    const relatedPairs: Record<string, string[]> = {
      ankle_foot_left: ["knee_left", "hip_left", "lower_back"],
      ankle_foot_right: ["knee_right", "hip_right", "lower_back"],
    };
    const echo = injuryRegions.some((ir) => (relatedPairs[ir] || []).some((r) => laterSymptomRegions.includes(r as any)));
    if (echo) {
      patterns.push({
        title: "Your body remembers",
        body: "An earlier injury may have quietly changed how you move. Later sensations in nearby areas can sometimes trace back — your body adapting, not failing.",
        tone: "warm",
      });
    }
  }

  const visiblePatterns = patterns.filter((_, i) => !dismissedPatterns.includes(i));
  const toneStyles: Record<string, string> = {
    sage: "bg-sage/12 border-sage/18",
    lavender: "bg-lavender/12 border-lavender/18",
    warm: "bg-warm/15 border-warm/18",
  };

  return (
    <div className="pt-8 pb-12 space-y-8" role="region" aria-label="Your Body Story So Far">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2.5 mb-2">
          <Shield className="w-5 h-5 text-sage-foreground/50" />
          <h2 className="text-[26px] font-serif text-foreground/90 leading-tight">Your Body Story So Far</h2>
        </div>

        {/* Privacy message */}
        <motion.div
          className="rounded-2xl p-4 bg-sage/8 border border-sage/12 flex items-start gap-3 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <Lock className="w-4 h-4 text-sage-foreground/40 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[13px] text-foreground/70 leading-relaxed">
              Your body story is private.
            </p>
            <p className="text-[12px] text-muted-foreground/45 leading-relaxed mt-0.5">
              You can create summaries when it's helpful to share with someone you trust.
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* 1. Body Map Overview */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <p className="section-label mb-3">Body map overview</p>
        {topRegions.length > 0 ? (
          <div className="rounded-2xl p-5 bg-card border border-border/20" style={{ boxShadow: "var(--shadow-xs)" }}>
            <div className="flex flex-wrap gap-2 mb-4">
              {topRegions.map(([region, count]) => (
                <span key={region} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary/50 text-[12px] text-foreground/65 border border-border/15">
                  <span className="w-2 h-2 rounded-full bg-sage/60" />
                  {REGION_LABELS[region as keyof typeof REGION_LABELS]}
                  <span className="text-muted-foreground/30 ml-0.5">· {count}</span>
                </span>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground/35 leading-relaxed">
              {topRegions.length} areas of your body have recorded events. The regions above appear most in your history.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl p-6 bg-card border border-border/20 text-center">
            <p className="text-[13px] text-muted-foreground/40">No body regions recorded yet.</p>
          </div>
        )}
      </motion.section>

      {/* 2. Timeline Highlights */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <p className="section-label mb-3">Timeline highlights</p>
        <div className="rounded-2xl p-5 bg-warm/12 border border-warm/15">
          <div className="flex items-baseline gap-3 mb-4">
            <p className="text-[22px] font-serif text-foreground/85">{span}</p>
            <p className="text-[12px] text-muted-foreground/45">
              {visibleEvents.length} events · {years.length} {years.length === 1 ? "year" : "years"}
            </p>
          </div>

          {/* Life phase clusters */}
          {lifeClusters.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1" style={{ scrollbarWidth: "none" }}>
              {lifeClusters.map((cluster, i) => (
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

          {/* Event type breakdown */}
          <div className="mt-4 pt-3 border-t border-warm/15 space-y-1.5">
            {Object.entries(typeCounts).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${typeDotColors[type as EventType]}`} />
                  <span className="text-[12px] text-foreground/60">{typeLabels[type as EventType]}</span>
                </div>
                <span className="text-[11px] text-muted-foreground/30">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* 3. Patterns Worth Noticing */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <p className="section-label mb-3">Patterns worth noticing</p>
        {visiblePatterns.length > 0 ? (
          <div className="space-y-3">
            {visiblePatterns.map((pattern, idx) => {
              const originalIdx = patterns.indexOf(pattern);
              const isSaved = savedPatterns.includes(originalIdx);
              return (
                <motion.div
                  key={pattern.title}
                  className={`rounded-2xl p-5 border ${toneStyles[pattern.tone] || ""} relative`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 + idx * 0.1, duration: 0.4 }}
                >
                  <p className="text-[15px] font-serif text-foreground/80 mb-1.5">{pattern.title}</p>
                  <p className="text-[13px] text-muted-foreground/55 leading-[1.8] mb-3">{pattern.body}</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSavedPatterns((p) => isSaved ? p.filter((x) => x !== originalIdx) : [...p, originalIdx])}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all duration-200 ${
                        isSaved ? "bg-primary/10 text-primary/70" : "bg-secondary/50 text-muted-foreground/45 hover:text-muted-foreground/65"
                      }`}
                    >
                      <Bookmark className="w-3 h-3" />
                      {isSaved ? "Saved" : "Save"}
                    </button>
                    <button
                      onClick={() => setDismissedPatterns((p) => [...p, originalIdx])}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium bg-secondary/50 text-muted-foreground/45 hover:text-muted-foreground/65 transition-all duration-200"
                    >
                      <XIcon className="w-3 h-3" />
                      Not relevant
                    </button>
                  </div>
                </motion.div>
              );
            })}
            <p className="text-[10px] text-muted-foreground/28 leading-relaxed">
              These are observational patterns, not diagnoses. Things you may wish to explore with a practitioner.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl p-5 bg-sage/8 border border-sage/12 text-center">
            <p className="text-[13px] text-muted-foreground/45">
              {patterns.length > 0 ? "All patterns dismissed." : "As you add more events, patterns may emerge here."}
            </p>
          </div>
        )}
      </motion.section>

      {/* 4. Treatments Explored */}
      {treatments.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <p className="section-label mb-3">Treatments explored</p>
          <div className="rounded-2xl p-5 bg-sage/8 border border-sage/12">
            <div className="space-y-3">
              {treatments.map((t) => (
                <div key={t.id} className="flex items-start gap-3">
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

      {/* 5. Reflection */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.5 }}
      >
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

      {/* Validating message */}
      <motion.div
        className="rounded-2xl p-6 bg-lavender/8 border border-lavender/12 text-center"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <p className="text-[15px] font-serif text-foreground/80 mb-1.5">
          You've been paying attention
        </p>
        <p className="text-[12px] text-muted-foreground/45 leading-[1.8]">
          This record reflects care and self-awareness. That matters — regardless of what comes next.
        </p>
      </motion.div>

      {/* Create summary CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.65 }}
      >
        <button
          onClick={onCreateSummary}
          className="btn-primary flex items-center justify-center gap-2"
        >
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
