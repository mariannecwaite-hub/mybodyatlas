import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { X, Plus, Check } from "lucide-react";

interface TreatmentLogProps {
  open: boolean;
  onClose: () => void;
}

const TreatmentLog = ({ open, onClose }: TreatmentLogProps) => {
  const { state, updateEvent } = useApp();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [entry, setEntry] = useState("");
  const [saved, setSaved] = useState(false);

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
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
          <motion.div className="relative bg-card w-full max-w-lg rounded-t-2xl sm:rounded-2xl p-6 shadow-elevated z-10"
            initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl">Log treatment</h2>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-secondary transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {saved ? (
              <div className="text-center py-8 space-y-3">
                <div className="mx-auto w-12 h-12 rounded-full bg-sage flex items-center justify-center">
                  <Check className="w-6 h-6 text-sage-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Saved. Taking care matters.</p>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">For which event?</label>
                  <div className="space-y-1.5">
                    {ongoingEvents.length === 0 && (
                      <p className="text-sm text-muted-foreground py-4 text-center">No ongoing events. Add an event first.</p>
                    )}
                    {ongoingEvents.map((event) => (
                      <button key={event.id} onClick={() => setSelectedEventId(event.id)}
                        className={`w-full text-left p-3 rounded-lg text-sm transition-all ${selectedEventId === event.id ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-secondary/80"}`}>
                        {event.title}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">What treatment or care?</label>
                  <textarea value={entry} onChange={(e) => setEntry(e.target.value)} placeholder="e.g., Physio session — focused on mobility exercises"
                    rows={3} className="w-full px-4 py-3 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground text-sm border-0 outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
                </div>

                <button onClick={handleSave} disabled={!selectedEventId || !entry.trim()}
                  className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-medium text-sm transition-all hover:opacity-90 disabled:opacity-40">
                  Save treatment log
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TreatmentLog;
