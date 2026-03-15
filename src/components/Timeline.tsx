import { useApp, EventType, REGION_LABELS } from "@/context/AppContext";
import { motion } from "framer-motion";

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
    .filter((e) => !state.selectedRegion || e.regions.includes(state.selectedRegion))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const years = [...new Set(filteredEvents.map((e) => new Date(e.date).getFullYear()))].sort((a, b) => b - a);
  const effectiveYear = years.includes(state.timelineYear) ? state.timelineYear : (years[0] || state.timelineYear);

  const visibleEvents = filteredEvents.filter(
    (e) => new Date(e.date).getFullYear() === effectiveYear
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-xl font-serif text-foreground leading-tight">Timeline</h2>
          {state.selectedRegion && (
            <p className="text-[12px] text-muted-foreground/50 mt-0.5">
              Showing {REGION_LABELS[state.selectedRegion]}
            </p>
          )}
        </div>
        <div className="flex gap-1 flex-wrap justify-end">
          {years.map((year) => (
            <button
              key={year}
              onClick={() => setState((s) => ({ ...s, timelineYear: year }))}
              className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-all duration-300 ${
                effectiveYear === year
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground/45 hover:text-muted-foreground hover:bg-secondary/40"
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline list */}
      <div className="relative pl-5">
        <div className="absolute left-[7px] top-3 bottom-3 w-px bg-border/60" />

        <div className="space-y-1">
          {visibleEvents.map((event, i) => (
            <motion.button
              key={event.id}
              onClick={() => setState((s) => ({ ...s, selectedEvent: event.id }))}
              className="w-full flex items-start gap-3.5 p-3.5 pl-6 rounded-2xl text-left hover:bg-secondary/40 transition-all duration-300 group relative"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.35 }}
            >
              {/* Timeline dot */}
              <div className={`absolute left-0 top-[19px] w-[8px] h-[8px] rounded-full border-[1.5px] border-card ${typeDotColors[event.type]} z-10`} />
              
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium text-foreground/85 truncate leading-snug">
                  {event.title}
                </p>
                <p className="text-[12px] text-muted-foreground/55 mt-1">
                  {new Date(event.date).toLocaleDateString("en-US", { month: "long", day: "numeric" })}
                  {event.ongoing && (
                    <span className="ml-2 inline-flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-sage-foreground/40 animate-breathe" />
                      <span className="text-sage-foreground/60">ongoing</span>
                    </span>
                  )}
                </p>
              </div>
              <span className="opacity-0 group-hover:opacity-40 text-muted-foreground transition-opacity duration-300 text-[11px] mt-1">→</span>
            </motion.button>
          ))}

          {visibleEvents.length === 0 && (
            <p className="text-[13px] text-muted-foreground/40 py-10 text-center leading-relaxed">
              {state.selectedRegion
                ? "Nothing recorded here for this year"
                : "No events for this year"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Timeline;
