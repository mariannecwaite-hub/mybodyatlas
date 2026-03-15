import { useApp, EventType } from "@/context/AppContext";

const layers: { type: EventType | "all"; label: string; dot: string }[] = [
  { type: "all", label: "All", dot: "bg-muted-foreground/25" },
  { type: "injury", label: "Injuries", dot: "bg-body-pain" },
  { type: "symptom", label: "Sensations", dot: "bg-body-tension" },
  { type: "stress", label: "Stress & nervous system", dot: "bg-body-tension" },
  { type: "treatment", label: "What helped", dot: "bg-body-healing" },
  { type: "life-event", label: "Life transitions", dot: "bg-body-neutral" },
];

const LayerToggles = () => {
  const { state, setActiveLayer } = useApp();

  return (
    <div className="flex flex-wrap justify-center gap-2" role="tablist" aria-label="Filter by type">
      {layers.map((layer) => {
        const isActive = state.activeLayer === layer.type;
        return (
          <button
            key={layer.type}
            role="tab"
            aria-selected={isActive}
            onClick={() => setActiveLayer(layer.type)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-medium tracking-wide transition-all duration-400 ${
              isActive
                ? "bg-card text-foreground/75 border border-border/30 shadow-xs"
                : "text-muted-foreground/35 hover:text-muted-foreground/55"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full transition-opacity duration-400 ${layer.dot} ${isActive ? "opacity-80" : "opacity-35"}`} aria-hidden="true" />
            {layer.label}
          </button>
        );
      })}
    </div>
  );
};

export default LayerToggles;
