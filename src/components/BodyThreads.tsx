import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp, REGION_LABELS } from "@/context/AppContext";
import { useBodyThreads } from "@/hooks/useBodyThreads";
import { ChevronDown, ChevronUp } from "lucide-react";

const BodyThreads = () => {
  const { visibleEvents, highlightInsight, setState } = useApp();
  const threads = useBodyThreads(visibleEvents);
  const [expandedThread, setExpandedThread] = useState<string | null>(null);

  if (threads.length === 0) return null;

  const ongoingThreads = threads.filter((t) => t.isOngoing);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      <div className="flex items-baseline justify-between mb-3">
        <p className="section-label">Body Threads</p>
        {ongoingThreads.length > 0 && (
          <span className="text-[10px] text-muted-foreground/35">
            {ongoingThreads.length} ongoing
          </span>
        )}
      </div>
      <p className="text-[12px] text-muted-foreground/45 mb-4 leading-relaxed">
        Connections between experiences across time
      </p>

      <div className="space-y-2">
        {threads.map((thread, i) => {
          const isExpanded = expandedThread === thread.id;
          const threadEvents = visibleEvents.filter((e) => thread.eventIds.includes(e.id));

          // Compute mini timeline data for collapsed view
          const threadYears = threadEvents.map(e => new Date(e.date).getFullYear());
          const uniqueYears = [...new Set(threadYears)].sort();
          const minYear = Math.min(...threadYears);
          const maxYear = Math.max(...threadYears);
          const yearSpan = maxYear - minYear || 1;

          return (
            <motion.div
              key={thread.id}
              className="rounded-2xl border border-border/20 bg-card/60 overflow-hidden transition-all duration-300"
              style={{ boxShadow: "var(--shadow-xs)" }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.06, duration: 0.4 }}
            >
              <button
                onClick={() => {
                  setExpandedThread(isExpanded ? null : thread.id);
                  if (!isExpanded) {
                    highlightInsight(thread.id, thread.regions, thread.eventIds);
                  }
                }}
                className="w-full flex flex-col gap-2 p-4 text-left hover:bg-secondary/20 transition-colors duration-200"
              >
                <div className="flex items-center gap-3 w-full">
                  {/* Thread indicator */}
                  <div className="w-1 h-5 rounded-full bg-sage/30 flex-shrink-0" />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[14px] font-serif text-foreground/80 truncate">{thread.label}</p>
                      {thread.isOngoing && (
                        <span className="w-1.5 h-1.5 rounded-full bg-sage/60 animate-breathe flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground/40 mt-0.5">
                      {thread.eventCount} events · {thread.yearSpan}
                    </p>
                  </div>

                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground/25 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground/25 flex-shrink-0" />
                  )}
                </div>

                {/* Mini timeline — visible in collapsed state */}
                {!isExpanded && uniqueYears.length > 1 && (
                  <div className="relative h-5 w-full ml-4 mr-8">
                    <div className="absolute top-1/2 left-6 right-6 h-px bg-border/25 -translate-y-1/2" />
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 text-[9px] text-muted-foreground/30">{minYear}</span>
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 text-[9px] text-muted-foreground/30">{maxYear}</span>
                    {uniqueYears.map(year => {
                      const pct = yearSpan > 0 ? ((year - minYear) / yearSpan) * 100 : 50;
                      return (
                        <div
                          key={year}
                          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-sage/50 border border-sage/30"
                          style={{ left: `calc(24px + ${Math.max(0, Math.min(100, pct))}% * (100% - 48px) / 100%)` }}
                          title={`${year}`}
                        />
                      );
                    })}
                  </div>
                )}
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    className="px-4 pb-4"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <p className="text-[12px] text-muted-foreground/50 leading-relaxed mb-3">
                      {thread.description}
                    </p>

                    {/* Expanded year timeline */}
                    {uniqueYears.length > 1 && (
                      <div className="relative h-8 mb-3 mx-1">
                        <div className="absolute top-1/2 left-4 right-4 h-px bg-border/25 -translate-y-1/2" />
                        <span className="absolute left-0 top-1/2 -translate-y-full text-[9px] text-muted-foreground/30 pb-1">{minYear}</span>
                        {maxYear !== minYear && (
                          <span className="absolute right-0 top-1/2 -translate-y-full text-[9px] text-muted-foreground/30 pb-1">{maxYear}</span>
                        )}
                        {uniqueYears.map(year => {
                          const pct = yearSpan > 0 ? ((year - minYear) / yearSpan) * 100 : 50;
                          return (
                            <div
                              key={year}
                              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-sage/50 border border-sage/30"
                              style={{ left: `${Math.max(5, Math.min(95, pct))}%` }}
                              title={`${year}`}
                            />
                          );
                        })}
                      </div>
                    )}

                    {/* Thread regions */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {thread.regions.slice(0, 5).map((r) => (
                        <span
                          key={r}
                          className="px-2 py-0.5 rounded-full bg-sage/15 text-[10px] text-sage-foreground/60 font-medium"
                        >
                          {REGION_LABELS[r]}
                        </span>
                      ))}
                      {thread.regions.length > 5 && (
                        <span className="text-[10px] text-muted-foreground/30 self-center">
                          +{thread.regions.length - 5} more
                        </span>
                      )}
                    </div>

                    {/* Thread events */}
                    <div className="space-y-1 pl-3 border-l border-border/20">
                      {threadEvents.slice(0, 5).map((event) => (
                        <button
                          key={event.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setState((s) => ({ ...s, selectedEvent: event.id }));
                          }}
                          className="w-full flex items-center gap-2.5 py-1.5 text-left hover:text-foreground/80 transition-colors duration-200"
                        >
                          <div className="w-1 h-1 rounded-full bg-muted-foreground/20 flex-shrink-0" />
                          <p className="text-[12px] text-foreground/60 truncate">{event.title}</p>
                          <span className="text-[10px] text-muted-foreground/30 flex-shrink-0 ml-auto">
                            {new Date(event.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                          </span>
                        </button>
                      ))}
                      {threadEvents.length > 5 && (
                        <p className="text-[10px] text-muted-foreground/25 pl-3.5">
                          +{threadEvents.length - 5} more events
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      <p className="text-[10px] text-muted-foreground/25 text-center mt-3 leading-relaxed">
        Threads connect related experiences — they're observations, not diagnoses.
      </p>
    </motion.section>
  );
};

export default BodyThreads;
