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
      <div className="flex overflow-x-auto gap-2 pb-1 -mx-2 px-2" role="tablist" aria-label="Atlas layers — filter by type" style={{ scrollbarWidth: "none" }}>
        {layers.map((layer) => {
          const isActive = state.activeLayer === layer.type;
          return (
            <motion.button
              key={layer.type}
              role="tab"
              aria-selected={isActive}
              title={layer.description}
              onClick={() => setActiveLayer(layer.type)}
              className="relative inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-medium tracking-wide"
              whileTap={{ scale: 0.96 }}
            >
              {isActive && (
                <motion.div
                  className="absolute inset-0 bg-card rounded-full border border-border/30"
                  layoutId="activeLayerPill"
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  style={{ boxShadow: "var(--shadow-xs)" }}
                />
              )}
              <motion.span
                className={`relative z-10 w-2 h-2 rounded-full ${layer.dot}`}
                animate={{
                  opacity: isActive ? 0.8 : 0.3,
                  scale: isActive ? 1.15 : 1,
                }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                aria-hidden="true"
              />
              <span className={`relative z-10 transition-colors duration-400 ${
                isActive ? "text-foreground/75" : "text-muted-foreground/35 hover:text-muted-foreground/55"
              }`}>
                {layer.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default LayerToggles;
