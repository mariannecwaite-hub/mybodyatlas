import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Users, Share2, BookOpen, Heart, Palette, ClipboardList } from "lucide-react";
import { useApp, BodyRegion } from "@/context/AppContext";
import BodyMap from "@/components/BodyMap";
import LayerToggles from "@/components/LayerToggles";
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
  const { state, setState, currentProfile } = useApp();
  const [showTreatment, setShowTreatment] = useState(false);
  const [showProfiles, setShowProfiles] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showLearn, setShowLearn] = useState(false);
  const [showLegacy, setShowLegacy] = useState(false);
  const [showCustomise, setShowCustomise] = useState(false);
  const [preselectedRegion, setPreselectedRegion] = useState<BodyRegion | undefined>();

  const handleRegionClick = (region: BodyRegion) => {
    setPreselectedRegion(region);
    setState((s) => ({ ...s, showAddEvent: true }));
  };

  const quickActions = [
    { icon: ClipboardList, label: "Treatment", action: () => setShowTreatment(true) },
    { icon: Palette, label: "Customise", action: () => setShowCustomise(true) },
    { icon: Users, label: "Profiles", action: () => setShowProfiles(true) },
    { icon: Share2, label: "Share", action: () => setShowShare(true) },
    { icon: BookOpen, label: "Learn", action: () => setShowLearn(true) },
    { icon: Heart, label: "Legacy", action: () => setShowLegacy(true) },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 glass">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-sage flex items-center justify-center text-sm">
              {currentProfile?.avatar}
            </div>
            <div>
              <h1 className="text-base font-serif text-foreground leading-tight">Body Atlas</h1>
              <p className="text-xs text-muted-foreground">{currentProfile?.name}'s map</p>
            </div>
          </div>

          <button
            onClick={() => { setPreselectedRegion(undefined); setState((s) => ({ ...s, showAddEvent: true })); }}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium transition-all hover:opacity-90 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" /> Add event
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Body Map */}
          <motion.div
            className="lg:col-span-5 flex flex-col items-center gap-6"
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
          >
            <BodyMap onRegionClick={handleRegionClick} />
            <LayerToggles />

            {/* Quick actions */}
            <div className="grid grid-cols-3 gap-2 w-full max-w-xs">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={action.action}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-secondary/60 hover:bg-secondary transition-all text-muted-foreground hover:text-foreground"
                >
                  <action.icon className="w-4 h-4" />
                  <span className="text-[11px] font-medium">{action.label}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Right: Timeline + Insights */}
          <motion.div
            className="lg:col-span-7 space-y-8"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
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
