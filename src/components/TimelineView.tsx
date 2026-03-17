import { motion } from "framer-motion";
import { useApp, EventType, REGION_LABELS } from "@/context/AppContext";

const typeDotColors: Record<EventType, string> = {
  injury: "bg-body-pain",
  symptom: "bg-body-tension",
  stress: "bg-body-tension",
  treatment: "bg-body-healing",
  "life-event": "bg-body-neutral",
  "safety-experience": "bg-body-neutral",
};

const typeLabels: Record<EventType, string> = {
  injury: "Injury",
  symptom: "Sensation",
  stress: "Stress",
  treatment: "Treatment",
  "life-event": "Transition",
  "safety-experience": "Experience",
};

interface TimelineViewProps {
  onNavigateToBody: () => void;
  onNavigateToStory: () => void;
}

const TimelineView = ({ onNavigateToBody, onNavigateToStory }: TimelineViewProps) => {
  const { state, setState, visibleEvents } = useApp();

  const filteredEvents = visibleEvents
    .filter((e) => state.activeLayer === "all" || e.type === state.activeLayer)
    .filter((e) => !state.selectedRegion || e.regions.includes(state.selectedRegion))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const years = [...new Set(filteredEvents.map((e) => new Date(e.date).getFullYear()))].sort();

  // Group events by year
  const eventsByYear = years.reduce((acc, year) => {
    acc[year] = filteredEvents.filter((e) => new Date(e.date).getFullYear() === year);
    return acc;
  }, {} as Record<number, typeof filteredEvents>);

  // Filter by selected year
  const displayYears = state.timelineYear > 0 ? years.filter(y => y === state.timelineYear) : years;

  return (
    <div className="pt-8 pb-10 space-y-8" role="region" aria-label="Timeline — your body events across life phases">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-[26px] font-serif text-foreground/90 leading-tight">Timeline</h2>
        <p className="text-[13px] text-muted-foreground/45 mt-1.5 leading-relaxed">
          Your body events across life phases
        </p>
        {state.selectedRegion && (
          <div className="mt-2 flex items-center gap-2">
            <span className="chip chip-active text-[11px]">{REGION_LABELS[state.selectedRegion]}</span>
            <button onClick={() => setState((s) => ({ ...s, selectedRegion: null }))} className="text-[11px] text-muted-foreground/40 hover:text-muted-foreground/60">
              Clear filter
            </button>
          </div>
        )}
      </motion.div>

      {/* Year navigation */}
      {years.length > 0 && (
        <motion.div
          className="flex gap-1.5 overflow-x-auto pb-1 -mx-2 px-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          role="tablist"
          aria-label="Year selector"
          style={{ scrollbarWidth: "none" }}
        >
          <button
            onClick={() => setState((s) => ({ ...s, timelineYear: 0, activeLayer: "all" }))}
            className={`flex-shrink-0 px-3.5 py-2 rounded-full text-[11px] font-medium transition-all duration-300 ${
              state.timelineYear === 0
                ? "bg-primary/85 text-primary-foreground"
                : "text-muted-foreground/35 hover:text-muted-foreground/55"
            }`}
          >
            All years
          </button>
          {years.map((year) => (
            <button
              key={year}
              role="tab"
              aria-selected={state.timelineYear === year}
              onClick={() => setState((s) => ({ ...s, timelineYear: year }))}
              className={`flex-shrink-0 px-3 py-2 rounded-full text-[11px] font-medium transition-all duration-300 ${
                state.timelineYear === year
                  ? "bg-primary/85 text-primary-foreground"
                  : "text-muted-foreground/35 hover:text-muted-foreground/55"
              }`}
            >
              {year}
            </button>
          ))}
        </motion.div>
      )}

      {/* Vertical timeline with year headers */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5 }}
        className="space-y-6"
      >
        {displayYears.map((year, yi) => {
          const yearEvents = eventsByYear[year] || [];
          return (
            <motion.div
              key={year}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + yi * 0.08, duration: 0.4 }}
            >
              {/* Year header */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[14px] font-serif text-foreground/65">{year}</span>
                <div className="h-px flex-1 bg-border/25" />
                <span className="text-[10px] text-muted-foreground/30">{yearEvents.length} events</span>
              </div>

              {/* Events in year */}
              <div className="relative pl-5">
                <div className="absolute left-[6.5px] top-2 bottom-2 w-px bg-border/25" />
                <div className="space-y-1">
                  {yearEvents.map((event, ei) => (
                    <motion.button
                      key={event.id}
                      onClick={() => setState((s) => ({ ...s, selectedEvent: event.id }))}
                      className="w-full flex items-start gap-3 p-3 pl-5 rounded-xl text-left hover:bg-secondary/30 transition-all duration-300 group relative"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 + yi * 0.08 + ei * 0.04, duration: 0.4 }}
                    >
                      {/* Timeline dot */}
                      <div className={`absolute left-0 top-[16px] w-[7px] h-[7px] rounded-full border-[1.5px] border-background ${typeDotColors[event.type]} z-10`} />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${typeDotColors[event.type]}`} />
                          <span className="text-[10px] text-muted-foreground/30 uppercase tracking-wider">{typeLabels[event.type]}</span>
                        </div>
                        <p className="text-[14px] font-medium text-foreground/80 leading-snug">
                          {event.title}
                        </p>
                        <p className="text-[12px] text-muted-foreground/40 mt-1">
                          {new Date(event.date).toLocaleDateString("en-US", { month: "long", day: "numeric" })}
                          {event.ongoing && (
                            <span className="ml-2 text-sage-foreground/50">· ongoing</span>
                          )}
                        </p>
                        {event.regions.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {event.regions.slice(0, 3).map((r) => (
                              <span key={r} className="text-[9px] px-2 py-0.5 rounded-full bg-secondary/50 text-muted-foreground/40">
                                {REGION_LABELS[r]}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {filteredEvents.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-[14px] font-serif text-foreground/60 mb-2">No events yet</p>
          <p className="text-[12px] text-muted-foreground/40">
            As you add body events, they'll appear here across your life timeline.
          </p>
        </div>
      )}

      {/* Navigation connectors */}
      <div className="flex items-center justify-center gap-6 pt-6">
        <button
          onClick={onNavigateToBody}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-secondary/40 border border-border/20 text-[11px] text-muted-foreground/50 hover:text-muted-foreground/70 hover:bg-secondary/60 transition-all duration-300"
        >
          <span>←</span> Body Map
        </button>
        <button
          onClick={onNavigateToStory}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-secondary/40 border border-border/20 text-[11px] text-muted-foreground/50 hover:text-muted-foreground/70 hover:bg-secondary/60 transition-all duration-300"
        >
          Body Story <span>→</span>
        </button>
      </div>
    </div>
  );
};

export default TimelineView;
