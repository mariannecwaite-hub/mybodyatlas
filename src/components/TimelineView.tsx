import { useRef } from "react";
import { motion } from "framer-motion";
import { useApp, EventType, REGION_LABELS } from "@/context/AppContext";
import { ArrowLeft, ArrowRight } from "lucide-react";

const typeDotColors: Record<EventType, string> = {
  injury: "bg-body-pain",
  symptom: "bg-body-tension",
  stress: "bg-body-tension",
  treatment: "bg-body-healing",
  "life-event": "bg-body-neutral",
};

const typeLabels: Record<EventType, string> = {
  injury: "Injury",
  symptom: "Sensation",
  stress: "Stress",
  treatment: "Treatment",
  "life-event": "Life transition",
};

const typeIcons: Record<EventType, string> = {
  injury: "🩹",
  symptom: "💭",
  stress: "🌊",
  treatment: "🌿",
  "life-event": "⭐",
};

interface TimelineViewProps {
  onNavigateToBody: () => void;
  onNavigateToStory: () => void;
}

const TimelineView = ({ onNavigateToBody, onNavigateToStory }: TimelineViewProps) => {
  const { state, setState, visibleEvents } = useApp();
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredEvents = visibleEvents
    .filter((e) => state.activeLayer === "all" || e.type === state.activeLayer)
    .filter((e) => !state.selectedRegion || e.regions.includes(state.selectedRegion))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const years = [...new Set(filteredEvents.map((e) => new Date(e.date).getFullYear()))].sort();
  
  // Group events by life phase
  const phases: { label: string; yearRange: string; events: typeof filteredEvents }[] = [];
  if (years.length > 0) {
    let phaseStart = years[0];
    let currentPhaseEvents: typeof filteredEvents = [];
    
    years.forEach((year, i) => {
      const yearEvents = filteredEvents.filter((e) => new Date(e.date).getFullYear() === year);
      currentPhaseEvents.push(...yearEvents);
      
      const isLast = i === years.length - 1;
      const gap = !isLast && years[i + 1] - year > 2;
      
      if (isLast || gap || currentPhaseEvents.length >= 5) {
        phases.push({
          label: year === phaseStart ? `${year}` : `${phaseStart}–${year}`,
          yearRange: `${phaseStart}-${year}`,
          events: [...currentPhaseEvents],
        });
        currentPhaseEvents = [];
        if (!isLast) phaseStart = years[i + 1];
      }
    });
    
    if (currentPhaseEvents.length > 0) {
      const lastYear = years[years.length - 1];
      phases.push({
        label: lastYear === phaseStart ? `${lastYear}` : `${phaseStart}–${lastYear}`,
        yearRange: `${phaseStart}-${lastYear}`,
        events: currentPhaseEvents,
      });
    }
  }

  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === "left" ? -280 : 280, behavior: "smooth" });
    }
  };

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
          className="flex gap-1.5 flex-wrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          role="tablist"
          aria-label="Year selector"
        >
          <button
            onClick={() => setState((s) => ({ ...s, timelineYear: 0, activeLayer: "all" }))}
            className={`px-3.5 py-2 rounded-full text-[11px] font-medium transition-all duration-300 ${
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
              className={`px-3 py-2 rounded-full text-[11px] font-medium transition-all duration-300 ${
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

      {/* Horizontal timeline */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5 }}
        className="relative"
      >
        {/* Scroll controls */}
        {phases.length > 2 && (
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 z-10">
            <button onClick={() => scroll("left")} className="p-2 rounded-full bg-card/90 border border-border/20 hover:bg-card transition-colors" style={{ boxShadow: "var(--shadow-sm)" }}>
              <ArrowLeft className="w-3.5 h-3.5 text-muted-foreground/50" />
            </button>
          </div>
        )}
        {phases.length > 2 && (
          <div className="absolute -right-2 top-1/2 -translate-y-1/2 z-10">
            <button onClick={() => scroll("right")} className="p-2 rounded-full bg-card/90 border border-border/20 hover:bg-card transition-colors" style={{ boxShadow: "var(--shadow-sm)" }}>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/50" />
            </button>
          </div>
        )}

        <div ref={scrollRef} className="overflow-x-auto scrollbar-hide pb-4 -mx-2 px-2" style={{ scrollbarWidth: "none" }}>
          <div className="flex gap-4 min-w-min">
            {phases.map((phase, pi) => (
              <motion.div
                key={phase.yearRange}
                className="flex-shrink-0 w-[260px]"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + pi * 0.08, duration: 0.4 }}
              >
                {/* Phase header */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px flex-1 bg-border/30" />
                  <span className="text-[11px] font-medium text-muted-foreground/45 tracking-wide">{phase.label}</span>
                  <div className="h-px flex-1 bg-border/30" />
                </div>

                {/* Phase events */}
                <div className="space-y-1.5">
                  {phase.events.map((event, ei) => (
                    <motion.button
                      key={event.id}
                      onClick={() => setState((s) => ({ ...s, selectedEvent: event.id }))}
                      className="w-full flex items-start gap-3 p-3 rounded-xl text-left hover:bg-secondary/30 group"
                      aria-label={`${event.title} — ${new Date(event.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}`}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: 0.4 + pi * 0.08 + ei * 0.05,
                        duration: 0.5,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      whileHover={{ x: 4, transition: { duration: 0.3 } }}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        <motion.div
                          className={`w-2 h-2 rounded-full ${typeDotColors[event.type]}`}
                          whileHover={{ scale: 1.5 }}
                          transition={{ type: "spring", stiffness: 400, damping: 15 }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-foreground/75 truncate leading-snug">
                          {event.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-muted-foreground/35">
                            {new Date(event.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                          </span>
                          {event.ongoing && (
                            <span className="inline-flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-sage-foreground/30 animate-soft-pulse" />
                              <span className="text-[10px] text-sage-foreground/45">ongoing</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Vertical detailed list for selected year */}
      {state.timelineYear > 0 && (
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border/25" />
            <span className="text-[11px] text-muted-foreground/35 tracking-wide">Detail view · {state.timelineYear}</span>
            <div className="h-px flex-1 bg-border/25" />
          </div>

          <div className="relative pl-5">
            <div className="absolute left-[6.5px] top-4 bottom-4 w-px bg-border/30" />
            <div className="space-y-1.5">
              {filteredEvents
                .filter((e) => new Date(e.date).getFullYear() === state.timelineYear)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((event, i) => (
                  <motion.button
                    key={event.id}
                    onClick={() => setState((s) => ({ ...s, selectedEvent: event.id }))}
                    className="w-full flex items-start gap-4 p-4 pl-7 rounded-2xl text-left hover:bg-secondary/30 transition-all duration-400 group relative"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.4 }}
                  >
                    <div className={`absolute left-0 top-[21px] w-[7px] h-[7px] rounded-full border-[1.5px] border-background ${typeDotColors[event.type]} z-10`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px]">{typeIcons[event.type]}</span>
                        <span className="text-[10px] text-muted-foreground/30 uppercase tracking-wider">{typeLabels[event.type]}</span>
                      </div>
                      <p className="text-[14px] font-medium text-foreground/80 truncate leading-snug">
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
      )}

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
