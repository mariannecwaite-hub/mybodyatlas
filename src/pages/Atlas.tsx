import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, MoreHorizontal, ClipboardList, Palette, FileText, BookOpen, Heart, Shield, Lock, Map } from "lucide-react";
import { useApp, BodyRegion, EventType, REGION_LABELS } from "@/context/AppContext";
import BodyMap from "@/components/BodyMap";
import LayerToggles from "@/components/LayerToggles";
import RegionSummary from "@/components/RegionSummary";
import ParallelTimeline from "@/components/ParallelTimeline";
import AhaMoment from "@/components/AhaMoment";
import BodyStoryView from "@/components/BodyStoryView";
import InsightCards from "@/components/InsightCards";
import BodyRecord from "@/components/BodyRecord";
import AddEventFlow from "@/components/AddEventFlow";
import EventDetail from "@/components/EventDetail";
import TreatmentLog from "@/components/TreatmentLog";
import ProfileSwitcher from "@/components/ProfileSwitcher";
import PractitionerSummary from "@/components/PractitionerSummary";
import LearnLibrary from "@/components/LearnLibrary";
import LegacySettings from "@/components/LegacySettings";
import BodyCustomisation from "@/components/BodyCustomisation";
import BodyStorySummary from "@/components/BodyStorySummary";
import DataPrivacySettings from "@/components/DataPrivacySettings";
import TreatmentGuide from "@/components/TreatmentGuide";
import BodyMemories from "@/components/BodyMemories";
import BodyPassport from "@/components/BodyPassport";
import ReturnPrompt from "@/components/ReturnPrompt";
import BodyQuery from "@/components/BodyQuery";
import CollectiveConsent from "@/components/CollectiveConsent";
import CollectiveAtlas from "@/components/CollectiveAtlas";

type ActiveTab = "body" | "timeline" | "story";

const tabMeta: { id: ActiveTab; label: string; icon: string }[] = [
  { id: "body", label: "Body Map", icon: "body" },
  { id: "timeline", label: "Timeline", icon: "timeline" },
  { id: "story", label: "Body Story", icon: "story" },
];

const TabIcon = ({ type, active }: { type: string; active: boolean }) => {
  const color = active ? "hsl(var(--foreground) / 0.85)" : "hsl(var(--muted-foreground) / 0.35)";
  if (type === "body") return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="3" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="12" y1="12" x2="8" y2="10" />
      <line x1="12" y1="12" x2="16" y2="10" />
      <line x1="12" y1="16" x2="9" y2="21" />
      <line x1="12" y1="16" x2="15" y2="21" />
    </svg>
  );
  if (type === "timeline") return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12" />
      <circle cx="7" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="17" cy="12" r="2" />
    </svg>
  );
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16v16H4z" rx="2" />
      <line x1="8" y1="9" x2="16" y2="9" />
      <line x1="8" y1="13" x2="14" y2="13" />
      <line x1="8" y1="17" x2="12" y2="17" />
    </svg>
  );
};

const Atlas = () => {
  const { state, setState, currentProfile, selectRegion } = useApp();
  const [activeTab, setActiveTab] = useState<ActiveTab>("body");
  const [showTreatment, setShowTreatment] = useState(false);
  const [showProfiles, setShowProfiles] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showDataPrivacy, setShowDataPrivacy] = useState(false);
  const [showLearn, setShowLearn] = useState(false);
  const [showLegacy, setShowLegacy] = useState(false);
  const [showCustomise, setShowCustomise] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [showBodyStorySummary, setShowBodyStorySummary] = useState(false);
  const [showTreatmentGuide, setShowTreatmentGuide] = useState(false);
  const [showPassport, setShowPassport] = useState(false);
  const [preselectedRegion, setPreselectedRegion] = useState<BodyRegion | undefined>();
  const [showCollectiveConsent, setShowCollectiveConsent] = useState(false);
  const [showCollectiveAtlas, setShowCollectiveAtlas] = useState(false);
  const [hasViewedStory, setHasViewedStory] = useState(false);

  // Track story views for consent trigger
  useEffect(() => {
    if (activeTab === "story") setHasViewedStory(true);
  }, [activeTab]);

  // Trigger collective consent: 5+ events, viewed story, not yet shown
  useEffect(() => {
    if (!hasViewedStory) return;
    if (state.events.length < 5) return;
    try {
      if (localStorage.getItem("collective-atlas-consented") === "true") return;
      if (localStorage.getItem("collective-atlas-dismissed") === "true") return;
      if (localStorage.getItem("collective-atlas-shown") === "true") return;
    } catch {}
    const timer = setTimeout(() => {
      localStorage.setItem("collective-atlas-shown", "true");
      setShowCollectiveConsent(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, [hasViewedStory, state.events.length]);

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
    { icon: Map, label: "Body Passport", action: () => setShowPassport(true) },
    { icon: ClipboardList, label: "Log treatment", action: () => setShowTreatment(true) },
    { icon: Palette, label: "Customise body", action: () => setShowCustomise(true) },
    { icon: FileText, label: "Create practitioner summary", action: () => setShowShare(true) },
    { icon: BookOpen, label: "Learn library", action: () => setShowLearn(true) },
    { icon: Lock, label: "Data & Privacy", action: () => setShowDataPrivacy(true) },
    { icon: Heart, label: "Body legacy", action: () => setShowLegacy(true) },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
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
              className="flex items-center gap-1.5 px-4 py-2.5 bg-warm text-warm-foreground/70 border border-warm-foreground/10 rounded-full text-[12px] font-medium transition-all duration-300 hover:bg-warm/90 active:scale-[0.97]"
              style={{ boxShadow: "var(--shadow-xs)" }}
            >
              <Plus className="w-3.5 h-3.5" /> Add event
            </button>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <main className="flex-1 overflow-y-auto pb-24">
        <AnimatePresence mode="wait">
          {/* ── TAB 1: Body Map ── */}
          {activeTab === "body" && (
            <motion.div
              key="body"
              className="max-w-2xl mx-auto px-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <motion.section
                className="flex flex-col items-center pt-8 pb-6 lg:pt-12 lg:pb-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                {/* Body Query — personal treatment memory search */}
                <div className="w-full max-w-sm mb-6">
                  <BodyQuery
                    onOpenAddEvent={(region) => {
                      if (region) setPreselectedRegion(region);
                      setState((s) => ({ ...s, showAddEvent: true }));
                    }}
                    onSelectRegionOnMap={() => {
                      // Just keep them on the body map tab
                    }}
                  />
                </div>

                <BodyMap onRegionSelect={handleRegionSelect} />
                
                <div className="mt-8">
                  <LayerToggles />
                </div>

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

              {/* Your Body Record */}
              <motion.section
                className="py-6"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
              >
                <BodyRecord />
              </motion.section>

              {/* Body Memories — reflective prompts */}
              <motion.section
                className="max-w-md mx-auto pb-2"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <BodyMemories />
              </motion.section>

              {/* Connection indicator to timeline */}
              <div className="flex flex-col items-center py-4">
                <div className="w-px h-8 bg-border/30" />
                <button
                  onClick={() => setActiveTab("timeline")}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/40 border border-border/20 text-[11px] text-muted-foreground/50 hover:text-muted-foreground/70 hover:bg-secondary/60 transition-all duration-300"
                >
                  <span>View events on timeline</span>
                  <span className="text-[10px]">→</span>
                </button>
                <div className="w-px h-4 bg-border/20" />
              </div>

              {/* Quick insights preview */}
              <motion.section
                className="max-w-md mx-auto pb-8 space-y-8"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <InsightCards />
              </motion.section>
            </motion.div>
          )}

          {/* ── TAB 2: Timeline ── */}
          {activeTab === "timeline" && (
            <motion.div
              key="timeline"
              className="max-w-2xl mx-auto px-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <ParallelTimeline onNavigateToBody={() => setActiveTab("body")} onNavigateToStory={() => setActiveTab("story")} />
            </motion.div>
          )}

          {/* ── TAB 3: Body Story ── */}
          {activeTab === "story" && (
            <motion.div
              key="story"
              className="max-w-2xl mx-auto px-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <BodyStoryView
                onCreateSummary={() => setShowBodyStorySummary(true)}
                onOpenCollective={() => setShowCollectiveAtlas(true)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom tab navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 glass border-t border-border/20" role="tablist" aria-label="Main navigation">
        <div className="max-w-2xl mx-auto px-6">
          <div className="flex items-center justify-around py-2">
            {tabMeta.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  aria-label={tab.label}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex flex-col items-center gap-1 py-2 px-6 rounded-2xl transition-all duration-300 relative"
                >
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 bg-sage/15 rounded-2xl"
                      layoutId="activeTab"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <div className="relative z-10">
                    <TabIcon type={tab.icon} active={isActive} />
                  </div>
                  <span className={`relative z-10 text-[10px] font-medium tracking-wide transition-colors duration-300 ${
                    isActive ? "text-foreground/75" : "text-muted-foreground/30"
                  }`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        {/* Safe area for mobile */}
        <div className="h-[env(safe-area-inset-bottom,0px)]" />
      </nav>

      {/* Modals */}
      <AddEventFlow
        open={state.showAddEvent}
        onClose={() => { setState((s) => ({ ...s, showAddEvent: false })); setPreselectedRegion(undefined); }}
        preselectedRegion={preselectedRegion}
      />
      <EventDetail />
      <TreatmentLog open={showTreatment} onClose={() => setShowTreatment(false)} />
      <ProfileSwitcher open={showProfiles} onClose={() => setShowProfiles(false)} />
      <PractitionerSummary open={showShare} onClose={() => setShowShare(false)} />
      <DataPrivacySettings open={showDataPrivacy} onClose={() => setShowDataPrivacy(false)} />
      <LearnLibrary open={showLearn} onClose={() => setShowLearn(false)} />
      <LegacySettings open={showLegacy} onClose={() => setShowLegacy(false)} />
      <BodyCustomisation open={showCustomise} onClose={() => setShowCustomise(false)} />
      <BodyStorySummary open={showBodyStorySummary} onClose={() => setShowBodyStorySummary(false)} />
      <TreatmentGuide open={showTreatmentGuide} onClose={() => setShowTreatmentGuide(false)} />
      <BodyPassport open={showPassport} onClose={() => setShowPassport(false)} />
      <ReturnPrompt />
      <AhaMoment />
    </div>
  );
};

export default Atlas;
