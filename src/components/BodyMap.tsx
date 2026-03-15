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

const BodyMap = ({ onRegionClick }: BodyMapProps) => {
  const { state } = useApp();

  const getRegionColor = (region: BodyRegion): string | null => {
    const events = state.events.filter(
      (e) => e.regions.includes(region) && (state.activeLayer === "all" || e.type === state.activeLayer)
    );
    if (events.length === 0) return null;
    // Priority: injury > symptom > stress > treatment
    const priority: EventType[] = ["injury", "symptom", "stress", "treatment", "life-event"];
    for (const t of priority) {
      if (events.some((e) => e.type === t)) return typeColors[t];
    }
    return null;
  };

  return (
    <div className="relative flex items-center justify-center">
      <svg width="200" height="220" viewBox="0 0 200 220" className="body-glow">
        {/* Body silhouette */}
        <ellipse cx="100" cy="24" rx="16" ry="20" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="1" />
        <rect x="92" y="44" width="16" height="10" rx="4" fill="hsl(var(--muted))" />
        <path d="M70 54 Q100 48 130 54 L138 70 Q140 90 135 120 L130 120 Q120 75 100 68 Q80 75 70 120 L65 120 Q60 90 62 70 Z" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="0.5" />
        <rect x="80" y="120" width="40" height="6" rx="3" fill="hsl(var(--muted))" />
        {/* Arms */}
        <path d="M62 70 Q50 85 48 120 L56 120 Q60 90 66 78" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="0.5" />
        <path d="M138 70 Q150 85 152 120 L144 120 Q140 90 134 78" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="0.5" />
        {/* Legs */}
        <path d="M80 126 L74 200 L86 200 L92 130" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="0.5" />
        <path d="M108 130 L114 200 L126 200 L120 126" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="0.5" />
        {/* Feet */}
        <ellipse cx="80" cy="206" rx="10" ry="6" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="0.5" />
        <ellipse cx="120" cy="206" rx="10" ry="6" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="0.5" />

        {/* Active region overlays */}
        {(Object.entries(regionPositions) as [BodyRegion, { x: number; y: number; w: number; h: number }][]).map(
          ([region, pos]) => {
            const color = getRegionColor(region);
            return (
              <rect
                key={region}
                x={pos.x}
                y={pos.y}
                width={pos.w}
                height={pos.h}
                rx={6}
                fill={color ? `hsl(${color})` : "transparent"}
                opacity={color ? 0.5 : 0}
                className="cursor-pointer transition-all duration-300 hover:opacity-70"
                onClick={() => onRegionClick(region)}
              />
            );
          }
        )}
      </svg>
    </div>
  );
};

export default BodyMap;
