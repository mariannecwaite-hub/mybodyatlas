import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { X, Lock, Heart } from "lucide-react";

interface LegacySettingsProps {
  open: boolean;
  onClose: () => void;
}

const LegacySettings = ({ open, onClose }: LegacySettingsProps) => {
  const { currentProfile } = useApp();
  const [legacyEnabled, setLegacyEnabled] = useState(false);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
          <motion.div className="relative bg-card w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 shadow-elevated z-10"
            initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl flex items-center gap-2"><Heart className="w-5 h-5" /> Body Legacy</h2>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-secondary transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-warm/40 mb-5">
              <p className="text-sm text-foreground leading-relaxed">
                Your body map tells a story. Legacy settings let you decide what happens to this record over time — whether it's passed to a child when they're ready, or kept as your own private archive.
              </p>
            </div>

            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 rounded-xl bg-secondary cursor-pointer">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Enable body legacy</p>
                    <p className="text-xs text-muted-foreground">Allow this record to be preserved or transferred</p>
                  </div>
                </div>
                <div
                  onClick={() => setLegacyEnabled(!legacyEnabled)}
                  className={`w-10 h-6 rounded-full transition-all relative cursor-pointer ${legacyEnabled ? "bg-primary" : "bg-border"}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-card shadow-sm transition-transform ${legacyEnabled ? "translate-x-[18px]" : "translate-x-0.5"}`} />
                </div>
              </label>

              {legacyEnabled && (
                <motion.div className="space-y-3" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                  {currentProfile?.type === "child" && (
                    <div className="p-4 rounded-xl bg-lavender/40">
                      <p className="text-sm font-medium text-foreground mb-1">Child handover</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        When {currentProfile.name} reaches {currentProfile.handoverAge || 16}, they'll be invited to take ownership of their body map. You'll be able to review what's included before the handover.
                      </p>
                    </div>
                  )}

                  <div className="p-4 rounded-xl bg-sage/40">
                    <p className="text-sm font-medium text-foreground mb-1">Data preservation</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      In a full version, you could designate a trusted person to receive access to your body map records.
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
