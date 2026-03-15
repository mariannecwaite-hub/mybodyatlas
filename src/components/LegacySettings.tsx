import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { X, Lock, Heart, Users, FileText, MessageSquare } from "lucide-react";

interface LegacySettingsProps { open: boolean; onClose: () => void; }

const LegacySettings = ({ open, onClose }: LegacySettingsProps) => {
  const { currentProfile } = useApp();
  const [legacyEnabled, setLegacyEnabled] = useState(false);
  const [preserveForFamily, setPreserveForFamily] = useState(false);
  const [anonymisedResearch, setAnonymisedResearch] = useState(false);
  const [organDonor, setOrganDonor] = useState(false);
  const [futureMessage, setFutureMessage] = useState("");

  const ToggleSwitch = ({ value, onToggle }: { value: boolean; onToggle: () => void }) => (
    <div onClick={onToggle}
      className={`w-11 h-[26px] rounded-full transition-all duration-300 relative cursor-pointer flex-shrink-0 ${value ? "bg-primary" : "bg-border"}`}>
      <div className={`absolute top-[3px] w-5 h-5 rounded-full bg-card transition-transform duration-300 ${value ? "translate-x-[22px]" : "translate-x-[3px]"}`}
        style={{ boxShadow: "var(--shadow-xs)" }} />
    </div>
  );

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
                Your body map tells a story. Legacy settings let you decide what happens to this record over time. Everything here is optional and fully in your control.
              </p>
            </div>

            <div className="space-y-4">
              {/* Main enable toggle */}
              <label className="flex items-center justify-between p-4 rounded-2xl bg-secondary/50 cursor-pointer">
                <div className="flex items-center gap-3">
                  <Lock className="w-4 h-4 text-muted-foreground/60" />
                  <div>
                    <p className="text-[13px] font-medium text-foreground">Enable body legacy</p>
                    <p className="text-[11px] text-muted-foreground/60">Preserve or transfer this record</p>
                  </div>
                </div>
                <ToggleSwitch value={legacyEnabled} onToggle={() => setLegacyEnabled(!legacyEnabled)} />
              </label>

              {legacyEnabled && (
                <motion.div className="space-y-3" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                  {/* Child handover */}
                  {currentProfile?.type === "child" && (
                    <div className="p-4 rounded-2xl bg-lavender/25 border border-lavender/30">
                      <p className="text-[13px] font-medium text-foreground/85 mb-1">Future ownership</p>
                      <p className="text-[12px] text-muted-foreground/60 leading-relaxed mb-3">
                        When {currentProfile.name} reaches {currentProfile.handoverAge || 16}, they'll be invited to take ownership of their body map.
                      </p>
                      <div className="space-y-2">
                        <button className="w-full text-left p-3 rounded-xl bg-card/60 border border-border/20 text-[12px] text-foreground/70 hover:bg-card transition-colors duration-200">
                          <FileText className="w-3.5 h-3.5 inline mr-2 text-muted-foreground/40" />
                          Prepare handover summary
                        </button>
                        <button className="w-full text-left p-3 rounded-xl bg-card/60 border border-border/20 text-[12px] text-foreground/70 hover:bg-card transition-colors duration-200">
                          <FileText className="w-3.5 h-3.5 inline mr-2 text-muted-foreground/40" />
                          Export record
                        </button>
                        <button className="w-full text-left p-3 rounded-xl bg-card/60 border border-border/20 text-[12px] text-muted-foreground/40 hover:bg-card transition-colors duration-200">
                          <Users className="w-3.5 h-3.5 inline mr-2" />
                          Transfer ownership (simulated)
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Preserve for family */}
                  <label className="flex items-center justify-between p-4 rounded-2xl bg-secondary/40 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4 text-muted-foreground/50" />
                      <div>
                        <p className="text-[13px] font-medium text-foreground/80">Preserve for family</p>
                        <p className="text-[11px] text-muted-foreground/50">Designate a trusted person to receive your body history</p>
                      </div>
                    </div>
                    <ToggleSwitch value={preserveForFamily} onToggle={() => setPreserveForFamily(!preserveForFamily)} />
                  </label>

                  {/* Anonymised research */}
                  <label className="flex items-center justify-between p-4 rounded-2xl bg-secondary/40 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-muted-foreground/50" />
                      <div>
                        <p className="text-[13px] font-medium text-foreground/80">Share anonymised data for research</p>
                        <p className="text-[11px] text-muted-foreground/50">Help improve understanding of body patterns</p>
                      </div>
                    </div>
                    <ToggleSwitch value={anonymisedResearch} onToggle={() => setAnonymisedResearch(!anonymisedResearch)} />
                  </label>

                  {/* Organ donor */}
                  <label className="flex items-center justify-between p-4 rounded-2xl bg-secondary/40 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Heart className="w-4 h-4 text-muted-foreground/50" />
                      <div>
                        <p className="text-[13px] font-medium text-foreground/80">Record organ donor preference</p>
                        <p className="text-[11px] text-muted-foreground/50">A personal note — not a legal document</p>
                      </div>
                    </div>
                    <ToggleSwitch value={organDonor} onToggle={() => setOrganDonor(!organDonor)} />
                  </label>

                  {/* Message for future */}
                  <div className="p-4 rounded-2xl bg-sage/15 border border-sage/20">
                    <div className="flex items-center gap-2 mb-2.5">
                      <MessageSquare className="w-4 h-4 text-sage-foreground/50" />
                      <p className="text-[13px] font-medium text-foreground/80">A message for the future</p>
                    </div>
                    <p className="text-[11px] text-muted-foreground/50 mb-3 leading-relaxed">
                      Leave a note for future generations — about your body, your story, or what you'd want them to know.
                    </p>
                    <textarea
                      value={futureMessage}
                      onChange={(e) => setFutureMessage(e.target.value)}
                      placeholder="What would you like them to know?"
                      rows={3}
                      className="field-input resize-none"
                    />
                  </div>
                </motion.div>
              )}
            </div>

            <button onClick={onClose} className="btn-primary mt-6">Save legacy preferences</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LegacySettings;
