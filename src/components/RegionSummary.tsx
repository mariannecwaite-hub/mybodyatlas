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
        className="rounded-2xl border border-border/30 bg-card/80 backdrop-blur-sm p-6 relative overflow-hidden"
        style={{ boxShadow: "var(--shadow-md)" }}
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {/* Close */}
        <button
          onClick={() => selectRegion(null)}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-secondary/60 transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground/40" />
        </button>

        {/* Region name */}
        <h3 className="text-lg font-serif text-foreground mb-1.5">
          {REGION_LABELS[region]}
        </h3>

        {/* Summary line */}
        {regionEvents.length === 0 ? (
          <p className="text-[13px] text-muted-foreground/50 mb-5 leading-relaxed">
            Nothing recorded here yet.
          </p>
        ) : (
          <p className="text-[13px] text-muted-foreground/55 mb-5">
            {regionEvents.length} {regionEvents.length === 1 ? "event" : "events"}
            {firstDate && <span> · since {firstDate}</span>}
            {ongoingCount > 0 && <span> · {ongoingCount} ongoing</span>}
          </p>
        )}

        {/* Recent events (max 3) */}
        {regionEvents.length > 0 && (
          <div className="space-y-0.5 mb-5">
            {regionEvents.slice(0, 3).map((event) => (
              <button
                key={event.id}
                onClick={() => setState((s) => ({ ...s, selectedEvent: event.id }))}
                className="w-full flex items-center gap-3 p-3 rounded-xl text-left hover:bg-secondary/40 transition-all duration-200 group"
              >
                <span className="text-[13px]">{typeIcons[event.type]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-foreground/80 truncate">{event.title}</p>
                  <p className="text-[11px] text-muted-foreground/45 mt-0.5">
                    {new Date(event.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    {event.ongoing && <span className="ml-1 text-sage-foreground/60">· ongoing</span>}
                  </p>
                </div>
                <span className="opacity-0 group-hover:opacity-40 text-muted-foreground text-xs">→</span>
              </button>
            ))}
            {regionEvents.length > 3 && (
              <p className="text-[11px] text-muted-foreground/35 text-center pt-2">
                + {regionEvents.length - 3} more
              </p>
            )}
          </div>
        )}

        {/* Add event button */}
        <button
          onClick={() => onAddEvent(region)}
          className="w-full flex items-center justify-center gap-1.5 py-3 rounded-xl border border-dashed border-border/50 text-[12px] text-muted-foreground/50 hover:text-muted-foreground/70 hover:border-border transition-all duration-200"
        >
          <Plus className="w-3.5 h-3.5" /> Add event here
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

export default RegionSummary;
