import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { X, Trash2 } from "lucide-react";

const typeLabels = {
  injury: "Injury", symptom: "Symptom", stress: "Stress period",
  treatment: "Treatment", "life-event": "Life event",
};

const EventDetail = () => {
  const { state, setState, deleteEvent } = useApp();
  const event = state.events.find((e) => e.id === state.selectedEvent);
  const close = () => setState((s) => ({ ...s, selectedEvent: null }));

  return (
    <AnimatePresence>
      {event && (
        <motion.div className="modal-backdrop"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="modal-overlay" onClick={close} />
          <motion.div className="modal-content max-h-[80vh]"
            initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}>

            <div className="modal-header">
              <span className="section-label">{typeLabels[event.type]}</span>
              <div className="flex gap-1">
                <button onClick={() => deleteEvent(event.id)}
                  className="p-2 rounded-full hover:bg-destructive/8 text-muted-foreground/60 hover:text-destructive transition-colors duration-200">
                  <Trash2 className="w-4 h-4" />
                </button>
                <button onClick={close} className="modal-close">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>

            <h2 className="text-2xl mb-1.5">{event.title}</h2>
            <p className="text-[13px] text-muted-foreground/70 mb-5">
              {new Date(event.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              {event.ongoing && <span className="ml-2 text-sage-foreground font-medium">· ongoing</span>}
            </p>

            <div className="space-y-5">
              {event.description && (
                <p className="text-[13px] text-foreground/75 leading-relaxed">{event.description}</p>
              )}

              {event.regions.length > 0 && (
                <div>
                  <p className="section-label mb-2">Body areas</p>
                  <div className="flex flex-wrap gap-1.5">
                    {event.regions.map((r) => (
                      <span key={r} className="chip chip-inactive capitalize text-[11px]">
                        {r.replace("-", " ")}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="section-label mb-1">Intensity</p>
                <span className="text-[13px] capitalize text-foreground/80">{event.severity}</span>
              </div>

              {event.treatment && (
                <div>
                  <p className="section-label mb-1.5">Treatment</p>
                  <p className="text-[13px] text-foreground/75 leading-relaxed">{event.treatment}</p>
                </div>
              )}

              {event.notes && (
                <div className="p-4 rounded-2xl bg-warm/30 border border-warm/40">
                  <p className="section-label mb-1.5 text-warm-foreground/70">Your notes</p>
                  <p className="text-[13px] text-foreground/75 leading-relaxed">{event.notes}</p>
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
