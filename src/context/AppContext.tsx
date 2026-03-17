import React, { createContext, useContext, useState, ReactNode } from "react";

export type BodyRegion =
  | "head_jaw"
  | "neck"
  | "shoulder_left"
  | "shoulder_right"
  | "chest"
  | "upper_back"
  | "abdomen"
  | "lower_back"
  | "hip_left"
  | "hip_right"
  | "knee_left"
  | "knee_right"
  | "ankle_foot_left"
  | "ankle_foot_right"
  | "wrist_hand_left"
  | "wrist_hand_right";

export type EventType = "injury" | "symptom" | "stress" | "treatment" | "life-event";

export type EventSeverity = "mild" | "moderate" | "significant";

export type TreatmentOutcome = "helped" | "no-change" | "worse" | "not-sure";

export interface BodyEvent {
  id: string;
  type: EventType;
  title: string;
  description: string;
  regions: BodyRegion[];
  date: string;
  severity: EventSeverity;
  notes?: string;
  treatment?: string;
  ongoing: boolean;
  archived?: boolean;
}

export interface Profile {
  id: string;
  name: string;
  type: "adult" | "child";
  avatar: string;
  birthYear: number;
  handoverAge?: number;
}

export interface AppState {
  hasOnboarded: boolean;
  currentProfile: string;
  profiles: Profile[];
  events: BodyEvent[];
  activeLayer: EventType | "all";
  timelineYear: number;
  showAddEvent: boolean;
  selectedEvent: string | null;
  selectedRegion: BodyRegion | null;
  currentScreen: string;
  insightsRevealed: boolean;
  showArchived: boolean;
  highlightedRegions: BodyRegion[];
  highlightedEventIds: string[];
  activeInsightId: string | null;
}

interface AppContextType {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  addEvent: (event: Omit<BodyEvent, "id">) => void;
  updateEvent: (id: string, updates: Partial<BodyEvent>) => void;
  deleteEvent: (id: string) => void;
  archiveEvent: (id: string) => void;
  restoreEvent: (id: string) => void;
  setActiveLayer: (layer: EventType | "all") => void;
  switchProfile: (profileId: string) => void;
  completeOnboarding: () => void;
  selectRegion: (region: BodyRegion | null) => void;
  revealInsights: () => void;
  highlightInsight: (insightId: string | null, regions: BodyRegion[], eventIds: string[]) => void;
  clearHighlight: () => void;
  currentProfile: Profile | undefined;
  /** Returns only non-archived events (or all if showArchived) */
  visibleEvents: BodyEvent[];
}

export const REGION_LABELS: Record<BodyRegion, string> = {
  head_jaw: "Head & Jaw",
  neck: "Neck",
  shoulder_left: "Left Shoulder",
  shoulder_right: "Right Shoulder",
  chest: "Chest",
  upper_back: "Upper Back",
  abdomen: "Abdomen",
  lower_back: "Lower Back",
  hip_left: "Left Hip",
  hip_right: "Right Hip",
  knee_left: "Left Knee",
  knee_right: "Right Knee",
  ankle_foot_left: "Left Ankle & Foot",
  ankle_foot_right: "Right Ankle & Foot",
  wrist_hand_left: "Left Wrist & Hand",
  wrist_hand_right: "Right Wrist & Hand",
};

/** Compassionate, observational screen-reader descriptions per region */
export const REGION_A11Y: Record<BodyRegion, string> = {
  head_jaw: "An area you can explore around your head and jaw",
  neck: "Your neck area — a place many people hold tension",
  shoulder_left: "Your left shoulder area",
  shoulder_right: "Your right shoulder area",
  chest: "Your chest area — where breath and emotion often meet",
  upper_back: "Your upper back — a common area of attention",
  abdomen: "Your abdomen area",
  lower_back: "Your lower back — an area many people notice over time",
  hip_left: "Your left hip area",
  hip_right: "Your right hip area",
  knee_left: "Your left knee area",
  knee_right: "Your right knee area",
  ankle_foot_left: "Your left ankle and foot",
  ankle_foot_right: "Your right ankle and foot",
  wrist_hand_left: "Your left wrist and hand",
  wrist_hand_right: "Your right wrist and hand",
};

const defaultProfiles: Profile[] = [
  { id: "p1", name: "Sam", type: "adult", avatar: "🙂", birthYear: 1992 },
  { id: "p2", name: "Mila", type: "child", avatar: "👶", birthYear: 2022, handoverAge: 16 },
];

const sampleEvents: BodyEvent[] = [
  {
    id: "e1", type: "injury", title: "Ankle sprain — hiking trip",
    description: "Rolled left ankle on a rocky descent. Swelling for about a week, limped for two.",
    regions: ["ankle_foot_left"], date: "2012-09-14", severity: "moderate", ongoing: false,
    treatment: "Rest and gentle walking. No physio at the time.",
    notes: "First real injury. Wish I'd done rehab exercises afterwards."
  },
  {
    id: "e2", type: "symptom", title: "Left knee — a quiet ache",
    description: "A dull ache on the inside of the left knee, more noticeable going downstairs. Came on gradually.",
    regions: ["knee_left"], date: "2016-03-20", severity: "mild", ongoing: false,
    notes: "A physio later noticed this might be connected to the old ankle injury changing how I walk."
  },
  {
    id: "e3", type: "treatment", title: "Knee physio — 6 sessions",
    description: "Referred by GP. Focused on strengthening and gait awareness.",
    regions: ["knee_left", "ankle_foot_left"], date: "2016-05-01", severity: "mild", ongoing: false,
    treatment: "Manual therapy, quad and glute exercises, gait observation.\n\n2016-06-12: Completed 6 sessions. Knee felt much more settled."
  },
  {
    id: "e4", type: "stress", title: "New job and relocation",
    description: "Moved cities for a demanding new role. Long hours, little routine, disrupted sleep for months.",
    regions: ["neck", "chest"], date: "2019-01-15", severity: "significant", ongoing: false,
    notes: "Looking back, this was when a lot of physical tension started building."
  },
  {
    id: "e5", type: "symptom", title: "Upper back and neck tension",
    description: "Persistent tightness across shoulders and upper back. Headaches most afternoons.",
    regions: ["upper_back", "neck", "shoulder_right", "shoulder_left"], date: "2019-02-10", severity: "moderate", ongoing: false,
    notes: "Clearly started during the transition. Desk setup wasn't helping."
  },
  {
    id: "e6", type: "symptom", title: "Lower back — a familiar ache",
    description: "A deep, tired ache in the lower back, more noticeable after sitting. Sometimes interrupted sleep.",
    regions: ["lower_back"], date: "2019-04-05", severity: "moderate", ongoing: false,
    notes: "Happened alongside the neck tension. My body was holding a lot."
  },
  {
    id: "e7", type: "treatment", title: "Osteopath — 4 sessions",
    description: "Tried osteopathy for back and neck. Gentle spinal mobilisation.",
    regions: ["lower_back", "upper_back", "neck"], date: "2019-05-01", severity: "mild", ongoing: false,
    treatment: "Spinal mobilisation, soft tissue work, breathing exercises.\n\nHelpful short-term, though it returned when stress was high."
  },
  {
    id: "e8", type: "life-event", title: "Pregnancy — first trimester",
    description: "Found out in early January. Nausea, fatigue, emotional adjustment.",
    regions: ["abdomen"], date: "2021-01-18", severity: "mild", ongoing: false,
    notes: "Everything changed. My body started feeling like it belonged to someone else for a while."
  },
  {
    id: "e9", type: "life-event", title: "Mila born 💛",
    description: "Healthy delivery at 39 weeks. Recovery took longer than expected.",
    regions: ["abdomen", "lower_back"], date: "2021-10-03", severity: "mild", ongoing: false,
    notes: "The most intense and beautiful experience. My body needed time."
  },
  {
    id: "e10", type: "symptom", title: "Skin changes — postpartum",
    description: "Patches appeared on elbows, scalp, and behind ears. Something new for me.",
    regions: ["wrist_hand_left", "wrist_hand_right", "head_jaw"], date: "2022-01-15", severity: "significant", ongoing: true,
    notes: "A dermatologist noticed hormonal shifts can sometimes bring new skin patterns. It was emotionally hard — but it's something I'm learning to live alongside."
  },
  {
    id: "e11", type: "treatment", title: "Dermatology — ongoing care",
    description: "Topical treatment initially, then a gentler maintenance approach.",
    regions: ["wrist_hand_left", "wrist_hand_right", "head_jaw"], date: "2022-02-20", severity: "mild", ongoing: true,
    treatment: "Started with stronger treatment for flares, moved to maintenance.\n\n2022-06-01: Patches settled significantly.\n\n2023-01-10: Mostly managed, occasional small flares in winter.\n\n2024-09-15: Exploring additional options."
  },
  {
    id: "e12", type: "symptom", title: "Lower back — returned with parenting",
    description: "The familiar lower back ache returned. Carrying, bending, interrupted sleep.",
    regions: ["lower_back", "hip_left"], date: "2023-03-01", severity: "mild", ongoing: true,
    notes: "Different from the 2019 episode — less sharp, more of a constant tiredness in that area."
  },
  {
    id: "e13", type: "treatment", title: "Pilates — weekly class",
    description: "Started a beginner reformer class focused on core and pelvic floor.",
    regions: ["lower_back", "abdomen"], date: "2023-09-01", severity: "mild", ongoing: true,
    treatment: "Weekly 50-min class. Noticing gradual changes in core stability and less back fatigue."
  },
  {
    id: "e14", type: "stress", title: "Balancing everything",
    description: "Went back to work part-time. Juggling childcare, work, and health appointments.",
    regions: ["neck", "chest"], date: "2024-02-01", severity: "moderate", ongoing: true,
    notes: "Neck tension is back. I'm starting to recognise the pattern — stress tends to settle in my shoulders."
  },
  {
    id: "e15", type: "life-event", title: "Started a journaling practice",
    description: "5 minutes each morning. Writing about how my body feels and what I notice.",
    regions: [], date: "2024-06-01", severity: "mild", ongoing: true,
    notes: "This has helped me notice connections between stress, sleep, and physical sensations. Small but meaningful."
  },
  {
    id: "e16", type: "symptom", title: "Right knee — occasional clicking",
    description: "A painless clicking when going upstairs. No swelling.",
    regions: ["knee_right"], date: "2024-11-10", severity: "mild", ongoing: true,
    notes: "Probably nothing, but noting it in case it develops. The left knee history makes me more aware."
  },
];

const initialState: AppState = {
  hasOnboarded: false,
  currentProfile: "p1",
  profiles: defaultProfiles,
  events: sampleEvents,
  activeLayer: "all",
  timelineYear: 2024,
  showAddEvent: false,
  selectedEvent: null,
  selectedRegion: null,
  currentScreen: "welcome",
  insightsRevealed: false,
  showArchived: false,
  highlightedRegions: [],
  highlightedEventIds: [],
  activeInsightId: null,
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);

  const addEvent = (event: Omit<BodyEvent, "id">) => {
    const id = `e${Date.now()}`;
    setState((s) => ({ ...s, events: [...s.events, { ...event, id }], showAddEvent: false }));
  };

  const updateEvent = (id: string, updates: Partial<BodyEvent>) => {
    setState((s) => ({
      ...s,
      events: s.events.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    }));
  };

  const deleteEvent = (id: string) => {
    setState((s) => ({ ...s, events: s.events.filter((e) => e.id !== id), selectedEvent: null }));
  };

  const archiveEvent = (id: string) => {
    setState((s) => ({
      ...s,
      events: s.events.map((e) => (e.id === id ? { ...e, archived: true } : e)),
      selectedEvent: null,
    }));
  };

  const restoreEvent = (id: string) => {
    setState((s) => ({
      ...s,
      events: s.events.map((e) => (e.id === id ? { ...e, archived: false } : e)),
    }));
  };

  const setActiveLayer = (layer: EventType | "all") => {
    setState((s) => ({ ...s, activeLayer: layer }));
  };

  const switchProfile = (profileId: string) => {
    setState((s) => ({ ...s, currentProfile: profileId }));
  };

  const completeOnboarding = () => {
    setState((s) => ({ ...s, hasOnboarded: true, currentScreen: "atlas" }));
  };

  const selectRegion = (region: BodyRegion | null) => {
    setState((s) => ({ ...s, selectedRegion: region }));
  };

  const revealInsights = () => {
    setState((s) => ({ ...s, insightsRevealed: true }));
  };

  const highlightInsight = (insightId: string | null, regions: BodyRegion[], eventIds: string[]) => {
    setState((s) => ({
      ...s,
      activeInsightId: s.activeInsightId === insightId ? null : insightId,
      highlightedRegions: s.activeInsightId === insightId ? [] : regions,
      highlightedEventIds: s.activeInsightId === insightId ? [] : eventIds,
    }));
  };

  const clearHighlight = () => {
    setState((s) => ({ ...s, activeInsightId: null, highlightedRegions: [], highlightedEventIds: [] }));
  };

  const currentProfile = state.profiles.find((p) => p.id === state.currentProfile);

  const visibleEvents = state.events.filter((e) => state.showArchived || !e.archived);

  return (
    <AppContext.Provider value={{
      state, setState, addEvent, updateEvent, deleteEvent, archiveEvent, restoreEvent,
      setActiveLayer, switchProfile, completeOnboarding, selectRegion, revealInsights,
      highlightInsight, clearHighlight,
      currentProfile, visibleEvents,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
