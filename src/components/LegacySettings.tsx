import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { X, Lock } from "lucide-react";

interface LegacySettingsProps { open: boolean; onClose: () => void; }

const LegacySettings = ({ open, onClose }: LegacySettingsProps) => {
  const { currentProfile } = useApp();
  const [legacyEnabled, setLegacyEnabled] = useState(false);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="modal-overlay" onClick={onClose} />
          <motion.div className="modal-content max-w-md"
            initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}>
            <div className="modal-header">
              <h2 className="text-xl">Body Legacy</h2>
              <button onClick={onClose} className="modal-close"><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>

            <div className="p-4 rounded-2xl bg-warm/25 border border-warm/30 mb-6">
              <p className="text-[13px] text-foreground/75 leading-relaxed">
                Your body map tells a story. Legacy settings let you decide what happens to this record over time.
              </p>
            </div>

            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 rounded-2xl bg-secondary/50 cursor-pointer">
                <div className="flex items-center gap-3">
                  <Lock className="w-4 h-4 text-muted-foreground/60" />
                  <div>
                    <p className="text-[13px] font-medium text-foreground">Enable body legacy</p>
                    <p className="text-[11px] text-muted-foreground/60">Preserve or transfer this record</p>
                  </div>
                </div>
                <div onClick={() => setLegacyEnabled(!legacyEnabled)}
                  className={`w-11 h-[26px] rounded-full transition-all duration-300 relative cursor-pointer ${legacyEnabled ? "bg-primary" : "bg-border"}`}>
                  <div className={`absolute top-[3px] w-5 h-5 rounded-full bg-card transition-transform duration-300 ${legacyEnabled ? "translate-x-[22px]" : "translate-x-[3px]"}`}
                    style={{ boxShadow: "var(--shadow-xs)" }} />
                </div>
              </label>

              {legacyEnabled && (
                <motion.div className="space-y-3" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                  {currentProfile?.type === "child" && (
                    <div className="p-4 rounded-2xl bg-lavender/25 border border-lavender/30">
                      <p className="text-[13px] font-medium text-foreground/85 mb-1">Child handover</p>
                      <p className="text-[12px] text-muted-foreground/60 leading-relaxed">
                        When {currentProfile.name} reaches {currentProfile.handoverAge || 16}, they'll be invited to take ownership of their body map.
                      </p>
                    </div>
                  )}
                  <div className="p-4 rounded-2xl bg-sage/25 border border-sage/30">
                    <p className="text-[13px] font-medium text-foreground/85 mb-1">Data preservation</p>
                    <p className="text-[12px] text-muted-foreground/60 leading-relaxed">
                      Designate a trusted person to receive access to your body map records.
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LegacySettings;
