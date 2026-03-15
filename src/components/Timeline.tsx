import { useApp, EventType } from "@/context/AppContext";
import { motion } from "framer-motion";

const typeIcons: Record<EventType, string> = {
  injury: "🩹",
  symptom: "💭",
  stress: "🌊",
  treatment: "🌿",
  "life-event": "⭐",
};

const typeDotColors: Record<EventType, string> = {
  injury: "bg-body-pain",
  symptom: "bg-body-tension",
  stress: "bg-body-tension",
  treatment: "bg-body-healing",
  "life-event": "bg-body-neutral",
};

const Timeline = () => {
  const { state, setState } = useApp();

  const filteredEvents = state.events
    .filter((e) => state.activeLayer === "all" || e.type === state.activeLayer)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const years = [...new Set(filteredEvents.map((e) => new Date(e.date).getFullYear()))].sort((a, b) => b - a);

  const visibleEvents = filteredEvents.filter(
    (e) => new Date(e.date).getFullYear() === state.timelineYear
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="section-label">Timeline</span>
        <div className="flex gap-0.5">
          {years.map((year) => (
            <button
              key={year}
              onClick={() => setState((s) => ({ ...s, timelineYear: year }))}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-300 ${
                state.timelineYear === year
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground/60 hover:text-muted-foreground"
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline entries with left line */}
      <div className="relative pl-4">
        {/* Vertical line */}
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />

        <div className="space-y-0.5">
          {visibleEvents.map((event, i) => (
            <motion.button
              key={event.id}
              onClick={() => setState((s) => ({ ...s, selectedEvent: event.id }))}
              className="w-full flex items-start gap-3 p-3 pl-5 rounded-xl text-left hover:bg-secondary/50 transition-all duration-300 group relative"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
            >
              {/* Timeline dot */}
              <div className={`absolute left-0 top-[18px] w-[9px] h-[9px] rounded-full border-2 border-card ${typeDotColors[event.type]} z-10`} />

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground/90 truncate leading-snug">{event.title}</p>
                <p className="text-xs text-muted-foreground/70 mt-0.5">
                  {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  {event.ongoing && (
                    <span className="ml-1.5 inline-flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-sage-foreground/50 animate-breathe" />
                      <span className="text-sage-foreground/70">ongoing</span>
                    </span>
                  )}
                </p>
              </div>
              <span className="opacity-0 group-hover:opacity-60 text-muted-foreground transition-opacity duration-300 text-xs mt-0.5">→</span>
            </motion.button>
          ))}

          {visibleEvents.length === 0 && (
            <p className="text-sm text-muted-foreground/50 py-6 text-center">
              No events for this year
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Timeline;
