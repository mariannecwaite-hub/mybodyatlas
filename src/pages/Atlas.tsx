import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, MoreHorizontal, ClipboardList, Palette, Share2, BookOpen, Heart } from "lucide-react";
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
      {/* Header — minimal, recedes behind the body map */}
      <header className="sticky top-0 z-30 glass">
        <div className="max-w-5xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <button onClick={() => setShowProfiles(true)} className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-full bg-sage/40 flex items-center justify-center text-sm group-hover:bg-sage/60 transition-colors duration-300">
              {currentProfile?.avatar}
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-foreground leading-tight">{currentProfile?.name}</p>
              <p className="text-[11px] text-muted-foreground/50 tracking-wide">Body Atlas</p>
            </div>
          </button>

          <div className="flex items-center gap-2.5">
            <div className="relative">
              <button onClick={() => setShowMore(!showMore)}
                className="p-2.5 rounded-full hover:bg-secondary/70 transition-colors duration-200">
                <MoreHorizontal className="w-[18px] h-[18px] text-muted-foreground/60" />
              </button>
              {showMore && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMore(false)} />
                  <motion.div
                    className="absolute right-0 top-full mt-2 w-56 bg-card rounded-2xl border border-border/40 py-2 z-50"
                    style={{ boxShadow: "var(--shadow-lg)" }}
                    initial={{ opacity: 0, y: -4, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.15 }}
                  >
                    {secondaryActions.map((action) => (
                      <button key={action.label} onClick={() => { action.action(); setShowMore(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-[13px] text-foreground/75 hover:bg-secondary/50 transition-colors duration-200">
                        <action.icon className="w-4 h-4 text-muted-foreground/50" />
                        {action.label}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </div>
            <button
              onClick={() => { setPreselectedRegion(undefined); setState((s) => ({ ...s, showAddEvent: true })); }}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-primary-foreground rounded-full text-[13px] font-medium transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
              style={{ boxShadow: "var(--shadow-sm)" }}
            >
              <Plus className="w-3.5 h-3.5" /> Add event
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6">
        {/* Body map — hero section with generous vertical space */}
        <motion.section
          className="flex flex-col items-center pt-8 pb-6 lg:pt-12 lg:pb-10"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}
        >
          <BodyMap onRegionSelect={handleRegionSelect} />
          
          <div className="mt-6">
            <LayerToggles />
          </div>

          {/* Region summary card */}
          {state.selectedRegion && (
            <div className="w-full max-w-sm mt-6">
              <RegionSummary onAddEvent={handleAddEventFromRegion} />
            </div>
          )}
        </motion.section>

        {/* Content — timeline and insights below the body map */}
        <motion.section
          className="max-w-lg mx-auto pb-16 space-y-12"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Timeline />
          <InsightCards />
        </motion.section>
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
