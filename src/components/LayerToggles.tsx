import { useApp, EventType } from "@/context/AppContext";
import { motion } from "framer-motion";

const layers: { type: EventType | "all"; label: string; dot: string; description: string }[] = [
  { type: "all", label: "All layers", dot: "bg-muted-foreground/25", description: "Everything on your map" },
  { type: "injury", label: "Injuries", dot: "bg-body-pain", description: "Physical injuries and impacts" },
  { type: "symptom", label: "Sensations", dot: "bg-body-tension", description: "What you've noticed in your body" },
  { type: "treatment", label: "What helped", dot: "bg-body-healing", description: "Treatments and care explored" },
  { type: "stress", label: "Stress & life phases", dot: "bg-body-tension", description: "Periods of stress and change" },
  { type: "life-event", label: "Life transitions", dot: "bg-body-neutral", description: "Significant life moments" },
];

const LayerToggles = () => {
  const { state, setActiveLayer } = useApp();

  return (
    <div className="space-y-2">
      <p className="text-[10px] text-muted-foreground/35 text-center tracking-[0.15em] uppercase mb-1">
        Atlas layers
      </p>
      <div className="flex flex-wrap justify-center gap-2" role="tablist" aria-label="Atlas layers — filter by type">
        {layers.map((layer) => {
          const isActive = state.activeLayer === layer.type;
          return (
            <motion.button
              key={layer.type}
              role="tab"
              aria-selected={isActive}
              title={layer.description}
              onClick={() => setActiveLayer(layer.type)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-medium tracking-wide transition-all duration-400 ${
                isActive
                  ? "bg-card text-foreground/75 border border-border/30"
                  : "text-muted-foreground/35 hover:text-muted-foreground/55"
              }`}
              style={isActive ? { boxShadow: "var(--shadow-xs)" } : undefined}
              whileTap={{ scale: 0.97 }}
            >
              <span
                className={`w-2 h-2 rounded-full transition-all duration-400 ${layer.dot} ${
                  isActive ? "opacity-80 scale-110" : "opacity-30"
                }`}
                aria-hidden="true"
              />
              {layer.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default LayerToggles;
