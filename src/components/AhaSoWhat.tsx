import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { getBodyLiteracy } from "@/data/bodyLiteracyLibrary";
import {
  AhaInsight,
  saveInsightNote,
  getInsightNotes,
  addInsightToPassport,
  getPassportInsights,
} from "@/components/AhaMoment";
import { Separator } from "@/components/ui/separator";

interface AhaSoWhatProps {
  insight: AhaInsight;
  onDismiss: (save: boolean) => void;
}

/** Fade-in wrapper that triggers when scrolled into view */
const FadeInSection = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      {children}
    </motion.div>
  );
};

const SectionHeading = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-[10px] font-medium text-muted-foreground/40 uppercase tracking-[0.25em] mb-6">
    {children}
  </h3>
);

const AhaSoWhat = ({ insight, onDismiss }: AhaSoWhatProps) => {
  const literacy = getBodyLiteracy(insight.patternType, insight.regionA, insight.regionB);

  const [activeNoteIdx, setActiveNoteIdx] = useState<number | null>(null);
  const [noteTexts, setNoteTexts] = useState<Record<number, string>>(() => {
    const saved = getInsightNotes()[insight.id] || {};
    const initial: Record<number, string> = {};
    Object.entries(saved).forEach(([k, v]) => {
      initial[Number(k)] = v;
    });
    return initial;
  });

  const [addedToPassport, setAddedToPassport] = useState(() =>
    getPassportInsights().includes(insight.id)
  );

  const handleSaveNote = (idx: number) => {
    const text = noteTexts[idx]?.trim();
    if (text) {
      saveInsightNote(insight.id, idx, text);
    }
    setActiveNoteIdx(null);
  };

  const handleAddToPassport = () => {
    addInsightToPassport(insight.id);
    setAddedToPassport(true);
  };

  return (
    <div className="w-full max-w-lg mx-auto px-8 pb-24">
      {/* ── PART 1: Understanding ── */}
      <FadeInSection>
        <div className="pt-4 pb-16">
          <Separator className="mb-16 opacity-30" />
          <SectionHeading>What this might mean</SectionHeading>
          <p className="text-[16px] leading-[1.75] text-foreground/60">
            {literacy.understanding}
          </p>
        </div>
      </FadeInSection>

      {/* ── PART 2: Reflection ── */}
      <FadeInSection delay={0.05}>
        <div className="pb-16">
          <Separator className="mb-16 opacity-30" />
          <SectionHeading>Some questions worth sitting with</SectionHeading>
          <div className="space-y-8">
            {literacy.questions.map((q, idx) => (
              <div key={idx} className="space-y-3">
                <p className="text-[16px] leading-[1.75] text-foreground/60 italic">
                  "{q}"
                </p>

                {activeNoteIdx === idx ? (
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.3 }}
                  >
                    <textarea
                      className="w-full bg-transparent border border-border/40 rounded-lg px-4 py-3 text-[14px] text-foreground/70 placeholder:text-muted-foreground/30 focus:outline-none focus:border-accent-foreground/30 resize-none min-h-[80px]"
                      placeholder="Whatever comes to mind..."
                      value={noteTexts[idx] || ""}
                      onChange={(e) =>
                        setNoteTexts((prev) => ({ ...prev, [idx]: e.target.value }))
                      }
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveNote(idx)}
                        className="px-4 py-1.5 text-[12px] font-medium text-accent-foreground bg-accent/50 rounded-full hover:bg-accent/70 transition-colors duration-200"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setActiveNoteIdx(null)}
                        className="px-4 py-1.5 text-[12px] text-muted-foreground/40 hover:text-muted-foreground/60 transition-colors duration-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <div>
                    {noteTexts[idx] ? (
                      <p className="text-[13px] text-foreground/40 italic pl-3 border-l-2 border-accent/30">
                        {noteTexts[idx]}
                        <button
                          onClick={() => setActiveNoteIdx(idx)}
                          className="ml-2 text-accent-foreground/50 hover:text-accent-foreground/70 transition-colors duration-200 not-italic"
                        >
                          Edit
                        </button>
                      </p>
                    ) : (
                      <button
                        onClick={() => setActiveNoteIdx(idx)}
                        className="text-[12px] text-accent-foreground/40 hover:text-accent-foreground/60 transition-colors duration-200"
                      >
                        Add a private note →
                      </button>
                    )}
                  </div>
                )}

                {idx < literacy.questions.length - 1 && (
                  <Separator className="opacity-15 mt-6" />
                )}
              </div>
            ))}
          </div>
        </div>
      </FadeInSection>

      {/* ── PART 3: Orientation ── */}
      <FadeInSection delay={0.05}>
        <div className="pb-16">
          <Separator className="mb-16 opacity-30" />
          <SectionHeading>If you'd like to explore further</SectionHeading>
          <p className="text-[16px] leading-[1.75] text-foreground/60 mb-10">
            {literacy.orientation}
          </p>

          <div className="flex justify-center">
            <button
              onClick={handleAddToPassport}
              disabled={addedToPassport}
              className={`px-6 py-3 rounded-full text-[13px] font-medium border transition-all duration-300 ${
                addedToPassport
                  ? "border-accent-foreground/30 text-accent-foreground/50 cursor-default"
                  : "border-accent-foreground/40 text-accent-foreground hover:bg-accent/30 active:scale-[0.97]"
              }`}
            >
              {addedToPassport ? (
                <motion.span
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                  Added to Body Passport ✓
                </motion.span>
              ) : (
                "Add this insight to my Body Passport"
              )}
            </button>
          </div>
        </div>
      </FadeInSection>

      {/* ── Closing disclaimer ── */}
      <FadeInSection delay={0.05}>
        <p className="text-[12px] text-muted-foreground/25 text-center pb-12 leading-relaxed">
          This is a reflection based on what you've recorded so far. It is not a medical assessment.
          Please work with a practitioner you trust for clinical guidance.
        </p>
      </FadeInSection>
    </div>
  );
};

export default AhaSoWhat;
