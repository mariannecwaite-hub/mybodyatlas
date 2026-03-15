import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check } from "lucide-react";

interface ShareFlowProps { open: boolean; onClose: () => void; }

const ShareFlow = ({ open, onClose }: ShareFlowProps) => {
  const [copied, setCopied] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>(["timeline", "bodymap"]);
  const toggleItem = (item: string) => setSelectedItems((p) => p.includes(item) ? p.filter((i) => i !== item) : [...p, item]);
  const handleCopy = () => { setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const shareItems = [
    { id: "timeline", label: "Timeline overview" },
    { id: "bodymap", label: "Body map snapshot" },
    { id: "treatments", label: "Treatment history" },
    { id: "notes", label: "Personal notes" },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="modal-overlay" onClick={onClose} />
          <motion.div className="modal-content max-w-md"
            initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}>
            <div className="modal-header">
              <h2 className="text-xl">Share with practitioner</h2>
              <button onClick={onClose} className="modal-close"><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <p className="text-[13px] text-muted-foreground/70 mb-5 leading-relaxed">
              Choose what to include. Your practitioner receives a read-only view — you stay in control.
            </p>
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
                </label>
              ))}
            </div>
            <button onClick={handleCopy} className="btn-primary flex items-center justify-center gap-2">
              {copied ? <><Check className="w-4 h-4" /> Link copied</> : <><Copy className="w-4 h-4" /> Generate share link</>}
            </button>
            <p className="text-[11px] text-muted-foreground/40 text-center mt-3">
              In a full version, this creates a secure, time-limited link.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShareFlow;
