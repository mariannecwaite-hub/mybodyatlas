import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp, EventType, BodyRegion, EventSeverity, TreatmentOutcome, REGION_LABELS } from "@/context/AppContext";
import { X } from "lucide-react";

const eventTypes: { type: EventType; label: string; icon: string }[] = [
  { type: "injury", label: "Injury", icon: "🩹" },
  { type: "symptom", label: "Symptom", icon: "💭" },
  { type: "stress", label: "Stress", icon: "🌊" },
  { type: "treatment", label: "Treatment", icon: "🌿" },
  { type: "life-event", label: "Life event", icon: "⭐" },
];

const allRegions: BodyRegion[] = [
  "head_jaw", "neck", "shoulder_left", "shoulder_right",
  "chest", "upper_back", "abdomen", "lower_back",
  "wrist_hand_left", "wrist_hand_right",
  "hip_left", "hip_right",
  "knee_left", "knee_right",
  "ankle_foot_left", "ankle_foot_right",
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
  const [treatmentOutcome, setTreatmentOutcome] = useState<TreatmentOutcome>("not-sure");

  const outcomeOptions: { value: TreatmentOutcome; label: string }[] = [
    { value: "helped", label: "This helped" },
    { value: "no-change", label: "No change" },
    { value: "worse", label: "Made things worse" },
    { value: "not-sure", label: "Not sure yet" },
  ];

  const toggleRegion = (r: BodyRegion) => {
    setRegions((prev) => prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]);
  };

  const handleSubmit = () => {
    if (!title.trim()) return;
    addEvent({
      type, title, description, regions, date, severity, ongoing,
      notes: notes || undefined,
      treatment: treatment || undefined,
      treatmentOutcome: type === "treatment" ? treatmentOutcome : undefined,
    });
    onClose();
    setTitle(""); setDescription(""); setRegions([]); setNotes(""); setTreatment(""); setTreatmentOutcome("not-sure");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="modal-backdrop"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="modal-overlay" onClick={onClose} />
          <motion.div className="modal-content"
            initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}>

            <div className="modal-header">
              <h2 className="text-xl">Add an event</h2>
              <button onClick={onClose} className="modal-close">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="section-label mb-2.5 block">What kind?</label>
                <div className="flex flex-wrap gap-2">
                  {eventTypes.map((et) => (
                    <button key={et.type} onClick={() => setType(et.type)}
                      className={`chip ${type === et.type ? "chip-active" : "chip-inactive"}`}>
                      <span className="text-sm">{et.icon}</span> {et.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="section-label mb-2 block">What happened?</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Lower back tension" className="field-input" />
              </div>

              <div>
                <label className="section-label mb-2 block">More detail <span className="normal-case font-normal text-muted-foreground/50">optional</span></label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder="Any details you'd like to remember..." rows={2} className="field-input resize-none" />
              </div>

              <div>
                <label className="section-label mb-2.5 block">Where on your body?</label>
                <div className="flex flex-wrap gap-1.5">
                  {allRegions.map((r) => (
                    <button key={r} onClick={() => toggleRegion(r)}
                      className={`chip text-[11px] ${regions.includes(r) ? "chip-active" : "chip-inactive"}`}>
                      {REGION_LABELS[r]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="section-label mb-2 block">When</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="field-input" />
                </div>
                <div>
                  <label className="section-label mb-2 block">Intensity</label>
                  <div className="flex gap-1">
                    {(["mild", "moderate", "significant"] as EventSeverity[]).map((s) => (
                      <button key={s} onClick={() => setSeverity(s)}
                        className={`flex-1 py-2.5 rounded-xl text-[11px] font-medium capitalize transition-all duration-200 ${
                          severity === s ? "bg-primary text-primary-foreground" : "bg-secondary/70 text-muted-foreground hover:bg-secondary"
                        }`}>{s}</button>
                    ))}
                  </div>
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer py-1">
                <div onClick={() => setOngoing(!ongoing)}
                  className={`w-11 h-[26px] rounded-full transition-all duration-300 relative ${ongoing ? "bg-primary" : "bg-border"}`}>
                  <div className={`absolute top-[3px] w-5 h-5 rounded-full bg-card transition-transform duration-300 ${ongoing ? "translate-x-[22px]" : "translate-x-[3px]"}`}
                    style={{ boxShadow: "var(--shadow-xs)" }} />
                </div>
                <span className="text-[13px] text-foreground/80">Still ongoing</span>
              </label>

              {type === "treatment" && (
                <div>
                  <label className="section-label mb-2 block">Treatment details</label>
                  <textarea value={treatment} onChange={(e) => setTreatment(e.target.value)}
                    placeholder="What treatment did you receive?" rows={2} className="field-input resize-none" />
                </div>
              )}

              <div>
                <label className="section-label mb-2 block">Personal notes <span className="normal-case font-normal text-muted-foreground/50">optional</span></label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                  placeholder="Anything else you'd like to note..." rows={2} className="field-input resize-none" />
              </div>

              <button onClick={handleSubmit} disabled={!title.trim()} className="btn-primary">
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
