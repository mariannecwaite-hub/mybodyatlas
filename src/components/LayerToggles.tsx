import { useApp, EventType } from "@/context/AppContext";

const layers: { type: EventType | "all"; label: string; dot: string }[] = [
  { type: "all", label: "All", dot: "bg-muted-foreground/30" },
  { type: "injury", label: "Injuries", dot: "bg-body-pain" },
  { type: "symptom", label: "Symptoms", dot: "bg-body-tension" },
  { type: "stress", label: "Stress", dot: "bg-body-tension" },
  { type: "treatment", label: "Treatments", dot: "bg-body-healing" },
  { type: "life-event", label: "Life", dot: "bg-body-neutral" },
];

const LayerToggles = () => {
  const { state, setActiveLayer } = useApp();

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {layers.map((layer) => {
        const isActive = state.activeLayer === layer.type;
        return (
          <button
            key={layer.type}
            onClick={() => setActiveLayer(layer.type)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] font-medium transition-all duration-300 ${
              isActive
                ? "bg-card text-foreground border border-border/40 shadow-xs"
                : "text-muted-foreground/50 hover:text-muted-foreground hover:bg-secondary/30"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full transition-opacity duration-300 ${layer.dot} ${isActive ? "opacity-100" : "opacity-50"}`} />
            {layer.label}
          </button>
        );
      })}
    </div>
  );
};

export default LayerToggles;
