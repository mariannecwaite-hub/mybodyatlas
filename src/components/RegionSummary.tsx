import { motion, AnimatePresence } from "framer-motion";
import { useApp, BodyRegion, REGION_LABELS, EventType } from "@/context/AppContext";
import { X, Plus } from "lucide-react";

const typeIcons: Record<EventType, string> = {
  injury: "🩹", symptom: "💭", stress: "🌊", treatment: "🌿", "life-event": "⭐",
};

interface RegionSummaryProps {
  onAddEvent: (region: BodyRegion) => void;
}

const RegionSummary = ({ onAddEvent }: RegionSummaryProps) => {
  const { state, selectRegion, setState } = useApp();
  const region = state.selectedRegion;

  if (!region) return null;

  const regionEvents = state.events
    .filter((e) => e.regions.includes(region) && (state.activeLayer === "all" || e.type === state.activeLayer))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const ongoingCount = regionEvents.filter((e) => e.ongoing).length;
  const firstDate = regionEvents.length > 0
    ? new Date(regionEvents[regionEvents.length - 1].date).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : null;

  return (
    <AnimatePresence>
      <motion.div
        key={region}
        className="rounded-2xl border border-border/20 bg-card/70 backdrop-blur-md p-7 relative overflow-hidden"
        style={{ boxShadow: "var(--shadow-md)" }}
        initial={{ opacity: 0, y: 12, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {/* Close */}
        <button
          onClick={() => selectRegion(null)}
          className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-secondary/50 transition-colors duration-300"
        >
          <X className="w-3.5 h-3.5 text-muted-foreground/30" />
        </button>

        {/* Region name */}
        <h3 className="text-[18px] font-serif text-foreground/85 mb-1.5 leading-tight">
          {REGION_LABELS[region]}
        </h3>

        {/* Summary */}
        {regionEvents.length === 0 ? (
          <p className="text-[13px] text-muted-foreground/40 mb-6 leading-relaxed">
            Nothing recorded here yet.
          </p>
        ) : (
          <p className="text-[12px] text-muted-foreground/45 mb-6 tracking-wide">
            {regionEvents.length} {regionEvents.length === 1 ? "event" : "events"}
            {firstDate && <span> · since {firstDate}</span>}
            {ongoingCount > 0 && <span> · {ongoingCount} ongoing</span>}
          </p>
        )}

        {/* Recent events */}
        {regionEvents.length > 0 && (
          <div className="space-y-1 mb-6">
            {regionEvents.slice(0, 3).map((event) => (
              <button
                key={event.id}
                onClick={() => setState((s) => ({ ...s, selectedEvent: event.id }))}
                className="w-full flex items-center gap-3 p-3 rounded-xl text-left hover:bg-secondary/25 transition-all duration-300 group"
              >
                <span className="text-[12px]">{typeIcons[event.type]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-foreground/75 truncate">{event.title}</p>
                  <p className="text-[11px] text-muted-foreground/35 mt-0.5">
                    {new Date(event.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    {event.ongoing && <span className="ml-1.5 text-sage-foreground/50">· ongoing</span>}
                  </p>
                </div>
                <span className="opacity-0 group-hover:opacity-30 text-muted-foreground text-[10px]">→</span>
              </button>
            ))}
            {regionEvents.length > 3 && (
              <p className="text-[10px] text-muted-foreground/28 text-center pt-2 tracking-wide">
                + {regionEvents.length - 3} more
              </p>
            )}
          </div>
        )}

        {/* Add event */}
        <button
          onClick={() => onAddEvent(region)}
          className="w-full flex items-center justify-center gap-1.5 py-3 rounded-xl border border-dashed border-border/35 text-[11px] text-muted-foreground/40 hover:text-muted-foreground/60 hover:border-border/50 transition-all duration-300"
        >
          <Plus className="w-3.5 h-3.5" /> Add event here
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

export default RegionSummary;
