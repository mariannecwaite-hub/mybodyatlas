import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { Switch } from "@/components/ui/switch";
import AtlasSymbol from "@/components/AtlasSymbol";

interface CollectiveConsentProps {
  open: boolean;
  onClose: () => void;
  onContribute: (settings: ContributionSettings) => void;
}

export interface ContributionSettings {
  regionPatterns: boolean;
  lifeTransitions: boolean;
  treatmentOutcomes: boolean;
}

const CollectiveConsent = ({ open, onClose, onContribute }: CollectiveConsentProps) => {
  const [settings, setSettings] = useState<ContributionSettings>({
    regionPatterns: false,
    lifeTransitions: false,
    treatmentOutcomes: false,
  });

  const anyEnabled = settings.regionPatterns || settings.lifeTransitions || settings.treatmentOutcomes;

  const handleContribute = () => {
    try {
      localStorage.setItem("collective-atlas-settings", JSON.stringify(settings));
      localStorage.setItem("collective-atlas-consented", "true");
    } catch {}
    onContribute(settings);
  };

  const handleDismiss = () => {
    try { localStorage.setItem("collective-atlas-dismissed", "true"); } catch {}
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-background"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="w-full max-w-[375px] mx-auto px-10 py-16 flex flex-col items-center text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Atlas symbol */}
            <AtlasSymbol size={32} className="mb-4" />

            {/* Small label */}
            <p className="text-[11px] font-medium uppercase tracking-[0.25em] mb-8" style={{ color: "#A8A59E" }}>
              Something bigger
            </p>

            {/* Heading */}
            <h2 className="font-serif italic text-[26px] leading-[1.35] max-w-[295px] mb-6" style={{ color: "#2A2A28" }}>
              Your body story is yours. But your patterns could help others.
            </h2>

            {/* Body text */}
            <p className="text-[16px] leading-[1.8] max-w-[280px] mb-10" style={{ color: "#6B6960", fontFamily: "'DM Sans', sans-serif" }}>
              Across thousands of women's body stories, patterns emerge that medicine has been slow to notice. If you choose to, you can contribute the anonymous shape of your experiences — not your words, not your details — to a growing collective map.
              {"\n\n"}
              You choose what to share. You can change your mind at any time. Nothing identifiable ever leaves your record.
            </p>

            {/* Toggles */}
            <div className="w-full max-w-[295px] space-y-4 mb-6">
              <ToggleRow
                label="Body region patterns"
                description="Which areas of your body, and roughly when — no descriptions or notes"
                checked={settings.regionPatterns}
                onChange={(v) => setSettings((s) => ({ ...s, regionPatterns: v }))}
              />
              <ToggleRow
                label="Life transitions and timing"
                description="The types of transitions you've been through — no personal details"
                checked={settings.lifeTransitions}
                onChange={(v) => setSettings((s) => ({ ...s, lifeTransitions: v }))}
              />
              <ToggleRow
                label="Treatment outcomes"
                description="What helped, what didn't — no practitioner names or specifics"
                checked={settings.treatmentOutcomes}
                onChange={(v) => setSettings((s) => ({ ...s, treatmentOutcomes: v }))}
              />
            </div>

            {/* Safety note */}
            <p className="text-[12px] leading-[1.6] max-w-[280px] mb-10" style={{ color: "#A8A59E", fontFamily: "'DM Sans', sans-serif" }}>
              Experiences logged as private and anything in the 'unsafe experience' category are never included — regardless of your settings.
            </p>

            {/* Actions */}
            <div className="w-full max-w-[280px] space-y-4">
              <button
                onClick={handleContribute}
                disabled={!anyEnabled}
                className="w-full py-3.5 rounded-full border-2 text-[14px] font-medium transition-all duration-300 disabled:opacity-30 flex items-center justify-center gap-2"
                style={{
                  borderColor: "hsl(158, 18%, 30%)",
                  color: "hsl(158, 18%, 30%)",
                  background: "transparent",
                }}
              >
                <AtlasSymbol size={16} />
                Contribute to the Collective
              </button>
              <button
                onClick={handleDismiss}
                className="w-full py-2 text-[13px] transition-colors duration-200"
                style={{ color: "#A8A59E" }}
              >
                Not right now
              </button>
            </div>

            {/* Footer */}
            <p className="mt-12 text-[11px]" style={{ color: "#A8A59E" }}>
              You can change these settings at any time in your profile.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-border/20">
      <div className="text-left">
        <p className="text-[14px] font-medium" style={{ color: "#2A2A28", fontFamily: "'DM Sans', sans-serif" }}>
          {label}
        </p>
        <p className="text-[13px] mt-0.5" style={{ color: "#A8A59E", fontFamily: "'DM Sans', sans-serif" }}>
          {description}
        </p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} className="flex-shrink-0 mt-0.5" />
    </div>
  );
}

export default CollectiveConsent;
