import { useApp, EventType } from "@/context/AppContext";

const layers: { type: EventType | "all"; label: string; color: string }[] = [
  { type: "all", label: "All layers", color: "bg-muted" },
  { type: "injury", label: "Injuries", color: "bg-body-pain" },
  { type: "symptom", label: "Symptoms", color: "bg-body-tension" },
  { type: "stress", label: "Stress", color: "bg-body-tension" },
  { type: "treatment", label: "Treatments", color: "bg-body-healing" },
  { type: "life-event", label: "Life events", color: "bg-body-neutral" },
];

const LayerToggles = () => {
  const { state, setActiveLayer } = useApp();

  return (
    <div className="flex flex-wrap gap-2">
      {layers.map((layer) => (
        <button
          key={layer.type}
          onClick={() => setActiveLayer(layer.type)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            state.activeLayer === layer.type
              ? "bg-primary text-primary-foreground shadow-soft"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${layer.color}`} />
          {layer.label}
        </button>
      ))}
    </div>
  );
};

export default LayerToggles;
