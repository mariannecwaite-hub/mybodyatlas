import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp, EventType, BodyRegion, EventSeverity } from "@/context/AppContext";
import { X } from "lucide-react";

const eventTypes: { type: EventType; label: string; icon: string }[] = [
  { type: "injury", label: "Injury", icon: "🩹" },
  { type: "symptom", label: "Symptom", icon: "💭" },
  { type: "stress", label: "Stress period", icon: "🌊" },
  { type: "treatment", label: "Treatment", icon: "🌿" },
  { type: "life-event", label: "Life event", icon: "⭐" },
];

const bodyRegions: { id: BodyRegion; label: string }[] = [
  { id: "head", label: "Head" }, { id: "neck", label: "Neck" },
  { id: "left-shoulder", label: "Left shoulder" }, { id: "right-shoulder", label: "Right shoulder" },
  { id: "chest", label: "Chest" }, { id: "upper-back", label: "Upper back" },
  { id: "left-arm", label: "Left arm" }, { id: "right-arm", label: "Right arm" },
  { id: "abdomen", label: "Abdomen" }, { id: "lower-back", label: "Lower back" },
  { id: "left-hip", label: "Left hip" }, { id: "right-hip", label: "Right hip" },
  { id: "left-leg", label: "Left leg" }, { id: "right-leg", label: "Right leg" },
  { id: "left-knee", label: "Left knee" }, { id: "right-knee", label: "Right knee" },
  { id: "left-foot", label: "Left foot" }, { id: "right-foot", label: "Right foot" },
];

interface AddEventFlowProps {
  open: boolean;
  onClose: () => void;
  preselectedRegion?: BodyRegion;
}

const AddEventFlow = ({ open, onClose, preselectedRegion }: AddEventFlowProps) => {
  const { addEvent } = useApp();
  const [type, setType] = useState<EventType>("symptom");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [regions, setRegions] = useState<BodyRegion[]>(preselectedRegion ? [preselectedRegion] : []);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [severity, setSeverity] = useState<EventSeverity>("mild");
  const [ongoing, setOngoing] = useState(false);
  const [notes, setNotes] = useState("");
  const [treatment, setTreatment] = useState("");

  const toggleRegion = (r: BodyRegion) => {
    setRegions((prev) => prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]);
  };

  const handleSubmit = () => {
    if (!title.trim()) return;
    addEvent({ type, title, description, regions, date, severity, ongoing, notes: notes || undefined, treatment: treatment || undefined });
    onClose();
    // Reset
    setTitle(""); setDescription(""); setRegions([]); setNotes(""); setTreatment("");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className="relative bg-card w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl p-6 shadow-elevated z-10"
            initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl">Add an event</h2>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-secondary transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Event type */}
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Type</label>
                <div className="flex flex-wrap gap-2">
                  {eventTypes.map((et) => (
                    <button
                      key={et.type}
                      onClick={() => setType(et.type)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all ${
                        type === et.type ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                    >
                      <span>{et.icon}</span> {et.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">What happened?</label>
                <input
                  value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Lower back tension"
                  className="w-full px-4 py-3 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground text-sm border-0 outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Tell us more (optional)</label>
                <textarea
                  value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder="Any details you'd like to remember..."
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground text-sm border-0 outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              {/* Body regions */}
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Body areas</label>
                <div className="flex flex-wrap gap-1.5">
                  {bodyRegions.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => toggleRegion(r.id)}
                      className={`px-2.5 py-1 rounded-full text-xs transition-all ${
                        regions.includes(r.id) ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date + Severity */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">When</label>
                  <input
                    type="date" value={date} onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-secondary text-foreground text-sm border-0 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Severity</label>
                  <div className="flex gap-1">
                    {(["mild", "moderate", "significant"] as EventSeverity[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => setSeverity(s)}
                        className={`flex-1 py-2.5 rounded-lg text-xs font-medium capitalize transition-all ${
                          severity === s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Ongoing toggle */}
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => setOngoing(!ongoing)}
                  className={`w-10 h-6 rounded-full transition-all relative ${ongoing ? "bg-primary" : "bg-border"}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-card shadow-sm transition-transform ${ongoing ? "translate-x-[18px]" : "translate-x-0.5"}`} />
                </div>
                <span className="text-sm text-foreground">Still ongoing</span>
              </label>

              {/* Treatment (if type is treatment) */}
              {type === "treatment" && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Treatment details</label>
                  <textarea
                    value={treatment} onChange={(e) => setTreatment(e.target.value)}
                    placeholder="What treatment did you receive?"
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground text-sm border-0 outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Personal notes (optional)</label>
                <textarea
                  value={notes} onChange={(e) => setNotes(e.target.value)}
                  placeholder="Anything else you'd like to note..."
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground text-sm border-0 outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={!title.trim()}
                className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-medium text-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40"
              >
                Save event
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddEventFlow;
