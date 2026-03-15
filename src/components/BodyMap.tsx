import { useState } from "react";
import { useApp, BodyRegion, EventType } from "@/context/AppContext";

interface BodyMapProps {
  onRegionClick: (region: BodyRegion) => void;
}

const regionPositions: Record<BodyRegion, { x: number; y: number; w: number; h: number }> = {
  "head": { x: 85, y: 8, w: 30, h: 30 },
  "neck": { x: 90, y: 40, w: 20, h: 12 },
  "left-shoulder": { x: 60, y: 52, w: 25, h: 16 },
  "right-shoulder": { x: 115, y: 52, w: 25, h: 16 },
  "chest": { x: 80, y: 60, w: 40, h: 30 },
  "upper-back": { x: 80, y: 55, w: 40, h: 25 },
  "left-arm": { x: 45, y: 70, w: 18, h: 50 },
  "right-arm": { x: 137, y: 70, w: 18, h: 50 },
  "abdomen": { x: 80, y: 92, w: 40, h: 28 },
  "lower-back": { x: 80, y: 100, w: 40, h: 20 },
  "left-hip": { x: 70, y: 122, w: 22, h: 18 },
  "right-hip": { x: 108, y: 122, w: 22, h: 18 },
  "left-leg": { x: 68, y: 142, w: 22, h: 55 },
  "right-leg": { x: 110, y: 142, w: 22, h: 55 },
  "left-knee": { x: 68, y: 172, w: 22, h: 20 },
  "right-knee": { x: 110, y: 172, w: 22, h: 20 },
  "left-foot": { x: 64, y: 200, w: 22, h: 16 },
  "right-foot": { x: 114, y: 200, w: 22, h: 16 },
};

const typeColors: Record<EventType, string> = {
  "injury": "var(--body-pain)",
  "symptom": "var(--body-tension)",
  "stress": "var(--body-tension)",
  "treatment": "var(--body-healing)",
  "life-event": "var(--body-neutral)",
};

const regionLabels: Record<string, string> = {
  "head": "Head", "neck": "Neck", "left-shoulder": "L. Shoulder", "right-shoulder": "R. Shoulder",
  "chest": "Chest", "upper-back": "Upper Back", "left-arm": "L. Arm", "right-arm": "R. Arm",
  "abdomen": "Abdomen", "lower-back": "Lower Back", "left-hip": "L. Hip", "right-hip": "R. Hip",
  "left-leg": "L. Leg", "right-leg": "R. Leg", "left-knee": "L. Knee", "right-knee": "R. Knee",
  "left-foot": "L. Foot", "right-foot": "R. Foot",
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

  return (
    <div className="relative flex flex-col items-center">
      {/* Ambient glow behind the body */}
      <div className="absolute inset-0 body-ambient rounded-3xl" />

      {/* Hover label */}
      <div className="h-6 mb-2 flex items-center justify-center">
        {hoveredRegion && (
          <span className="text-xs text-muted-foreground font-medium animate-fade-up">
            {regionLabels[hoveredRegion]}
            {getRegionEventCount(hoveredRegion) > 0 && (
              <span className="ml-1.5 text-foreground/60">
                · {getRegionEventCount(hoveredRegion)} {getRegionEventCount(hoveredRegion) === 1 ? "event" : "events"}
              </span>
            )}
          </span>
        )}
      </div>

      <svg width="240" height="280" viewBox="-10 -5 220 230" className="body-glow relative z-10">
        <defs>
          <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--body-fill))" />
            <stop offset="100%" stopColor="hsl(var(--body-stroke) / 0.6)" />
          </linearGradient>
          {/* Soft glow filter for active regions */}
          <filter id="regionGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Body silhouette — softer, more organic */}
        <ellipse cx="100" cy="24" rx="16" ry="20" fill="url(#bodyGrad)" stroke="hsl(var(--body-stroke))" strokeWidth="0.8" />
        <rect x="93" y="44" width="14" height="9" rx="5" fill="url(#bodyGrad)" />
        <path d="M72 54 Q100 48 128 54 L136 68 Q138 88 134 118 L128 118 Q120 76 100 69 Q80 76 72 118 L66 118 Q62 88 64 68 Z"
          fill="url(#bodyGrad)" stroke="hsl(var(--body-stroke))" strokeWidth="0.6" strokeLinejoin="round" />
        <rect x="82" y="118" width="36" height="5" rx="2.5" fill="url(#bodyGrad)" />
        {/* Arms */}
        <path d="M64 68 Q52 84 50 118 L57 118 Q60 88 66 76" fill="url(#bodyGrad)" stroke="hsl(var(--body-stroke))" strokeWidth="0.5" strokeLinejoin="round" />
        <path d="M136 68 Q148 84 150 118 L143 118 Q140 88 134 76" fill="url(#bodyGrad)" stroke="hsl(var(--body-stroke))" strokeWidth="0.5" strokeLinejoin="round" />
        {/* Legs */}
        <path d="M82 123 L76 198 L87 198 L92 127" fill="url(#bodyGrad)" stroke="hsl(var(--body-stroke))" strokeWidth="0.5" strokeLinejoin="round" />
        <path d="M108 127 L113 198 L124 198 L118 123" fill="url(#bodyGrad)" stroke="hsl(var(--body-stroke))" strokeWidth="0.5" strokeLinejoin="round" />
        {/* Feet */}
        <ellipse cx="81" cy="204" rx="9" ry="5" fill="url(#bodyGrad)" stroke="hsl(var(--body-stroke))" strokeWidth="0.4" />
        <ellipse cx="119" cy="204" rx="9" ry="5" fill="url(#bodyGrad)" stroke="hsl(var(--body-stroke))" strokeWidth="0.4" />

        {/* Active region overlays with soft glow */}
        {(Object.entries(regionPositions) as [BodyRegion, { x: number; y: number; w: number; h: number }][]).map(
          ([region, pos]) => {
            const color = getRegionColor(region);
            const isHovered = hoveredRegion === region;
            return (
              <rect
                key={region}
                x={pos.x}
                y={pos.y}
                width={pos.w}
                height={pos.h}
                rx={8}
                fill={color ? `hsl(${color})` : "transparent"}
                opacity={color ? (isHovered ? 0.65 : 0.4) : (isHovered ? 0.08 : 0)}
                filter={color ? "url(#regionGlow)" : undefined}
                className="cursor-pointer transition-all duration-500"
                style={{ transition: "opacity 0.4s ease, fill 0.4s ease" }}
                onClick={() => onRegionClick(region)}
                onMouseEnter={() => setHoveredRegion(region)}
                onMouseLeave={() => setHoveredRegion(null)}
              />
            );
          }
        )}
      </svg>

      {/* Tap hint */}
      <p className="text-[10px] text-muted-foreground/50 mt-2 tracking-wide">
        Tap a body area to add an event
      </p>
    </div>
  );
};

export default BodyMap;
