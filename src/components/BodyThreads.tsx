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
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-secondary/20 transition-colors duration-200"
              >
                {/* Thread indicator */}
                <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-sage/60" />
                  <div className="w-px h-4 bg-border/30" />
                  <div className="w-1.5 h-1.5 rounded-full bg-sage/40" />
                </div>

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
