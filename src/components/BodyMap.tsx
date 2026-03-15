import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp, BodyRegion, EventType } from "@/context/AppContext";

interface BodyMapProps {
  onRegionClick: (region: BodyRegion) => void;
}

// Each region is an SVG path that conforms to the body silhouette
// Paths are drawn to be organic, fitting inside the body outline
const regionPaths: Record<BodyRegion, { d: string; label: string; cx: number; cy: number }> = {
  "head":             { d: "M150,48 C150,24 172,4 200,4 C228,4 250,24 250,48 C250,72 228,84 200,84 C172,84 150,72 150,48 Z", label: "Head", cx: 200, cy: 44 },
  "neck":             { d: "M185,84 L215,84 L218,108 L182,108 Z", label: "Neck", cx: 200, cy: 96 },
  "left-shoulder":    { d: "M182,108 L148,116 C136,120 128,132 126,142 L140,142 C144,132 150,122 160,116 L182,112 Z", label: "L. Shoulder", cx: 152, cy: 126 },
  "right-shoulder":   { d: "M218,108 L252,116 C264,120 272,132 274,142 L260,142 C256,132 250,122 240,116 L218,112 Z", label: "R. Shoulder", cx: 248, cy: 126 },
  "chest":            { d: "M160,116 L240,116 L244,164 L156,164 Z", label: "Chest", cx: 200, cy: 140 },
  "upper-back":       { d: "M164,116 L236,116 L240,152 L160,152 Z", label: "Upper Back", cx: 200, cy: 134 },
  "left-arm":         { d: "M126,142 C120,168 114,198 108,228 C104,244 100,260 104,268 L120,264 C118,256 120,244 124,228 C128,204 134,174 140,142 Z", label: "L. Arm", cx: 122, cy: 200 },
  "right-arm":        { d: "M274,142 C280,168 286,198 292,228 C296,244 300,260 296,268 L280,264 C282,256 280,244 276,228 C272,204 266,174 260,142 Z", label: "R. Arm", cx: 278, cy: 200 },
  "abdomen":          { d: "M156,164 L244,164 L240,218 L160,218 Z", label: "Abdomen", cx: 200, cy: 191 },
  "lower-back":       { d: "M162,192 L238,192 L236,228 L164,228 Z", label: "Lower Back", cx: 200, cy: 210 },
  "left-hip":         { d: "M160,218 L200,218 L198,256 L168,260 C162,248 158,236 160,218 Z", label: "L. Hip", cx: 178, cy: 238 },
  "right-hip":        { d: "M200,218 L240,218 C242,236 238,248 232,260 L202,256 Z", label: "R. Hip", cx: 222, cy: 238 },
  "left-leg":         { d: "M168,260 L198,256 L194,340 L172,340 Z", label: "L. Thigh", cx: 182, cy: 300 },
  "right-leg":        { d: "M202,256 L232,260 L228,340 L206,340 Z", label: "R. Thigh", cx: 218, cy: 300 },
  "left-knee":        { d: "M172,340 L194,340 L192,376 L174,376 Z", label: "L. Knee", cx: 183, cy: 358 },
  "right-knee":       { d: "M206,340 L228,340 L226,376 L208,376 Z", label: "R. Knee", cx: 217, cy: 358 },
  "left-foot":        { d: "M174,412 L192,412 C194,424 196,436 194,444 L172,444 C170,436 170,424 174,412 Z", label: "L. Foot", cx: 183, cy: 428 },
  "right-foot":       { d: "M208,412 L226,412 C230,424 230,436 228,444 L206,444 C204,436 206,424 208,412 Z", label: "R. Foot", cx: 217, cy: 428 },
};

// Shin segments (connect knees to feet, but aren't separate regions — part of legs visually)
const shinPaths = {
  left: "M174,376 L192,376 L192,412 L174,412 Z",
  right: "M208,376 L226,376 L226,412 L208,412 Z",
};

const typeColors: Record<EventType, string> = {
  "injury": "4 30% 72%",
  "symptom": "32 35% 72%",
  "stress": "32 35% 72%",
  "treatment": "158 25% 72%",
  "life-event": "220 10% 78%",
};

const BodyMap = ({ onRegionClick }: BodyMapProps) => {
  const { state } = useApp();
  const [hoveredRegion, setHoveredRegion] = useState<BodyRegion | null>(null);

  const getRegionColor = (region: BodyRegion): string | null => {
    const events = state.events.filter(
      (e) => e.regions.includes(region) && (state.activeLayer === "all" || e.type === state.activeLayer)
    );
    if (events.length === 0) return null;
    const priority: EventType[] = ["injury", "symptom", "stress", "treatment", "life-event"];
    for (const t of priority) {
      if (events.some((e) => e.type === t)) return typeColors[t];
    }
    return null;
  };

  const getRegionEventCount = (region: BodyRegion): number => {
    return state.events.filter(
      (e) => e.regions.includes(region) && (state.activeLayer === "all" || e.type === state.activeLayer)
    ).length;
  };

  const hoveredData = hoveredRegion ? regionPaths[hoveredRegion] : null;
  const hoveredCount = hoveredRegion ? getRegionEventCount(hoveredRegion) : 0;

  return (
    <div className="relative flex flex-col items-center w-full">
      {/* Floating label */}
      <div className="h-8 mb-1 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {hoveredData && (
            <motion.div
              key={hoveredRegion}
              className="flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-border/50"
              style={{ boxShadow: "var(--shadow-sm)" }}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              <span className="text-[12px] font-medium text-foreground/80">{hoveredData.label}</span>
              {hoveredCount > 0 && (
                <span className="text-[11px] text-muted-foreground/60">
                  {hoveredCount} {hoveredCount === 1 ? "event" : "events"}
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Body SVG */}
      <div className="relative">
        {/* Ambient radial glow */}
        <div className="absolute inset-0 -inset-x-8 -inset-y-4 body-ambient rounded-[40px] pointer-events-none" />

        <svg
          width="100%"
          viewBox="80 -10 240 470"
          className="relative z-10 max-w-[280px] mx-auto"
          style={{ filter: "drop-shadow(0 4px 24px hsl(158 20% 85% / 0.3))" }}
        >
          <defs>
            {/* Body fill — very subtle warm gradient */}
            <linearGradient id="bodyFill" x1="0.5" y1="0" x2="0.5" y2="1">
              <stop offset="0%" stopColor="hsl(38 15% 91%)" />
              <stop offset="50%" stopColor="hsl(38 12% 88%)" />
              <stop offset="100%" stopColor="hsl(38 10% 85%)" />
            </linearGradient>
            {/* Hover highlight */}
            <linearGradient id="hoverFill" x1="0.5" y1="0" x2="0.5" y2="1">
              <stop offset="0%" stopColor="hsl(38 14% 86%)" />
              <stop offset="100%" stopColor="hsl(38 12% 83%)" />
            </linearGradient>
            {/* Soft region glow */}
            <filter id="activeGlow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Separator line style */}
            <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(38 10% 82% / 0)" />
              <stop offset="30%" stopColor="hsl(38 10% 82% / 0.5)" />
              <stop offset="70%" stopColor="hsl(38 10% 82% / 0.5)" />
              <stop offset="100%" stopColor="hsl(38 10% 82% / 0)" />
            </linearGradient>
          </defs>

          {/* === BODY SILHOUETTE === */}
          {/* Head */}
          <ellipse cx="200" cy="44" rx="50" ry="42" fill="url(#bodyFill)" stroke="hsl(var(--body-stroke))" strokeWidth="0.8" />
          {/* Neck */}
          <rect x="185" y="84" width="30" height="26" rx="8" fill="url(#bodyFill)" stroke="hsl(var(--body-stroke))" strokeWidth="0.6" />
          {/* Torso */}
          <path d="M148,112 C160,108 182,106 200,106 C218,106 240,108 252,112 C268,118 276,136 274,142 
                   C280,168 286,198 292,228 C296,244 300,260 296,268 L280,264
                   C282,256 280,244 276,228 C272,204 266,174 260,142
                   L244,142 L244,218
                   C244,236 240,250 234,262 L232,260 L228,340 L226,376 L226,412 C230,424 230,436 228,444 
                   L206,444 C204,436 206,424 208,412 L208,376 L206,340 L202,256 L200,248
                   L198,256 L194,340 L192,376 L192,412 C194,424 196,436 194,444 
                   L172,444 C170,436 170,424 174,412 L174,376 L172,340 L168,260 L166,262
                   C160,250 156,236 156,218 L156,142 L140,142
                   C134,174 128,204 124,228 C120,244 118,256 120,264 L104,268 
                   C100,260 104,244 108,228 C114,198 120,168 126,142
                   C128,136 132,118 148,112 Z"
            fill="url(#bodyFill)"
            stroke="hsl(var(--body-stroke))"
            strokeWidth="0.7"
            strokeLinejoin="round"
          />

          {/* Subtle body line details — anatomical hints */}
          {/* Collarbone */}
          <path d="M160,118 Q180,112 200,114 Q220,112 240,118" fill="none" stroke="hsl(var(--body-stroke))" strokeWidth="0.4" opacity="0.5" />
          {/* Center line */}
          <line x1="200" y1="118" x2="200" y2="220" stroke="hsl(var(--body-stroke))" strokeWidth="0.3" opacity="0.3" />
          {/* Waist line */}
          <path d="M162,210 Q200,205 238,210" fill="none" stroke="url(#lineGrad)" strokeWidth="0.5" />
          {/* Hip line */}
          <path d="M164,248 Q200,244 236,248" fill="none" stroke="url(#lineGrad)" strokeWidth="0.4" />

          {/* === INTERACTIVE REGION OVERLAYS === */}
          {(Object.entries(regionPaths) as [BodyRegion, typeof regionPaths[BodyRegion]][]).map(
            ([region, data]) => {
              const color = getRegionColor(region);
              const isHovered = hoveredRegion === region;
              const hasEvents = !!color;

              return (
                <g key={region}>
                  {/* Active event color layer */}
                  {hasEvents && (
                    <path
                      d={data.d}
                      fill={`hsl(${color} / 0.35)`}
                      filter="url(#activeGlow)"
                      className="pointer-events-none"
                    />
                  )}
                  {/* Interactive hit area */}
                  <path
                    d={data.d}
                    fill={isHovered ? (hasEvents ? `hsl(${color} / 0.5)` : "hsl(var(--body-stroke) / 0.15)") : "transparent"}
                    stroke={isHovered ? "hsl(var(--foreground) / 0.12)" : "transparent"}
                    strokeWidth="0.6"
                    className="cursor-pointer"
                    style={{ transition: "fill 0.35s ease, stroke 0.35s ease" }}
                    onClick={() => onRegionClick(region)}
                    onMouseEnter={() => setHoveredRegion(region)}
                    onMouseLeave={() => setHoveredRegion(null)}
                  />
                  {/* Small dot marker for regions with events */}
                  {hasEvents && !isHovered && (
                    <circle
                      cx={data.cx}
                      cy={data.cy}
                      r="3"
                      fill={`hsl(${color})`}
                      opacity="0.7"
                      className="pointer-events-none animate-breathe"
                    />
                  )}
                </g>
              );
            }
          )}
        </svg>
      </div>

      {/* Explore hint */}
      <p className="text-[10px] text-muted-foreground/40 mt-3 tracking-widest uppercase">
        Explore your body map
      </p>
    </div>
  );
};

export default BodyMap;
