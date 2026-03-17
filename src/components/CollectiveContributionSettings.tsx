import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { ContributionSettings } from "./CollectiveConsent";
import AtlasSymbol from "@/components/AtlasSymbol";

interface CollectiveContributionSettingsProps {
  className?: string;
}

const CollectiveContributionSettings = ({ className }: CollectiveContributionSettingsProps) => {
  const [settings, setSettings] = useState<ContributionSettings>(() => {
    try {
      const stored = localStorage.getItem("collective-atlas-settings");
      return stored ? JSON.parse(stored) : { regionPatterns: false, lifeTransitions: false, treatmentOutcomes: false };
    } catch {
      return { regionPatterns: false, lifeTransitions: false, treatmentOutcomes: false };
    }
  });
  const [isContributing, setIsContributing] = useState(() => {
    try { return localStorage.getItem("collective-atlas-consented") === "true"; } catch { return false; }
  });
  const [expandedInfo, setExpandedInfo] = useState<string | null>(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  const updateSetting = (key: keyof ContributionSettings, value: boolean) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    try { localStorage.setItem("collective-atlas-settings", JSON.stringify(updated)); } catch {}
  };

  const handleRemove = () => {
    try {
      localStorage.removeItem("collective-atlas-consented");
      localStorage.removeItem("collective-atlas-settings");
    } catch {}
    setIsContributing(false);
    setSettings({ regionPatterns: false, lifeTransitions: false, treatmentOutcomes: false });
    setShowRemoveConfirm(false);
  };

  if (!isContributing) {
    return (
      <div className={className}>
        <p className="section-label mb-2">Collective Atlas contribution</p>
        <p className="text-[12px] text-muted-foreground/45 leading-relaxed">
          You haven't contributed to the Collective Atlas yet. This option will appear once you choose to add your patterns.
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-3">
        <AtlasSymbol size={16} />
        <p className="section-label">Contribute to the Atlas</p>
      </div>
      <div className="space-y-3">
        <SettingToggle label="Body region patterns" checked={settings.regionPatterns} onChange={(v) => updateSetting("regionPatterns", v)} />
        <SettingToggle label="Life transitions and timing" checked={settings.lifeTransitions} onChange={(v) => updateSetting("lifeTransitions", v)} />
        <SettingToggle label="Treatment outcomes" checked={settings.treatmentOutcomes} onChange={(v) => updateSetting("treatmentOutcomes", v)} />
      </div>

      {/* Info expanders */}
      <div className="mt-4 space-y-0">
        <InfoRow
          id="what-we-do"
          label="What we do with your patterns →"
          expanded={expandedInfo === "what-we-do"}
          onToggle={() => setExpandedInfo(expandedInfo === "what-we-do" ? null : "what-we-do")}
          content="Your patterns are stripped of all identifying details — no names, no specific dates, no written notes. Only the anonymous shape of your experiences is included."
        />
        <InfoRow
          id="who-access"
          label="Who can access the collective data →"
          expanded={expandedInfo === "who-access"}
          onToggle={() => setExpandedInfo(expandedInfo === "who-access" ? null : "who-access")}
          content="The collective patterns are visible to all contributing members. Anonymised, aggregated insights may be shared with researchers working to improve women's health."
        />
      </div>

      {/* Remove */}
      <div className="mt-5">
        <button
          onClick={() => setShowRemoveConfirm(true)}
          className="text-[12px] text-destructive/60 hover:text-destructive/80 transition-colors"
        >
          Remove my contribution
        </button>
        <AnimatePresence>
          {showRemoveConfirm && (
            <motion.div
              className="mt-3 p-4 rounded-xl bg-destructive/5 border border-destructive/10"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <p className="text-[12px] leading-relaxed mb-3" style={{ color: "#6B6960" }}>
                Your patterns will be removed from the collective. Your personal record is not affected.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowRemoveConfirm(false)}
                  className="flex-1 py-2 rounded-xl bg-secondary/60 text-[12px] text-muted-foreground/60"
                >
                  Keep contributing
                </button>
                <button onClick={handleRemove} className="flex-1 py-2 rounded-xl bg-destructive/70 text-destructive-foreground text-[12px] font-medium">
                  Remove
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

function SettingToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-[13px] text-foreground/70">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function InfoRow({ id, label, expanded, onToggle, content }: { id: string; label: string; expanded: boolean; onToggle: () => void; content: string }) {
  return (
    <div className="border-b border-border/10">
      <button onClick={onToggle} className="w-full flex items-center justify-between py-3 text-left">
        <span className="text-[12px] text-foreground/60">{label}</span>
        {expanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground/30" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/30" />}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <p className="text-[12px] leading-[1.7] pb-3" style={{ color: "#6B6960" }}>{content}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CollectiveContributionSettings;
