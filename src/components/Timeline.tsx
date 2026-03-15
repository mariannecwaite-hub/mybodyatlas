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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-[22px] font-serif text-foreground/90 leading-tight">Timeline</h2>
          {state.selectedRegion && (
            <p className="text-[11px] text-muted-foreground/40 mt-1 tracking-wide">
              {REGION_LABELS[state.selectedRegion]}
            </p>
          )}
        </div>
        <div className="flex gap-0.5 flex-wrap justify-end">
          {years.map((year) => (
            <button
              key={year}
              onClick={() => setState((s) => ({ ...s, timelineYear: year }))}
              className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all duration-400 ${
                effectiveYear === year
                  ? "bg-primary/85 text-primary-foreground"
                  : "text-muted-foreground/35 hover:text-muted-foreground/60"
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      {/* Events */}
      <div className="relative pl-5">
        <div className="absolute left-[6.5px] top-4 bottom-4 w-px bg-border/40" />

        <div className="space-y-1.5">
          {visibleEvents.map((event, i) => (
            <motion.button
              key={event.id}
              onClick={() => setState((s) => ({ ...s, selectedEvent: event.id }))}
              className="w-full flex items-start gap-4 p-4 pl-7 rounded-2xl text-left hover:bg-secondary/30 transition-all duration-400 group relative"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.4, ease: "easeOut" }}
            >
              {/* Dot */}
              <div className={`absolute left-0 top-[21px] w-[7px] h-[7px] rounded-full border-[1.5px] border-background ${typeDotColors[event.type]} z-10`} />
              
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium text-foreground/80 truncate leading-snug">
                  {event.title}
                </p>
                <p className="text-[12px] text-muted-foreground/40 mt-1.5">
                  {new Date(event.date).toLocaleDateString("en-US", { month: "long", day: "numeric" })}
                  {event.ongoing && (
                    <span className="ml-2 inline-flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-sage-foreground/30 animate-breathe" />
                      <span className="text-sage-foreground/50">ongoing</span>
                    </span>
                  )}
                </p>
              </div>
              <span className="opacity-0 group-hover:opacity-30 text-muted-foreground transition-opacity duration-400 text-[10px] mt-1.5">→</span>
            </motion.button>
          ))}

          {visibleEvents.length === 0 && (
            <div className="py-14 text-center">
              <p className="text-[13px] text-muted-foreground/30 leading-relaxed">
                {state.selectedRegion
                  ? "Nothing recorded here for this year"
                  : "No events for this year"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Timeline;
