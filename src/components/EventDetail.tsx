import { motion, AnimatePresence } from "framer-motion";
import { useApp, REGION_LABELS } from "@/context/AppContext";
import { useBodyThreads } from "@/hooks/useBodyThreads";
import { X, Archive, Trash2, Link2 } from "lucide-react";

const typeLabels = {
  injury: "Injury", symptom: "Something you noticed", stress: "Stress period",
  treatment: "Treatment", "life-event": "Life event",
};

const EventDetail = () => {
  const { state, setState, deleteEvent, archiveEvent, visibleEvents } = useApp();
  const event = state.events.find((e) => e.id === state.selectedEvent);
  const threads = useBodyThreads(visibleEvents);
  const close = () => setState((s) => ({ ...s, selectedEvent: null }));

  // Find threads this event belongs to
  const eventThreads = event ? threads.filter((t) => t.eventIds.includes(event.id)) : [];

  return (
    <AnimatePresence>
      {event && (
        <motion.div className="modal-backdrop"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="modal-overlay" onClick={close} />
          <motion.div
            className="modal-content max-h-[80vh]"
            initial={{ y: 80, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", damping: 32, stiffness: 240, mass: 0.8 }}
            role="dialog"
            aria-label={`Event detail: ${event.title}`}
            aria-modal="true"
          >
            <motion.div
              className="modal-header"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="section-label">{typeLabels[event.type]}</span>
              <div className="flex gap-1">
                <button
                  onClick={() => archiveEvent(event.id)}
                  className="p-2 rounded-full hover:bg-secondary/60 text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors duration-200"
                  aria-label="Set aside — hide this event from your map without deleting it"
                  title="Set aside — you can bring it back anytime"
                >
                  <Archive className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm("This will permanently remove this event. Would you like to set it aside instead?")) {
                      deleteEvent(event.id);
                    }
                  }}
                  className="p-2 rounded-full hover:bg-destructive/8 text-muted-foreground/40 hover:text-destructive/60 transition-colors duration-200"
                  aria-label="Permanently remove this event"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button onClick={close} className="modal-close" aria-label="Close this detail view">
                  <X className="w-5 h-5 text-muted-foreground/50" />
                </button>
              </div>
            </motion.div>

            <motion.h2
              className="text-2xl mb-1.5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >{event.title}</motion.h2>
            <motion.p
              className="text-[13px] text-muted-foreground/60 mb-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              {new Date(event.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              {event.ongoing && <span className="ml-2 text-sage-foreground/60 font-medium">· ongoing</span>}
            </motion.p>

            <motion.div
              className="space-y-5"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              {event.description && (
                <p className="text-[13px] text-foreground/70 leading-[1.8]">{event.description}</p>
              )}

              {event.regions.length > 0 && (
                <div>
                  <p className="section-label mb-2">Areas of your body</p>
                  <div className="flex flex-wrap gap-1.5">
                    {event.regions.map((r) => (
                      <span key={r} className="chip chip-inactive text-[11px]">
                        {REGION_LABELS[r]}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="section-label mb-1">How noticeable</p>
                <span className="text-[13px] capitalize text-foreground/70">{event.severity}</span>
              </div>

              {event.treatment && (
                <div>
                  <p className="section-label mb-1.5">What you tried</p>
                  <p className="text-[13px] text-foreground/70 leading-[1.8] whitespace-pre-line">{event.treatment}</p>
                </div>
              )}

              {event.notes && (
                <div className="p-5 rounded-2xl bg-warm/15 border border-warm/20">
                  <p className="section-label mb-1.5 text-warm-foreground/60">Your notes</p>
                  <p className="text-[13px] text-foreground/70 leading-[1.8]">{event.notes}</p>
                </div>
              )}

              {/* Body Threads this event belongs to */}
              {eventThreads.length > 0 && (
                <div className="p-4 rounded-2xl bg-sage/8 border border-sage/12">
                  <div className="flex items-center gap-1.5 mb-3">
                    <Link2 className="w-3.5 h-3.5 text-sage-foreground/40" />
                    <p className="section-label text-sage-foreground/55">Part of {eventThreads.length} {eventThreads.length === 1 ? "thread" : "threads"}</p>
                  </div>
                  <div className="space-y-2">
                    {eventThreads.map((thread) => (
                      <div key={thread.id} className="flex items-center gap-3">
                        <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
                          <div className="w-1 h-1 rounded-full bg-sage/50" />
                          <div className="w-px h-2.5 bg-border/25" />
                          <div className="w-1 h-1 rounded-full bg-sage/35" />
                        </div>
                        <div>
                          <p className="text-[12px] font-medium text-foreground/65">{thread.label}</p>
                          <p className="text-[10px] text-muted-foreground/35">
                            {thread.eventCount} events · {thread.yearSpan}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {event.archived && (
                <div className="p-4 rounded-2xl bg-secondary/30 border border-border/20 text-center">
                  <p className="text-[12px] text-muted-foreground/50">
                    This event has been set aside.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EventDetail;
