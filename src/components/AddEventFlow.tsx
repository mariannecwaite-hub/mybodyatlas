import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp, EventType, BodyRegion, EventSeverity, TreatmentOutcome, REGION_LABELS } from "@/context/AppContext";
import { X } from "lucide-react";
import { toast } from "sonner";

const eventTypes: { type: EventType; label: string; icon: string }[] = [
  { type: "injury", label: "Injury", icon: "🩹" },
  { type: "symptom", label: "Sensation", icon: "💭" },
  { type: "stress", label: "Stress", icon: "🌊" },
  { type: "treatment", label: "Treatment", icon: "🌿" },
  { type: "life-event", label: "Life event", icon: "⭐" },
  { type: "safety-experience", label: "An experience that affected how safe you felt in your body", icon: "" },
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

  const isSafetyExperience = type === "safety-experience";
  const actualType: EventType = isSafetyExperience ? "life-event" : type;

  const handleSubmit = () => {
    if (!title.trim() && !isSafetyExperience) return;
    const eventTitle = isSafetyExperience && !title.trim() ? "An experience that affected how safe I felt in my body" : title;
    addEvent({
      type: actualType, title: eventTitle, description, regions: isSafetyExperience && regions.length === 0 ? [] : regions, date, severity, ongoing,
      notes: notes || undefined,
      treatment: treatment || undefined,
      treatmentOutcome: actualType === "treatment" ? treatmentOutcome : undefined,
      isPrivate: isSafetyExperience ? true : undefined,
    });

    // Contextual acknowledgement toasts
    const eventDate = new Date(date);
    const yearsOngoing = ongoing ? Math.max(0, (new Date().getFullYear() - eventDate.getFullYear())) : 0;

    if (isSafetyExperience) {
      // No toast — the in-form acknowledgement is enough
    } else if (actualType === "stress") {
      toast(
        "Stress often leaves traces in the body — sometimes immediately, sometimes months later. Your record will hold this.",
        { duration: 4000, className: "font-sans italic text-[14px]", style: { color: "#6B6960" } }
      );
    } else if (actualType === "life-event") {
      toast(
        "Major transitions ask a lot of the body — even the joyful ones. It's worth having this in your record.",
        { duration: 4000, className: "font-sans italic text-[14px]", style: { color: "#6B6960" } }
      );
    } else if (yearsOngoing >= 2) {
      toast(
        "Your body has been carrying this for a while. That matters.",
        { duration: 4000, className: "font-sans italic text-[14px]", style: { color: "#6B6960" } }
      );
    } else if (actualType === "treatment" && treatmentOutcome === "helped") {
      toast(
        "Your body remembered what worked. Now your record will too.",
        { duration: 4000, className: "font-sans italic text-[14px]", style: { color: "#6B6960" } }
      );
    }

    onClose();
    setTitle(""); setDescription(""); setRegions([]); setNotes(""); setTreatment(""); setTreatmentOutcome("not-sure"); setType("symptom");
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
              {/* Safety experience acknowledgement */}
              {isSafetyExperience && (
                <motion.p
                  className="text-[16px] italic leading-[1.75] text-center max-w-sm mx-auto"
                  style={{ color: "#6B6960", fontFamily: "'DM Serif Display', serif" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  These experiences can have lasting effects on the body and nervous system. You only need to record what feels right. You can be as specific or as general as you choose — or simply mark that it happened.
                </motion.p>
              )}

              <div>
                <label className="section-label mb-2.5 block">What kind?</label>
                <div className="flex flex-wrap gap-2">
                  {eventTypes.map((et) => (
                    <button key={et.type} onClick={() => setType(et.type)}
                      className={`chip ${type === et.type ? "chip-active" : "chip-inactive"} ${et.type === "safety-experience" ? "text-[11px] col-span-2" : ""}`}>
                      {et.icon && <span className="text-sm">{et.icon}</span>} {et.label}
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
                  placeholder={isSafetyExperience ? "Whatever you want to record..." : "Any details you'd like to remember..."} rows={2} className="field-input resize-none" />
              </div>

              <div>
                <label className="section-label mb-2.5 block">Where on your body?</label>
                <div className="flex flex-wrap gap-1.5">
                  {isSafetyExperience && (
                    <button
                      onClick={() => setRegions([])}
                      className={`chip text-[11px] ${regions.length === 0 ? "chip-active" : "chip-inactive"}`}
                    >
                      Whole body
                    </button>
                  )}
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

              {type === "treatment" && (
                <div>
                  <label className="section-label mb-2.5 block">How did it go?</label>
                  <div className="flex flex-wrap gap-2">
                    {outcomeOptions.map((opt) => (
                      <button key={opt.value} onClick={() => setTreatmentOutcome(opt.value)}
                        className={`chip ${treatmentOutcome === opt.value ? "chip-active" : "chip-inactive"}`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
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
