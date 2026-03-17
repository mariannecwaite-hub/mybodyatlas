import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Trash2, FlaskConical, Shield, Lock } from "lucide-react";
import CollectiveContributionSettings from "./CollectiveContributionSettings";

interface DataPrivacySettingsProps {
  open: boolean;
  onClose: () => void;
}

const DataPrivacySettings = ({ open, onClose }: DataPrivacySettingsProps) => {
  const [researchOptIn, setResearchOptIn] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const ToggleSwitch = ({ value, onToggle }: { value: boolean; onToggle: () => void }) => (
    <div
      onClick={onToggle}
      className={`w-11 h-[26px] rounded-full transition-all duration-300 relative cursor-pointer flex-shrink-0 ${
        value ? "bg-primary" : "bg-border"
      }`}
    >
      <div
        className={`absolute top-[3px] w-5 h-5 rounded-full bg-card transition-transform duration-300 ${
          value ? "translate-x-[22px]" : "translate-x-[3px]"
        }`}
        style={{ boxShadow: "var(--shadow-xs)" }}
      />
    </div>
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="modal-overlay" onClick={onClose} />
          <motion.div
            className="modal-content max-w-md"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
          >
            <div className="modal-header">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-sage-foreground/60" />
                <h2 className="text-xl">Data & Privacy</h2>
              </div>
              <button onClick={onClose} className="modal-close">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Privacy promise */}
            <div className="rounded-2xl p-4 bg-sage/10 border border-sage/15 mb-6 flex items-start gap-3">
              <Lock className="w-4 h-4 text-sage-foreground/50 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[13px] text-foreground/75 leading-relaxed">
                  Your body story belongs to you.
                </p>
                <p className="text-[12px] text-muted-foreground/50 leading-relaxed mt-0.5">
                  All body history is private by default. Nothing is shared unless you explicitly choose to create a summary.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {/* Export */}
              <button className="w-full flex items-center gap-3.5 p-4 rounded-2xl bg-secondary/50 hover:bg-secondary/70 transition-all duration-200 text-left">
                <Download className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
                <div>
                  <p className="text-[13px] font-medium text-foreground/80">Export body history</p>
                  <p className="text-[11px] text-muted-foreground/50 mt-0.5">
                    Download a complete copy of your body map, events, and insights.
                  </p>
                </div>
              </button>

              {/* Delete */}
              <div>
                <button
                  onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                  className="w-full flex items-center gap-3.5 p-4 rounded-2xl bg-secondary/50 hover:bg-destructive/5 transition-all duration-200 text-left"
                >
                  <Trash2 className="w-4 h-4 text-destructive/50 flex-shrink-0" />
                  <div>
                    <p className="text-[13px] font-medium text-foreground/80">Delete body history</p>
                    <p className="text-[11px] text-muted-foreground/50 mt-0.5">
                      Permanently remove all your body map data. This cannot be undone.
                    </p>
                  </div>
                </button>
                <AnimatePresence>
                  {showDeleteConfirm && (
                    <motion.div
                      className="mt-2 p-4 rounded-2xl bg-destructive/5 border border-destructive/10"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <p className="text-[12px] text-foreground/70 mb-3 leading-relaxed">
                        Are you sure? This will permanently delete all events, treatments, insights, and body map data.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          className="flex-1 py-2.5 rounded-xl bg-secondary/60 text-[12px] text-muted-foreground/60 hover:bg-secondary/80 transition-colors"
                        >
                          Cancel
                        </button>
                        <button className="flex-1 py-2.5 rounded-xl bg-destructive/80 text-destructive-foreground text-[12px] font-medium hover:bg-destructive transition-colors">
                          Delete everything
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Research participation */}
              <div className="p-4 rounded-2xl bg-secondary/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <FlaskConical className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
                    <div className="pr-3">
                      <p className="text-[13px] font-medium text-foreground/80">Research participation</p>
                      <p className="text-[11px] text-muted-foreground/50 mt-0.5">Optional · You can change this anytime</p>
                    </div>
                  </div>
                  <ToggleSwitch value={researchOptIn} onToggle={() => setResearchOptIn(!researchOptIn)} />
                </div>
                <AnimatePresence>
                  {researchOptIn && (
                    <motion.div
                      className="mt-3 p-3.5 rounded-xl bg-sage/10 border border-sage/15"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <p className="text-[12px] text-foreground/65 leading-relaxed">
                        You can choose to contribute anonymised insights to help researchers understand long-term health patterns.
                      </p>
                      <p className="text-[11px] text-muted-foreground/40 mt-2 leading-relaxed">
                        Your identity is never shared. Only aggregated, anonymous patterns are used. You can withdraw at any time.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Collective Atlas contribution */}
            <CollectiveContributionSettings className="mt-6 pt-5 border-t border-border/20" />

            {/* Ethical principles summary */}
            <div className="mt-6 pt-5 border-t border-border/20 space-y-2.5">
              <p className="section-label">Our commitments</p>
              <div className="space-y-1.5">
                {[
                  "Your body story belongs to you",
                  "Private by default — no social features, no automatic sharing",
                  "Context, not diagnosis — insights stay observational",
                  "Trauma-informed — skip, delete, or dismiss anything",
                  "Research participation is always optional and transparent",
                ].map((principle) => (
                  <div key={principle} className="flex items-start gap-2.5 py-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-sage/60 mt-1.5 flex-shrink-0" />
                    <p className="text-[11px] text-muted-foreground/45 leading-relaxed">{principle}</p>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={onClose} className="btn-primary mt-6">
              Done
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DataPrivacySettings;
