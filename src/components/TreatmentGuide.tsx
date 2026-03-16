import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, BookOpen, Search } from "lucide-react";
import { treatments, treatmentCategories } from "@/data/treatmentGuideData";
import type { TreatmentGuideEntry } from "@/data/treatmentGuideData";

interface TreatmentGuideProps {
  open: boolean;
  onClose: () => void;
  initialTreatmentId?: string | null;
}

const TreatmentGuide = ({ open, onClose, initialTreatmentId }: TreatmentGuideProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(initialTreatmentId || null);
  const [search, setSearch] = useState("");
  const selected = treatments.find((t) => t.id === selectedId);

  useEffect(() => {
    if (open && initialTreatmentId) setSelectedId(initialTreatmentId);
  }, [open, initialTreatmentId]);

  const handleClose = () => {
    setSelectedId(null);
    setSearch("");
    onClose();
  };

  const filtered = search.trim()
    ? treatments.filter(
        (t) =>
          t.name.toLowerCase().includes(search.toLowerCase()) ||
          t.category.toLowerCase().includes(search.toLowerCase()) ||
          t.description.toLowerCase().includes(search.toLowerCase())
      )
    : treatments;

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="modal-overlay" onClick={handleClose} />
          <motion.div
            className="modal-content max-w-md max-h-[85vh] overflow-y-auto"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
          >
            <div className="modal-header sticky top-0 bg-card z-10 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-sage-foreground/50" />
                <h2 className="text-xl">{selected ? selected.name : "Explore Care Approaches"}</h2>
              </div>
              <button onClick={handleClose} className="modal-close">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <AnimatePresence mode="wait">
              {!selected ? (
                <motion.div
                  key="list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="text-[13px] text-muted-foreground/55 mb-4 leading-relaxed">
                    Plain-language descriptions of common care approaches. Neutral and educational — not a recommendation.
                  </p>

                  {/* Search */}
                  <div className="relative mb-5">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/30" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search approaches…"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-secondary/50 border border-border/20 text-[13px] text-foreground/80 placeholder:text-muted-foreground/30 focus:outline-none focus:border-border/40 transition-colors"
                    />
                  </div>

                  {/* Grouped by category */}
                  {(search.trim() ? [...new Set(filtered.map((t) => t.category))] : treatmentCategories).map((category) => {
                    const items = filtered.filter((t) => t.category === category);
                    if (items.length === 0) return null;
                    return (
                      <div key={category} className="mb-5">
                        <p className="section-label mb-2">{category}</p>
                        <div className="space-y-1.5">
                          {items.map((t) => (
                            <button
                              key={t.id}
                              onClick={() => { setSelectedId(t.id); setSearch(""); }}
                              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-secondary/40 border border-border/15 hover:bg-secondary/60 transition-all duration-200 text-left group"
                            >
                              <div className="min-w-0">
                                <p className="text-[13px] font-medium text-foreground/75 group-hover:text-foreground/90 transition-colors">
                                  {t.name}
                                </p>
                                <p className="text-[11px] text-muted-foreground/40 mt-0.5 line-clamp-1">
                                  {t.description.slice(0, 70)}…
                                </p>
                              </div>
                              <ChevronRight className="w-4 h-4 text-muted-foreground/25 group-hover:text-muted-foreground/45 flex-shrink-0 ml-2 transition-colors" />
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {filtered.length === 0 && (
                    <p className="text-[13px] text-muted-foreground/40 text-center py-8">No approaches match your search.</p>
                  )}

                  <p className="text-[10px] text-muted-foreground/30 text-center mt-4 leading-relaxed">
                    For treatment literacy, not medical advice. Always consult a qualified practitioner.
                  </p>
                </motion.div>
              ) : (
                <TreatmentDetail treatment={selected} onBack={() => setSelectedId(null)} />
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

function TreatmentDetail({ treatment, onBack }: { treatment: TreatmentGuideEntry; onBack: () => void }) {
  return (
    <motion.div
      key="detail"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.25 }}
      className="space-y-5"
    >
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-[12px] text-muted-foreground/45 hover:text-muted-foreground/65 transition-colors mb-2"
      >
        <ChevronLeft className="w-3.5 h-3.5" /> All approaches
      </button>

      <div className="inline-block px-2.5 py-1 rounded-full bg-sage/15 text-[10px] text-sage-foreground/60 font-medium">
        {treatment.category}
      </div>

      <div>
        <p className="text-[13px] text-foreground/70 leading-relaxed">{treatment.description}</p>
      </div>

      <div>
        <p className="section-label mb-2">Common situations</p>
        <div className="space-y-1.5">
          {treatment.situations.map((s, i) => (
            <div key={i} className="flex items-start gap-2.5 py-1">
              <div className="w-1.5 h-1.5 rounded-full bg-sage/50 mt-1.5 flex-shrink-0" />
              <p className="text-[12px] text-muted-foreground/55 leading-relaxed">{s}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl p-4 bg-secondary/40 border border-border/15">
        <p className="section-label mb-1.5">Practitioner</p>
        <p className="text-[12px] text-foreground/65 leading-relaxed">{treatment.practitioner}</p>
      </div>

      <div className="rounded-2xl p-4 bg-warm/10 border border-warm/15">
        <p className="section-label mb-1.5 text-warm-foreground/60">Approach</p>
        <p className="text-[12px] text-foreground/65 leading-relaxed">{treatment.approach}</p>
      </div>

      <div className="rounded-xl p-3.5 bg-lavender/8 border border-lavender/12">
        <p className="text-[11px] text-muted-foreground/40 leading-relaxed italic">
          This is a general overview for understanding purposes. Individual experiences vary.
          Always discuss treatment options with a qualified healthcare professional.
        </p>
      </div>
    </motion.div>
  );
}

export { treatments as treatmentGuideData };
export type { TreatmentGuideEntry };
export default TreatmentGuide;
