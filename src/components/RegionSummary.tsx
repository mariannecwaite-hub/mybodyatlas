import { motion, AnimatePresence } from "framer-motion";
import { useApp, BodyRegion, REGION_LABELS, EventType, REGION_A11Y } from "@/context/AppContext";
import { X, Plus, Link2 } from "lucide-react";

const typeIcons: Record<EventType, string> = {
  injury: "🩹", symptom: "💭", stress: "🌊", treatment: "🌿", "life-event": "⭐",
};

/** Biomechanical connections between regions */
const CONNECTED_REGIONS: Record<string, BodyRegion[]> = {
  ankle_foot_left: ["knee_left", "hip_left", "lower_back"],
  ankle_foot_right: ["knee_right", "hip_right", "lower_back"],
  knee_left: ["ankle_foot_left", "hip_left", "lower_back"],
  knee_right: ["ankle_foot_right", "hip_right", "lower_back"],
  hip_left: ["knee_left", "lower_back", "ankle_foot_left"],
  hip_right: ["knee_right", "lower_back", "ankle_foot_right"],
  lower_back: ["hip_left", "hip_right", "upper_back"],
  upper_back: ["lower_back", "neck", "shoulder_left", "shoulder_right"],
  neck: ["head_jaw", "upper_back", "shoulder_left", "shoulder_right"],
  head_jaw: ["neck"],
  shoulder_left: ["neck", "upper_back", "wrist_hand_left"],
  shoulder_right: ["neck", "upper_back", "wrist_hand_right"],
  chest: ["upper_back", "shoulder_left", "shoulder_right"],
  abdomen: ["lower_back", "hip_left", "hip_right"],
  wrist_hand_left: ["shoulder_left"],
  wrist_hand_right: ["shoulder_right"],
};

interface RegionSummaryProps {
  onAddEvent: (region: BodyRegion) => void;
}

const RegionSummary = ({ onAddEvent }: RegionSummaryProps) => {
  const { state, selectRegion, setState, visibleEvents } = useApp();
  const region = state.selectedRegion;

  if (!region) return null;

  const regionEvents = visibleEvents
    .filter((e) => e.regions.includes(region) && (state.activeLayer === "all" || e.type === state.activeLayer))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const ongoingCount = regionEvents.filter((e) => e.ongoing).length;
  const firstDate = regionEvents.length > 0
    ? new Date(regionEvents[regionEvents.length - 1].date).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : null;

  // Connected regions that also have events
  const connected = (CONNECTED_REGIONS[region] || []).filter((r) =>
    visibleEvents.some((e) => e.regions.includes(r))
  );

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={region}
        className="rounded-2xl border border-border/20 bg-card/70 backdrop-blur-md p-7 relative overflow-hidden"
        style={{ boxShadow: "var(--shadow-md)" }}
        initial={{ opacity: 0, y: 16, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -12, scale: 0.97 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        role="region"
        aria-label={REGION_A11Y[region]}
      >
        <button
          onClick={() => selectRegion(null)}
          className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-secondary/50 transition-colors duration-300"
          aria-label="Close this area summary"
        >
          <X className="w-3.5 h-3.5 text-muted-foreground/30" />
        </button>

        <h3 className="text-[18px] font-serif text-foreground/85 mb-1.5 leading-tight">
          {REGION_LABELS[region]}
        </h3>

        {regionEvents.length === 0 ? (
          <p className="text-[13px] text-muted-foreground/40 mb-6 leading-relaxed">
            Nothing recorded here yet. That's perfectly fine.
          </p>
        ) : (
          <p className="text-[12px] text-muted-foreground/45 mb-6 tracking-wide">
            {regionEvents.length} {regionEvents.length === 1 ? "event" : "events"}
            {firstDate && <span> · since {firstDate}</span>}
            {ongoingCount > 0 && <span> · {ongoingCount} ongoing</span>}
          </p>
        )}

        {regionEvents.length > 0 && (
          <div className="space-y-1 mb-4">
            {regionEvents.slice(0, 4).map((event, i) => (
              <motion.button
                key={event.id}
                onClick={() => setState((s) => ({ ...s, selectedEvent: event.id }))}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left group ${
                  state.highlightedEventIds.includes(event.id)
                    ? "bg-primary/8 ring-1 ring-primary/15"
                    : "hover:bg-secondary/25"
                }`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ x: 3, transition: { duration: 0.25 } }}
                aria-label={`${event.title}, ${new Date(event.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}${event.ongoing ? ", still ongoing" : ""}`}
              >
                <span className="text-[12px]" aria-hidden="true">{typeIcons[event.type]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-foreground/75 truncate">{event.title}</p>
                  <p className="text-[11px] text-muted-foreground/35 mt-0.5">
                    {new Date(event.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    {event.ongoing && <span className="ml-1.5 text-sage-foreground/50">· ongoing</span>}
                  </p>
                </div>
                <span className="opacity-0 group-hover:opacity-30 text-muted-foreground text-[10px]" aria-hidden="true">→</span>
              </button>
            ))}
            {regionEvents.length > 4 && (
              <p className="text-[10px] text-muted-foreground/28 text-center pt-2 tracking-wide">
                + {regionEvents.length - 4} more
              </p>
            )}
          </div>
        )}

        {/* Connected regions */}
        {connected.length > 0 && (
          <motion.div
            className="mb-4 p-3 rounded-xl bg-sage/8 border border-sage/12"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <Link2 className="w-3 h-3 text-sage-foreground/40" />
              <p className="text-[10px] font-medium text-sage-foreground/50 uppercase tracking-wider">Connected areas</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {connected.map((r) => {
                const count = visibleEvents.filter((e) => e.regions.includes(r)).length;
                return (
                  <button
                    key={r}
                    onClick={() => selectRegion(r)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-card/60 border border-border/15 text-[11px] text-foreground/55 hover:text-foreground/75 hover:bg-card transition-all duration-200"
                  >
                    {REGION_LABELS[r]}
                    <span className="text-[9px] text-muted-foreground/30">·{count}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-muted-foreground/30 mt-2 leading-relaxed">
              Areas that may be biomechanically related to your {REGION_LABELS[region].toLowerCase()}.
            </p>
          </motion.div>
        )}

        <button
          onClick={() => onAddEvent(region)}
          className="w-full flex items-center justify-center gap-1.5 py-3 rounded-xl border border-dashed border-border/35 text-[11px] text-muted-foreground/40 hover:text-muted-foreground/60 hover:border-border/50 transition-all duration-300"
        >
          <Plus className="w-3.5 h-3.5" aria-hidden="true" /> Add event here
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

export default RegionSummary;
