import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, MoreHorizontal, ClipboardList, Palette, Share2, BookOpen, Heart, Sparkles } from "lucide-react";
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
import BodyStorySummary from "@/components/BodyStorySummary";

const Atlas = () => {
  const { state, setState, currentProfile, selectRegion } = useApp();
  const [showTreatment, setShowTreatment] = useState(false);
  const [showProfiles, setShowProfiles] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showLearn, setShowLearn] = useState(false);
  const [showLegacy, setShowLegacy] = useState(false);
  const [showCustomise, setShowCustomise] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [showBodyStory, setShowBodyStory] = useState(false);
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
      {/* Header — whisper-quiet, defers to body map */}
      <header className="sticky top-0 z-30 glass">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => setShowProfiles(true)} className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-full bg-sage/30 flex items-center justify-center text-sm group-hover:bg-sage/50 transition-colors duration-500">
              {currentProfile?.avatar}
            </div>
            <div className="text-left">
              <p className="text-[13px] font-medium text-foreground/80 leading-tight">{currentProfile?.name}</p>
              <p className="text-[10px] text-muted-foreground/40 tracking-widest uppercase mt-0.5">My Body Atlas</p>
            </div>
          </button>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button onClick={() => setShowMore(!showMore)}
                className="p-2.5 rounded-full hover:bg-secondary/50 transition-colors duration-300">
                <MoreHorizontal className="w-[17px] h-[17px] text-muted-foreground/40" />
              </button>
              {showMore && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMore(false)} />
                  <motion.div
                    className="absolute right-0 top-full mt-2.5 w-56 bg-card rounded-2xl border border-border/30 py-2.5 z-50"
                    style={{ boxShadow: "var(--shadow-lg)" }}
                    initial={{ opacity: 0, y: -6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
                  >
                    {secondaryActions.map((action) => (
                      <button key={action.label} onClick={() => { action.action(); setShowMore(false); }}
                        className="w-full flex items-center gap-3.5 px-5 py-3 text-[13px] text-foreground/65 hover:text-foreground/85 hover:bg-secondary/30 transition-all duration-200">
                        <action.icon className="w-4 h-4 text-muted-foreground/35" />
                        {action.label}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </div>
            <button
              onClick={() => { setPreselectedRegion(undefined); setState((s) => ({ ...s, showAddEvent: true })); }}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-primary/90 text-primary-foreground rounded-full text-[12px] font-medium transition-all duration-300 hover:bg-primary active:scale-[0.97]"
              style={{ boxShadow: "var(--shadow-sm)" }}
            >
              <Plus className="w-3.5 h-3.5" /> Add event
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6">
        {/* Body map — the hero, given maximum presence */}
        <motion.section
          className="flex flex-col items-center pt-10 pb-8 lg:pt-16 lg:pb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <BodyMap onRegionSelect={handleRegionSelect} />
          
          <div className="mt-8">
            <LayerToggles />
          </div>

          {/* Region summary — floats below body when active */}
          {state.selectedRegion && (
            <motion.div
              className="w-full max-w-sm mt-8"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <RegionSummary onAddEvent={handleAddEventFromRegion} />
            </motion.div>
          )}
        </motion.section>

        {/* Soft divider */}
        <div className="max-w-xs mx-auto h-px bg-border/30 mb-10" />

        {/* Content — timeline and insights, narrowed and centered */}
        <motion.section
          className="max-w-md mx-auto pb-20 space-y-14"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
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
