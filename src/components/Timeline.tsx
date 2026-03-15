import { useApp, EventType } from "@/context/AppContext";

const typeIcons: Record<EventType, string> = {
  injury: "🩹",
  symptom: "💭",
  stress: "🌊",
  treatment: "🌿",
  "life-event": "⭐",
};

const Timeline = () => {
  const { state, setState } = useApp();

  const filteredEvents = state.events
    .filter((e) => state.activeLayer === "all" || e.type === state.activeLayer)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const years = [...new Set(filteredEvents.map((e) => new Date(e.date).getFullYear()))].sort((a, b) => b - a);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-serif text-foreground">Timeline</h3>
        <div className="flex gap-1">
          {years.map((year) => (
            <button
              key={year}
              onClick={() => setState((s) => ({ ...s, timelineYear: year }))}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                state.timelineYear === year
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        {filteredEvents
          .filter((e) => new Date(e.date).getFullYear() === state.timelineYear)
          .map((event) => (
            <button
              key={event.id}
              onClick={() => setState((s) => ({ ...s, selectedEvent: event.id }))}
              className="w-full flex items-center gap-3 p-3 rounded-lg text-left hover:bg-secondary/60 transition-all group"
            >
              <span className="text-base">{typeIcons[event.type]}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{event.title}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  {event.ongoing && <span className="ml-2 text-sage-foreground">ongoing</span>}
                </p>
              </div>
              <span className="opacity-0 group-hover:opacity-100 text-muted-foreground transition-opacity text-xs">→</span>
            </button>
          ))}
      </div>
    </div>
  );
};

export default Timeline;
