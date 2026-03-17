import { useMemo } from "react";
import { motion } from "framer-motion";
import { useApp, EventType, REGION_LABELS, BodyEvent } from "@/context/AppContext";

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

const THREE_MONTHS = 90 * 24 * 60 * 60 * 1000;

interface ParallelTimelineProps {
  onNavigateToBody: () => void;
  onNavigateToStory: () => void;
}

const ParallelTimeline = ({ onNavigateToBody, onNavigateToStory }: ParallelTimelineProps) => {
  const { state, setState, visibleEvents } = useApp();

  const filteredEvents = visibleEvents
    .filter((e) => state.activeLayer === "all" || e.type === state.activeLayer)
    .filter((e) => !state.selectedRegion || e.regions.includes(state.selectedRegion))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const years = [...new Set(filteredEvents.map((e) => new Date(e.date).getFullYear()))].sort();
  const displayYears = state.timelineYear > 0 ? years.filter((y) => y === state.timelineYear) : years;

  // Split into life vs body tracks
  const lifeTypes: EventType[] = ["life-event", "stress"];
  const bodyTypes: EventType[] = ["injury", "symptom", "treatment"];

  const lifeEvents = filteredEvents.filter((e) => lifeTypes.includes(e.type));
  const bodyEvents = filteredEvents.filter((e) => bodyTypes.includes(e.type));

  // Find connections (life event within 3 months of body event)
  const connections = useMemo(() => {
    const conns: { lifeId: string; bodyId: string }[] = [];
    lifeEvents.forEach((le) => {
      const leTime = new Date(le.date).getTime();
      bodyEvents.forEach((be) => {
        const beTime = new Date(be.date).getTime();
        if (Math.abs(leTime - beTime) <= THREE_MONTHS) {
          conns.push({ lifeId: le.id, bodyId: be.id });
        }
      });
    });
    return conns;
  }, [lifeEvents, bodyEvents]);

  const connectedLifeIds = new Set(connections.map((c) => c.lifeId));
  const connectedBodyIds = new Set(connections.map((c) => c.bodyId));

  const eventsByYear = (events: BodyEvent[], year: number) =>
    events.filter((e) => new Date(e.date).getFullYear() === year);

  return (
    <div className="pt-8 pb-10 space-y-8" role="region" aria-label="Timeline — your body and your life, side by side">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-[26px] font-serif text-foreground/90 leading-tight">Timeline</h2>
        <p className="text-[13px] text-muted-foreground/45 mt-1.5 leading-relaxed italic font-serif">
          Your body and your life, side by side.
        </p>
        {state.selectedRegion && (
          <div className="mt-2 flex items-center gap-2">
            <span className="chip chip-active text-[11px]">{REGION_LABELS[state.selectedRegion]}</span>
            <button
              onClick={() => setState((s) => ({ ...s, selectedRegion: null }))}
              className="text-[11px] text-muted-foreground/40 hover:text-muted-foreground/60"
            >
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

      {/* Parallel tracks per year */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5 }}
        className="space-y-8"
      >
        {displayYears.map((year, yi) => {
          const yearLife = eventsByYear(lifeEvents, year);
          const yearBody = eventsByYear(bodyEvents, year);
          if (yearLife.length === 0 && yearBody.length === 0) return null;

          return (
            <motion.div
              key={year}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + yi * 0.08, duration: 0.4 }}
            >
              {/* Year header */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[14px] font-serif text-foreground/65">{year}</span>
                <div className="h-px flex-1 bg-border/25" />
              </div>

              <div className="grid grid-cols-[1fr_auto_1fr] gap-0 items-start">
                {/* Life track (left) */}
                <div className="space-y-2 pr-3">
                  {yearLife.length > 0 && (
                    <p className="text-[9px] text-muted-foreground/30 uppercase tracking-[0.15em] mb-2">
                      Life & transitions
                    </p>
                  )}
                  {yearLife.map((event, ei) => (
                    <motion.button
                      key={event.id}
                      onClick={() => setState((s) => ({ ...s, selectedEvent: event.id }))}
                      className={`w-full text-left p-3 rounded-xl hover:bg-secondary/30 transition-all duration-300 ${
                        connectedLifeIds.has(event.id) ? "border-r-2 border-lavender/40" : ""
                      }`}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.35 + yi * 0.08 + ei * 0.04, duration: 0.4 }}
                    >
                      <div className="flex items-center gap-2 mb-0.5">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${typeDotColors[event.type]}`} />
                        <span className="text-[9px] text-muted-foreground/30 uppercase tracking-wider">
                          {typeLabels[event.type]}
                        </span>
                      </div>
                      <p className="text-[13px] font-medium text-foreground/75 leading-snug">
                        {event.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground/35 mt-0.5">
                        {new Date(event.date).toLocaleDateString("en-US", { month: "short" })}
                        {event.ongoing && <span className="ml-1 text-sage-foreground/50">· ongoing</span>}
                      </p>
                    </motion.button>
                  ))}
                  {yearLife.length === 0 && (
                    <div className="py-6" />
                  )}
                </div>

                {/* Central axis with connection dots */}
                <div className="flex flex-col items-center pt-6 relative">
                  <div className="w-px bg-border/30 absolute top-0 bottom-0" />
                  {/* Connection indicators */}
                  {connections
                    .filter((c) => {
                      const lifeEvt = lifeEvents.find((e) => e.id === c.lifeId);
                      return lifeEvt && new Date(lifeEvt.date).getFullYear() === year;
                    })
                    .map((conn, ci) => (
                      <div
                        key={`${conn.lifeId}-${conn.bodyId}`}
                        className="w-1.5 h-1.5 rounded-full bg-lavender-foreground/20 relative z-10 my-4"
                        title="These appeared around the same time"
                      />
                    ))}
                </div>

                {/* Body track (right) */}
                <div className="space-y-2 pl-3">
                  {yearBody.length > 0 && (
                    <p className="text-[9px] text-muted-foreground/30 uppercase tracking-[0.15em] mb-2">
                      Body experiences
                    </p>
                  )}
                  {yearBody.map((event, ei) => (
                    <motion.button
                      key={event.id}
                      onClick={() => setState((s) => ({ ...s, selectedEvent: event.id }))}
                      className={`w-full text-left p-3 rounded-xl hover:bg-secondary/30 transition-all duration-300 ${
                        connectedBodyIds.has(event.id) ? "border-l-2 border-lavender/40" : ""
                      }`}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.35 + yi * 0.08 + ei * 0.04, duration: 0.4 }}
                    >
                      <div className="flex items-center gap-2 mb-0.5">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${typeDotColors[event.type]}`} />
                        <span className="text-[9px] text-muted-foreground/30 uppercase tracking-wider">
                          {typeLabels[event.type]}
                        </span>
                      </div>
                      <p className="text-[13px] font-medium text-foreground/75 leading-snug">
                        {event.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground/35 mt-0.5">
                        {new Date(event.date).toLocaleDateString("en-US", { month: "short" })}
                        {event.ongoing && <span className="ml-1 text-sage-foreground/50">· ongoing</span>}
                        {event.type === "treatment" && event.treatmentOutcome && event.treatmentOutcome !== "not-sure" && (
                          <span className={`ml-1 ${
                            event.treatmentOutcome === "helped" ? "text-sage-foreground/55" :
                            event.treatmentOutcome === "worse" ? "text-body-pain/60" :
                            "text-muted-foreground/35"
                          }`}>
                            · {event.treatmentOutcome === "helped" ? "Helped" : event.treatmentOutcome === "no-change" ? "No change" : "Made worse"}
                          </span>
                        )}
                      </p>
                    </motion.button>
                  ))}
                  {yearBody.length === 0 && (
                    <div className="py-6" />
                  )}
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

export default ParallelTimeline;
