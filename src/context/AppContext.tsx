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
  { id: "p1", name: "Alex", type: "adult", avatar: "🙂", birthYear: 1990 },
];

const sampleEvents: BodyEvent[] = [
  {
    id: "e1", type: "injury", title: "Sprained ankle", description: "Twisted while walking on uneven ground",
    regions: ["left-foot"], date: "2023-06-15", severity: "moderate", ongoing: false,
    treatment: "Rest, ice, compression bandage for 2 weeks"
  },
  {
    id: "e2", type: "symptom", title: "Lower back tension", description: "Recurring tightness after long desk sessions",
    regions: ["lower-back"], date: "2024-01-10", severity: "mild", ongoing: true,
    notes: "Usually eases with movement and stretching"
  },
  {
    id: "e3", type: "stress", title: "Work transition period", description: "Adjusting to a new role with increased responsibilities",
    regions: ["neck", "chest"], date: "2024-03-01", severity: "significant", ongoing: false,
    notes: "Noticed more tension in shoulders during this time"
  },
  {
    id: "e4", type: "treatment", title: "Physiotherapy sessions", description: "Weekly sessions for back and posture",
    regions: ["lower-back", "upper-back"], date: "2024-02-01", severity: "mild", ongoing: true,
    treatment: "Manual therapy + prescribed exercises"
  },
  {
    id: "e5", type: "life-event", title: "Started daily walks", description: "Began 30-minute morning walks",
    regions: [], date: "2024-04-01", severity: "mild", ongoing: true,
    notes: "Noticed general improvement in how my body feels"
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
