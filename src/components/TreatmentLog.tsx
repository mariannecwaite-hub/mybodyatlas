import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp, TreatmentOutcome } from "@/context/AppContext";
import { X, Check, BookOpen } from "lucide-react";
import TreatmentGuide from "@/components/TreatmentGuide";

interface TreatmentLogProps {
  open: boolean;
  onClose: () => void;
}

const TreatmentLog = ({ open, onClose }: TreatmentLogProps) => {
  const { state, updateEvent } = useApp();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [entry, setEntry] = useState("");
  const [outcome, setOutcome] = useState<TreatmentOutcome>("not-sure");
  const [saved, setSaved] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const outcomeOptions: { value: TreatmentOutcome; label: string }[] = [
    { value: "helped", label: "This helped" },
    { value: "no-change", label: "No change" },
    { value: "worse", label: "Made things worse" },
    { value: "not-sure", label: "Not sure yet" },
  ];

  const ongoingEvents = state.events.filter((e) => e.ongoing);

  const handleSave = () => {
    if (!selectedEventId || !entry.trim()) return;
    const event = state.events.find((e) => e.id === selectedEventId);
    if (event) {
      updateEvent(selectedEventId, {
        treatment: event.treatment ? `${event.treatment}\n\n${new Date().toLocaleDateString()}: ${entry}` : `${new Date().toLocaleDateString()}: ${entry}`,
      });
    }
    setSaved(true);
    setTimeout(() => { setSaved(false); setEntry(""); setSelectedEventId(null); onClose(); }, 1200);
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="modal-overlay" onClick={onClose} />
            <motion.div className="modal-content max-w-md"
              initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}>
              <div className="modal-header">
                <h2 className="text-xl">Log treatment</h2>
                <button onClick={onClose} className="modal-close"><X className="w-5 h-5 text-muted-foreground" /></button>
              </div>

              {saved ? (
                <div className="text-center py-10 space-y-3">
                  <div className="mx-auto w-12 h-12 rounded-full bg-sage/50 flex items-center justify-center">
                    <Check className="w-5 h-5 text-sage-foreground" />
                  </div>
                  <p className="text-[13px] text-muted-foreground">Saved. Taking care matters.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  <div>
                    <label className="section-label mb-2.5 block">For which event?</label>
                    <div className="space-y-1.5">
                      {ongoingEvents.length === 0 && (
                        <p className="text-[13px] text-muted-foreground/50 py-6 text-center">No ongoing events yet.</p>
                      )}
                      {ongoingEvents.map((event) => (
                        <button key={event.id} onClick={() => setSelectedEventId(event.id)}
                          className={`w-full text-left p-3 rounded-xl text-[13px] transition-all duration-200 ${
                            selectedEventId === event.id ? "bg-primary text-primary-foreground" : "bg-secondary/70 text-foreground hover:bg-secondary"
                          }`}>
                          {event.title}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="section-label mb-2 block">What treatment or care?</label>
                    <textarea value={entry} onChange={(e) => setEntry(e.target.value)}
                      placeholder="e.g., Physio session — mobility exercises"
                      rows={3} className="field-input resize-none" />
                  </div>

                  {/* Treatment Guide link */}
                  <button
                    onClick={() => setShowGuide(true)}
                    className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl bg-sage/8 border border-sage/12 text-left hover:bg-sage/14 transition-all duration-200"
                  >
                    <BookOpen className="w-4 h-4 text-sage-foreground/40 flex-shrink-0" />
                    <div>
                      <p className="text-[12px] text-foreground/60">Not sure about a treatment?</p>
                      <p className="text-[10px] text-muted-foreground/35">Browse the Treatment Guide</p>
                    </div>
                  </button>

                  <button onClick={handleSave} disabled={!selectedEventId || !entry.trim()} className="btn-primary">
                    Save treatment log
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <TreatmentGuide open={showGuide} onClose={() => setShowGuide(false)} />
    </>
  );
};

export default TreatmentLog;
