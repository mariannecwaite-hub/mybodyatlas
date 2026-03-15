import { useApp, EventType } from "@/context/AppContext";

const layers: { type: EventType | "all"; label: string; dot: string }[] = [
  { type: "all", label: "All", dot: "bg-muted-foreground/40" },
  { type: "injury", label: "Injuries", dot: "bg-body-pain" },
  { type: "symptom", label: "Symptoms", dot: "bg-body-tension" },
  { type: "stress", label: "Stress", dot: "bg-body-tension" },
  { type: "treatment", label: "Treatments", dot: "bg-body-healing" },
  { type: "life-event", label: "Life", dot: "bg-body-neutral" },
];

const LayerToggles = () => {
  const { state, setActiveLayer } = useApp();

  return (
    <div className="flex flex-wrap justify-center gap-1.5">
      {layers.map((layer) => (
        <button
          key={layer.type}
          onClick={() => setActiveLayer(layer.type)}
          className={`chip ${
            state.activeLayer === layer.type ? "chip-active" : "chip-inactive"
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${layer.dot}`} />
          {layer.label}
        </button>
      ))}
    </div>
  );
};

export default LayerToggles;
