import { motion, AnimatePresence } from "framer-motion";
import { useApp, REGION_LABELS } from "@/context/AppContext";
import { X, Archive, Trash2 } from "lucide-react";

const typeLabels = {
  injury: "Injury", symptom: "Something you noticed", stress: "Stress period",
  treatment: "Treatment", "life-event": "Life event",
};

const EventDetail = () => {
  const { state, setState, deleteEvent, archiveEvent } = useApp();
  const event = state.events.find((e) => e.id === state.selectedEvent);
  const close = () => setState((s) => ({ ...s, selectedEvent: null }));

  return (
    <AnimatePresence>
      {event && (
        <motion.div className="modal-backdrop"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="modal-overlay" onClick={close} />
          <motion.div
            className="modal-content max-h-[80vh]"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            role="dialog"
            aria-label={`Event detail: ${event.title}`}
            aria-modal="true"
          >
            <div className="modal-header">
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
            </div>

            <h2 className="text-2xl mb-1.5">{event.title}</h2>
            <p className="text-[13px] text-muted-foreground/60 mb-5">
              {new Date(event.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              {event.ongoing && <span className="ml-2 text-sage-foreground/60 font-medium">· ongoing</span>}
            </p>

            <div className="space-y-5">
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
