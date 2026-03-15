import React, { createContext, useContext, useState, ReactNode } from "react";

export type BodyRegion = "head" | "neck" | "left-shoulder" | "right-shoulder" | "chest" | "upper-back" | "left-arm" | "right-arm" | "abdomen" | "lower-back" | "left-hip" | "right-hip" | "left-leg" | "right-leg" | "left-knee" | "right-knee" | "left-foot" | "right-foot";

export type EventType = "injury" | "symptom" | "stress" | "treatment" | "life-event";

export type EventSeverity = "mild" | "moderate" | "significant";

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
  currentScreen: string;
}

interface AppContextType {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  addEvent: (event: Omit<BodyEvent, "id">) => void;
  updateEvent: (id: string, updates: Partial<BodyEvent>) => void;
  deleteEvent: (id: string) => void;
  setActiveLayer: (layer: EventType | "all") => void;
  switchProfile: (profileId: string) => void;
  completeOnboarding: () => void;
  currentProfile: Profile | undefined;
}

const defaultProfiles: Profile[] = [
  { id: "p1", name: "Sam", type: "adult", avatar: "🙂", birthYear: 1992 },
  { id: "p2", name: "Mila", type: "child", avatar: "👶", birthYear: 2022, handoverAge: 16 },
];

const sampleEvents: BodyEvent[] = [
  // --- Age 20: Ankle injury ---
  {
    id: "e1", type: "injury", title: "Ankle sprain — hiking trip",
    description: "Rolled left ankle badly on rocky descent. Swelling for about a week, limped for two.",
    regions: ["left-foot"], date: "2012-09-14", severity: "moderate", ongoing: false,
    treatment: "RICE protocol for 10 days, then gentle walking. No physio at the time.",
    notes: "First real injury. Didn't take it seriously enough — wish I'd done rehab exercises."
  },
  // --- Compensatory knee pain years later ---
  {
    id: "e2", type: "symptom", title: "Left knee aching",
    description: "Dull ache on the inside of the left knee, worse going downstairs. Started gradually.",
    regions: ["left-knee"], date: "2016-03-20", severity: "mild", ongoing: false,
    notes: "Physio later suggested this might be linked to the old ankle injury changing my gait."
  },
  {
    id: "e3", type: "treatment", title: "Knee physio — 6 sessions",
    description: "Referred by GP. Focused on quad strengthening and gait correction.",
    regions: ["left-knee", "left-foot"], date: "2016-05-01", severity: "mild", ongoing: false,
    treatment: "Manual therapy, quad and glute exercises, gait analysis.\n\n2016-06-12: Completed 6 sessions. Knee pain mostly resolved."
  },
  // --- Stressful period + back pain overlap ---
  {
    id: "e4", type: "stress", title: "New job + relocation",
    description: "Moved cities for a demanding new role. Long hours, little routine, poor sleep for months.",
    regions: ["neck", "chest"], date: "2019-01-15", severity: "significant", ongoing: false,
    notes: "Looking back, this was when a lot of physical tension started building up."
  },
  {
    id: "e5", type: "symptom", title: "Upper back and neck tension",
    description: "Persistent tightness across shoulders and upper back. Headaches most afternoons.",
    regions: ["upper-back", "neck", "right-shoulder", "left-shoulder"], date: "2019-02-10", severity: "moderate", ongoing: false,
    notes: "Clearly started during the job transition. Desk setup was terrible at the time."
  },
  {
    id: "e6", type: "symptom", title: "Lower back pain — recurring",
    description: "Deep ache in lower back, worse after sitting. Started waking me at night sometimes.",
    regions: ["lower-back"], date: "2019-04-05", severity: "moderate", ongoing: false,
    notes: "Happened alongside the neck tension. Body was holding a lot."
  },
  {
    id: "e7", type: "treatment", title: "Osteopath — 4 sessions",
    description: "Tried osteopathy for the back and neck. Gentle spinal mobilisation.",
    regions: ["lower-back", "upper-back", "neck"], date: "2019-05-01", severity: "mild", ongoing: false,
    treatment: "Spinal mobilisation, soft tissue work, breathing exercises.\n\nHelpful short-term, but pain returned when stress was high."
  },
  // --- Life event: pregnancy + postpartum ---
  {
    id: "e8", type: "life-event", title: "Pregnancy — first trimester",
    description: "Found out in early January. Nausea, fatigue, emotional adjustment.",
    regions: ["abdomen"], date: "2021-01-18", severity: "mild", ongoing: false,
    notes: "Everything changed. Body started feeling like it belonged to someone else for a while."
  },
  {
    id: "e9", type: "life-event", title: "Mila born 💛",
    description: "Healthy delivery at 39 weeks. Recovery took longer than expected.",
    regions: ["abdomen", "lower-back"], date: "2021-10-03", severity: "mild", ongoing: false,
    notes: "The most intense and beautiful experience. Body needed time."
  },
  // --- Postpartum psoriasis flare ---
  {
    id: "e10", type: "symptom", title: "Psoriasis flare — postpartum",
    description: "Red, scaly patches appeared on elbows, scalp, and behind ears. Never had skin issues before.",
    regions: ["left-arm", "right-arm", "head"], date: "2022-01-15", severity: "significant", ongoing: true,
    notes: "Dermatologist said postpartum hormonal shifts can trigger autoimmune flares. Emotionally hard — felt like my body was turning on itself."
  },
  {
    id: "e11", type: "treatment", title: "Dermatology — ongoing management",
    description: "Topical steroids initially, then moved to a calcineurin inhibitor for maintenance.",
    regions: ["left-arm", "right-arm", "head"], date: "2022-02-20", severity: "mild", ongoing: true,
    treatment: "Betamethasone for flares, tacrolimus for maintenance, coal tar shampoo.\n\n2022-06-01: Patches reduced ~60%.\n\n2023-01-10: Mostly managed, occasional small flares in winter.\n\n2024-09-15: Considering phototherapy referral."
  },
  // --- Current ongoing lower back ---
  {
    id: "e12", type: "symptom", title: "Lower back — returned with parenting",
    description: "The old lower back ache came back. Carrying, bending, broken sleep.",
    regions: ["lower-back", "left-hip"], date: "2023-03-01", severity: "mild", ongoing: true,
    notes: "Different from the 2019 episode — less sharp, more of a constant tiredness in that area."
  },
  {
    id: "e13", type: "treatment", title: "Pilates — weekly class",
    description: "Started a beginner reformer Pilates class focused on core and pelvic floor.",
    regions: ["lower-back", "abdomen"], date: "2023-09-01", severity: "mild", ongoing: true,
    treatment: "Weekly 50-min class. Noticing gradual improvement in core stability and less back fatigue."
  },
  // --- Recent stress period ---
  {
    id: "e14", type: "stress", title: "Return to work — balancing everything",
    description: "Went back to work part-time. Juggling childcare, work deadlines, and health appointments.",
    regions: ["neck", "chest"], date: "2024-02-01", severity: "moderate", ongoing: true,
    notes: "Neck tension is back. Recognising the pattern now — stress sits in my shoulders."
  },
  // --- Positive life event ---
  {
    id: "e15", type: "life-event", title: "Started journaling practice",
    description: "5 minutes each morning. Writing about how my body feels and what I notice.",
    regions: [], date: "2024-06-01", severity: "mild", ongoing: true,
    notes: "This has helped me notice patterns between stress, sleep, and physical symptoms. Small but meaningful."
  },
  // --- Recent symptom ---
  {
    id: "e16", type: "symptom", title: "Right knee — occasional clicking",
    description: "Painless clicking when going up stairs. No swelling.",
    regions: ["right-knee"], date: "2024-11-10", severity: "mild", ongoing: true,
    notes: "Probably nothing, but logging it in case it develops. The left knee history makes me more aware."
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
  currentScreen: "welcome",
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

  const setActiveLayer = (layer: EventType | "all") => {
    setState((s) => ({ ...s, activeLayer: layer }));
  };

  const switchProfile = (profileId: string) => {
    setState((s) => ({ ...s, currentProfile: profileId }));
  };

  const completeOnboarding = () => {
    setState((s) => ({ ...s, hasOnboarded: true, currentScreen: "atlas" }));
  };

  const currentProfile = state.profiles.find((p) => p.id === state.currentProfile);

  return (
    <AppContext.Provider value={{ state, setState, addEvent, updateEvent, deleteEvent, setActiveLayer, switchProfile, completeOnboarding, currentProfile }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
