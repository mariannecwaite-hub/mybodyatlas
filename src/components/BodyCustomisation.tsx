import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface BodyCustomisationProps { open: boolean; onClose: () => void; }

const skinTones = ["🏻", "🏼", "🏽", "🏾", "🏿"];
const bodyTypes = ["Slim", "Average", "Athletic", "Curvy"];

const BodyCustomisation = ({ open, onClose }: BodyCustomisationProps) => {
  const [selectedTone, setSelectedTone] = useState(1);
  const [selectedBody, setSelectedBody] = useState("Average");

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="modal-overlay" onClick={onClose} />
          <motion.div className="modal-content max-w-md"
            initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}>
            <div className="modal-header">
              <h2 className="text-xl">Customise your body</h2>
              <button onClick={onClose} className="modal-close"><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>

            <div className="space-y-7">
              <div>
                <label className="section-label mb-3 block">Skin tone</label>
                <div className="flex gap-3">
                  {skinTones.map((tone, i) => (
                    <button key={i} onClick={() => setSelectedTone(i)}
                      className={`w-11 h-11 rounded-full text-xl flex items-center justify-center transition-all duration-200 ${
                        selectedTone === i ? "ring-2 ring-primary/50 ring-offset-2 ring-offset-card scale-110" : "hover:scale-105"
                      }`}>
                      ✋{tone}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="section-label mb-3 block">Body type</label>
                <div className="flex gap-2">
                  {bodyTypes.map((type) => (
                    <button key={type} onClick={() => setSelectedBody(type)}
                      className={`flex-1 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                        selectedBody === type ? "bg-primary text-primary-foreground" : "bg-secondary/70 text-muted-foreground hover:bg-secondary"
                      }`}>{type}</button>
                  ))}
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground/40 text-center">
                Body map visual would update to reflect your choices in a full version.
              </p>

              <button onClick={onClose} className="btn-primary">Save preferences</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BodyCustomisation;
