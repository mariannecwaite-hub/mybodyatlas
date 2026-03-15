import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Users, Share2, BookOpen, Heart, Palette, ClipboardList, MoreHorizontal } from "lucide-react";
import { useApp, BodyRegion } from "@/context/AppContext";
import BodyMap from "@/components/BodyMap";
import LayerToggles from "@/components/LayerToggles";
import RegionSummary from "@/components/RegionSummary";
import Timeline from "@/components/Timeline";
import InsightCards from "@/components/InsightCards";
import AddEventFlow from "@/components/AddEventFlow";
import EventDetail from "@/components/EventDetail";
import TreatmentLog from "@/components/TreatmentLog";
import ProfileSwitcher from "@/components/ProfileSwitcher";
import ShareFlow from "@/components/ShareFlow";
import LearnLibrary from "@/components/LearnLibrary";
import LegacySettings from "@/components/LegacySettings";
import BodyCustomisation from "@/components/BodyCustomisation";

const Atlas = () => {
  const { state, setState, currentProfile, selectRegion } = useApp();
  const [showTreatment, setShowTreatment] = useState(false);
  const [showProfiles, setShowProfiles] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showLearn, setShowLearn] = useState(false);
  const [showLegacy, setShowLegacy] = useState(false);
  const [showCustomise, setShowCustomise] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [preselectedRegion, setPreselectedRegion] = useState<BodyRegion | undefined>();

  const handleRegionSelect = (region: BodyRegion) => {
    // Toggle: if same region, deselect; otherwise select
    if (state.selectedRegion === region) {
      selectRegion(null);
    } else {
      selectRegion(region);
    }
  };

  const handleAddEventFromRegion = (region: BodyRegion) => {
    setPreselectedRegion(region);
    setState((s) => ({ ...s, showAddEvent: true }));
  };

  const secondaryActions = [
    { icon: ClipboardList, label: "Log treatment", action: () => setShowTreatment(true) },
    { icon: Palette, label: "Customise body", action: () => setShowCustomise(true) },
    { icon: Share2, label: "Share with practitioner", action: () => setShowShare(true) },
    { icon: BookOpen, label: "Learn library", action: () => setShowLearn(true) },
    { icon: Heart, label: "Body legacy", action: () => setShowLegacy(true) },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 glass">
        <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between">
          <button onClick={() => setShowProfiles(true)} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-full bg-sage/50 flex items-center justify-center text-sm group-hover:bg-sage transition-colors duration-300">
              {currentProfile?.avatar}
            </div>
            <div className="text-left">
              <p className="text-[13px] font-medium text-foreground leading-tight">{currentProfile?.name}</p>
              <p className="text-[10px] text-muted-foreground/60">Body Atlas</p>
            </div>
          </button>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button onClick={() => setShowMore(!showMore)}
                className="p-2 rounded-xl hover:bg-secondary/80 transition-colors duration-200">
                <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
              </button>
              {showMore && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMore(false)} />
                  <motion.div
                    className="absolute right-0 top-full mt-2 w-56 bg-card rounded-2xl border border-border/50 py-2 z-50"
                    style={{ boxShadow: "var(--shadow-lg)" }}
                    initial={{ opacity: 0, y: -4, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.15 }}
                  >
                    {secondaryActions.map((action) => (
                      <button key={action.label} onClick={() => { action.action(); setShowMore(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground/80 hover:bg-secondary/60 transition-colors duration-200">
                        <action.icon className="w-4 h-4 text-muted-foreground/70" />
                        {action.label}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </div>
            <button
              onClick={() => { setPreselectedRegion(undefined); setState((s) => ({ ...s, showAddEvent: true })); }}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-[13px] font-medium transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
              style={{ boxShadow: "var(--shadow-xs)" }}
            >
              <Plus className="w-3.5 h-3.5" /> Add event
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-start">
          {/* Left: Body Map + Region Summary */}
          <motion.div
            className="flex flex-col items-center gap-4 lg:sticky lg:top-16 lg:self-start lg:py-2"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}
          >
            <BodyMap onRegionSelect={handleRegionSelect} />
            <LayerToggles />

            {/* Region summary card — appears when a region is selected */}
            {state.selectedRegion && (
              <div className="w-full max-w-[280px]">
                <RegionSummary onAddEvent={handleAddEventFromRegion} />
              </div>
            )}
          </motion.div>

          {/* Right: Timeline + Insights */}
          <motion.div
            className="space-y-10 lg:py-2"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Timeline />
            <InsightCards />
          </motion.div>
        </div>
      </main>

      {/* Modals */}
      <AddEventFlow
        open={state.showAddEvent}
        onClose={() => { setState((s) => ({ ...s, showAddEvent: false })); setPreselectedRegion(undefined); }}
        preselectedRegion={preselectedRegion}
      />
      <EventDetail />
      <TreatmentLog open={showTreatment} onClose={() => setShowTreatment(false)} />
      <ProfileSwitcher open={showProfiles} onClose={() => setShowProfiles(false)} />
      <ShareFlow open={showShare} onClose={() => setShowShare(false)} />
      <LearnLibrary open={showLearn} onClose={() => setShowLearn(false)} />
      <LegacySettings open={showLegacy} onClose={() => setShowLegacy(false)} />
      <BodyCustomisation open={showCustomise} onClose={() => setShowCustomise(false)} />
    </div>
  );
};

export default Atlas;
