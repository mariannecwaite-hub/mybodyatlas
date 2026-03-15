import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp, REGION_LABELS } from "@/context/AppContext";
import { X, Copy, Check, FileText, Link2, Sparkles } from "lucide-react";

interface ShareFlowProps { open: boolean; onClose: () => void; }

const ShareFlow = ({ open, onClose }: ShareFlowProps) => {
  const { visibleEvents } = useApp();
  const [copied, setCopied] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>(["timeline", "bodymap"]);
  const [questions, setQuestions] = useState("");
  const toggleItem = (item: string) => setSelectedItems((p) => p.includes(item) ? p.filter((i) => i !== item) : [...p, item]);

  const handleCopy = () => { setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const shareItems = [
    { id: "timeline", label: "Timeline highlights" },
    { id: "bodymap", label: "Body map snapshot" },
    { id: "treatments", label: "Treatments tried" },
    { id: "patterns", label: "Patterns worth noting" },
    { id: "notes", label: "Personal notes" },
    { id: "questions", label: "Questions for practitioner" },
  ];

  // Generate patterns summary
  const stressEvents = visibleEvents.filter((e) => e.type === "stress");
  const symptomEvents = visibleEvents.filter((e) => e.type === "symptom");
  const ongoingCount = visibleEvents.filter((e) => e.ongoing).length;
  const topRegions = Object.entries(
    visibleEvents.flatMap((e) => e.regions).reduce((acc, r) => { acc[r] = (acc[r] || 0) + 1; return acc; }, {} as Record<string, number>)
  ).sort((a, b) => b[1] - a[1]).slice(0, 3);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="modal-overlay" onClick={onClose} />
          <motion.div className="modal-content max-w-md"
            initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}>
            <div className="modal-header">
              <h2 className="text-xl">Create Body Story Summary</h2>
              <button onClick={onClose} className="modal-close"><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <p className="text-[13px] text-muted-foreground/70 mb-5 leading-relaxed">
              Create a summary to save for personal reflection, export as a report, or share with a practitioner you trust. Nothing leaves your device unless you choose.
            </p>

            {/* What to include */}
            <div className="space-y-1.5 mb-6">
              {shareItems.map((item) => (
                <label key={item.id} className="flex items-center gap-3 p-3.5 rounded-2xl bg-secondary/50 cursor-pointer hover:bg-secondary/70 transition-all duration-200">
                  <div onClick={() => toggleItem(item.id)}
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                      selectedItems.includes(item.id) ? "bg-primary border-primary" : "border-border"
                    }`}>
                    {selectedItems.includes(item.id) && <Check className="w-3 h-3 text-primary-foreground" />}
                  </div>
                  <span className="text-[13px] text-foreground/80">{item.label}</span>
                  {item.id === "patterns" && (
                    <span className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/8 border border-primary/10">
                      <Sparkles className="w-2.5 h-2.5 text-primary/40" />
                      <span className="text-[9px] font-medium text-primary/40 tracking-wider uppercase">Premium</span>
                    </span>
                  )}
                </label>
              ))}
            </div>

            {/* Patterns preview */}
            {selectedItems.includes("patterns") && (
              <div className="rounded-2xl p-4 bg-lavender/12 border border-lavender/20 mb-5">
                <p className="section-label mb-2 text-lavender-foreground/60">Patterns detected</p>
                <div className="space-y-1.5 text-[12px] text-muted-foreground/60">
                  {topRegions.length > 0 && (
                    <p>Most active areas: {topRegions.map(([r]) => REGION_LABELS[r as keyof typeof REGION_LABELS]?.toLowerCase()).join(", ")}</p>
                  )}
                  {stressEvents.length > 0 && symptomEvents.length > 0 && (
                    <p>Stress periods appear to coincide with physical sensations</p>
                  )}
                  {ongoingCount > 0 && (
                    <p>{ongoingCount} ongoing {ongoingCount === 1 ? "thread" : "threads"} currently active</p>
                  )}
                </div>
              </div>
            )}

            {/* Questions for practitioner */}
            {selectedItems.includes("questions") && (
              <div className="mb-5">
                <label className="section-label mb-2 block">Questions for your practitioner</label>
                <textarea
                  value={questions}
                  onChange={(e) => setQuestions(e.target.value)}
                  placeholder="e.g., Could my old ankle injury be related to my knee? Should I be concerned about the recurring tension in my neck?"
                  rows={3}
                  className="field-input resize-none"
                />
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2">
              <button onClick={handleCopy} className="btn-primary flex items-center justify-center gap-2">
                {copied ? <><Check className="w-4 h-4" /> Summary copied</> : <><Copy className="w-4 h-4" /> Copy summary text</>}
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-secondary/50 text-[12px] text-muted-foreground/60 hover:bg-secondary/70 transition-colors duration-200">
                  <FileText className="w-3.5 h-3.5" /> Export PDF
                </button>
                <button className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-secondary/50 text-[12px] text-muted-foreground/60 hover:bg-secondary/70 transition-colors duration-200">
                  <Link2 className="w-3.5 h-3.5" /> Share link
                </button>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground/40 text-center mt-4 leading-relaxed">
              Your body story belongs to you. Nothing is shared unless you choose to share it.
              <br />
              In a full version, export and temporary links would be fully functional.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShareFlow;
