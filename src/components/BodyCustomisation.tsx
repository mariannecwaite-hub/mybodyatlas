import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface BodyCustomisationProps { open: boolean; onClose: () => void; }

interface BodyOption {
  id: string;
  label: string;
  description: string;
}

const bodyOptions: BodyOption[] = [
  { id: "limb_upper_left", label: "Upper limb difference — left", description: "Adjusts the left arm area of your body map" },
  { id: "limb_upper_right", label: "Upper limb difference — right", description: "Adjusts the right arm area of your body map" },
  { id: "limb_lower_left", label: "Lower limb difference — left", description: "Adjusts the left leg area of your body map" },
  { id: "limb_lower_right", label: "Lower limb difference — right", description: "Adjusts the right leg area of your body map" },
  { id: "prosthetic_upper_left", label: "Prosthetic — left arm", description: "Indicates a prosthetic on the left arm" },
  { id: "prosthetic_upper_right", label: "Prosthetic — right arm", description: "Indicates a prosthetic on the right arm" },
  { id: "prosthetic_lower_left", label: "Prosthetic — left leg", description: "Indicates a prosthetic on the left leg" },
  { id: "prosthetic_lower_right", label: "Prosthetic — right leg", description: "Indicates a prosthetic on the right leg" },
  { id: "short_stature", label: "Short stature", description: "Adjusts body proportions" },
];

const BodyCustomisation = ({ open, onClose }: BodyCustomisationProps) => {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="modal-overlay" onClick={onClose} />
          <motion.div className="modal-content max-w-md"
            initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}>
            <div className="modal-header">
              <h2 className="text-xl">Customise your body map</h2>
              <button onClick={onClose} className="modal-close"><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>

            <div className="p-4 rounded-2xl bg-warm/18 border border-warm/20 mb-6">
              <p className="text-[13px] text-foreground/70 leading-relaxed">
                These options are entirely optional. They help your body map reflect your body more closely — nothing more. You can change them at any time.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <p className="section-label mb-3">Limb differences</p>
                <div className="space-y-1.5">
                  {bodyOptions.filter((o) => o.id.startsWith("limb")).map((option) => (
                    <label key={option.id} className="flex items-start gap-3 p-3.5 rounded-2xl bg-secondary/40 cursor-pointer hover:bg-secondary/60 transition-all duration-200">
                      <div
                        onClick={() => toggle(option.id)}
                        className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                          selected.includes(option.id) ? "bg-primary border-primary" : "border-border"
                        }`}
                      >
                        {selected.includes(option.id) && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="hsl(var(--primary-foreground))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        )}
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-foreground/80">{option.label}</p>
                        <p className="text-[11px] text-muted-foreground/50 mt-0.5">{option.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className="section-label mb-3">Prosthetic indication</p>
                <div className="space-y-1.5">
                  {bodyOptions.filter((o) => o.id.startsWith("prosthetic")).map((option) => (
                    <label key={option.id} className="flex items-start gap-3 p-3.5 rounded-2xl bg-secondary/40 cursor-pointer hover:bg-secondary/60 transition-all duration-200">
                      <div
                        onClick={() => toggle(option.id)}
                        className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                          selected.includes(option.id) ? "bg-primary border-primary" : "border-border"
                        }`}
                      >
                        {selected.includes(option.id) && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="hsl(var(--primary-foreground))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        )}
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-foreground/80">{option.label}</p>
                        <p className="text-[11px] text-muted-foreground/50 mt-0.5">{option.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className="section-label mb-3">Stature</p>
                <div className="space-y-1.5">
                  {bodyOptions.filter((o) => o.id === "short_stature").map((option) => (
                    <label key={option.id} className="flex items-start gap-3 p-3.5 rounded-2xl bg-secondary/40 cursor-pointer hover:bg-secondary/60 transition-all duration-200">
                      <div
                        onClick={() => toggle(option.id)}
                        className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                          selected.includes(option.id) ? "bg-primary border-primary" : "border-border"
                        }`}
                      >
                        {selected.includes(option.id) && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="hsl(var(--primary-foreground))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        )}
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-foreground/80">{option.label}</p>
                        <p className="text-[11px] text-muted-foreground/50 mt-0.5">{option.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground/40 text-center">
                In a full version, your body map visual would update to reflect these choices.
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
