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
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={close} />
          <motion.div
            className="relative bg-card w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl p-6 shadow-elevated z-10"
            initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="flex items-center justify-between mb-5">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {typeLabels[event.type]}
              </span>
              <div className="flex gap-1">
                <button onClick={() => { deleteEvent(event.id); }} className="p-1.5 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
                <button onClick={close} className="p-1.5 rounded-full hover:bg-secondary transition-colors">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>

            <h2 className="text-2xl mb-2">{event.title}</h2>
            <p className="text-sm text-muted-foreground mb-4">
              {new Date(event.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              {event.ongoing && <span className="ml-2 text-sage-foreground font-medium">· ongoing</span>}
            </p>

            {event.description && (
              <p className="text-sm text-foreground/80 leading-relaxed mb-4">{event.description}</p>
            )}

            {event.regions.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Body areas</p>
                <div className="flex flex-wrap gap-1.5">
                  {event.regions.map((r) => (
                    <span key={r} className="px-2.5 py-1 rounded-full bg-secondary text-xs text-secondary-foreground capitalize">
                      {r.replace("-", " ")}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Severity</p>
              <span className="text-sm capitalize text-foreground">{event.severity}</span>
            </div>

            {event.treatment && (
              <div className="mb-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Treatment</p>
                <p className="text-sm text-foreground/80 leading-relaxed">{event.treatment}</p>
              </div>
            )}

            {event.notes && (
              <div className="mb-4 p-4 rounded-xl bg-warm/50">
                <p className="text-xs font-medium text-warm-foreground uppercase tracking-wide mb-1">Your notes</p>
                <p className="text-sm text-foreground/80 leading-relaxed">{event.notes}</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EventDetail;
