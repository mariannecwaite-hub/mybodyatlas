import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { X, Palette } from "lucide-react";

interface BodyCustomisationProps {
  open: boolean;
  onClose: () => void;
}

const skinTones = ["🏻", "🏼", "🏽", "🏾", "🏿"];
const bodyTypes = ["Slim", "Average", "Athletic", "Curvy"];

const BodyCustomisation = ({ open, onClose }: BodyCustomisationProps) => {
  const [selectedTone, setSelectedTone] = useState(1);
  const [selectedBody, setSelectedBody] = useState("Average");

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
          <motion.div className="relative bg-card w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 shadow-elevated z-10"
            initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl flex items-center gap-2"><Palette className="w-5 h-5" /> Customise your body</h2>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-secondary transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3 block">Skin tone</label>
                <div className="flex gap-3">
                  {skinTones.map((tone, i) => (
                    <button key={i} onClick={() => setSelectedTone(i)}
                      className={`w-10 h-10 rounded-full text-xl flex items-center justify-center transition-all ${
                        selectedTone === i ? "ring-2 ring-primary ring-offset-2 ring-offset-card" : "hover:scale-110"
                      }`}>
                      ✋{tone}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3 block">Body type</label>
                <div className="flex gap-2">
                  {bodyTypes.map((type) => (
                    <button key={type} onClick={() => setSelectedBody(type)}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        selectedBody === type ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                      }`}>
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                In a full version, the body map visual would update to reflect your choices.
              </p>

              <button onClick={onClose}
                className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-medium text-sm">
                Save preferences
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BodyCustomisation;
