import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Share2, Copy, Check } from "lucide-react";

interface ShareFlowProps {
  open: boolean;
  onClose: () => void;
}

const ShareFlow = ({ open, onClose }: ShareFlowProps) => {
  const [copied, setCopied] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>(["timeline", "bodymap"]);

  const toggleItem = (item: string) => {
    setSelectedItems((prev) => prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]);
  };

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareItems = [
    { id: "timeline", label: "Timeline overview" },
    { id: "bodymap", label: "Body map snapshot" },
    { id: "treatments", label: "Treatment history" },
    { id: "notes", label: "Personal notes" },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
          <motion.div className="relative bg-card w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 shadow-elevated z-10"
            initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl flex items-center gap-2"><Share2 className="w-5 h-5" /> Share with practitioner</h2>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-secondary transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
              Choose what to include in your summary. Your practitioner will receive a read-only view — you stay in control.
            </p>

            <div className="space-y-2 mb-6">
              {shareItems.map((item) => (
                <label key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary cursor-pointer hover:bg-secondary/80 transition-all">
                  <div
                    onClick={() => toggleItem(item.id)}
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                      selectedItems.includes(item.id) ? "bg-primary border-primary" : "border-border"
                    }`}
                  >
                    {selectedItems.includes(item.id) && <Check className="w-3 h-3 text-primary-foreground" />}
                  </div>
                  <span className="text-sm text-foreground">{item.label}</span>
                </label>
              ))}
            </div>

            <button onClick={handleCopy}
              className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90">
              {copied ? <><Check className="w-4 h-4" /> Link copied</> : <><Copy className="w-4 h-4" /> Generate share link</>}
            </button>

            <p className="text-xs text-muted-foreground text-center mt-3">
              In a full version, this would create a secure, time-limited link.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShareFlow;
