import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp, BodyRegion, EventType, REGION_LABELS, REGION_A11Y } from "@/context/AppContext";

type BodyView = "front" | "back";

interface RegionDef {
  id: BodyRegion;
  d: string;
  cx: number;
  cy: number;
  views: BodyView[];
}

interface BodyMapProps {
  onRegionSelect: (regionId: BodyRegion) => void;
}

const typeHSL: Record<EventType, string> = {
  injury:       "8 24% 74%",
  symptom:      "34 28% 74%",
  stress:       "34 28% 74%",
  treatment:    "158 20% 74%",
  "life-event": "40 6% 80%",
};

const regions: RegionDef[] = [
  { id: "head_jaw", d: "M100,6 C80,6 66,20 66,36 C66,52 78,62 88,64 L112,64 C122,62 134,52 134,36 C134,20 120,6 100,6 Z", cx: 100, cy: 34, views: ["front", "back"] },
  { id: "neck", d: "M90,66 L110,66 Q112,72 110,80 L90,80 Q88,72 90,66 Z", cx: 100, cy: 73, views: ["front", "back"] },
  { id: "shoulder_left", d: "M88,82 Q74,82 62,88 Q50,96 46,108 L54,110 Q56,100 64,92 Q72,86 88,84 Z", cx: 66, cy: 96, views: ["front", "back"] },
  { id: "shoulder_right", d: "M112,82 Q126,82 138,88 Q150,96 154,108 L146,110 Q144,100 136,92 Q128,86 112,84 Z", cx: 134, cy: 96, views: ["front", "back"] },
  { id: "chest", d: "M72,86 L128,86 Q134,94 136,108 L136,158 L64,158 Q62,130 64,108 Q66,94 72,86 Z", cx: 100, cy: 122, views: ["front"] },
  { id: "upper_back", d: "M72,86 L128,86 Q134,94 136,108 L136,158 L64,158 Q62,130 64,108 Q66,94 72,86 Z", cx: 100, cy: 122, views: ["back"] },
  { id: "abdomen", d: "M64,160 L136,160 L134,200 Q132,224 128,240 L72,240 Q68,224 66,200 Z", cx: 100, cy: 200, views: ["front"] },
  { id: "lower_back", d: "M64,160 L136,160 L134,200 Q132,224 128,240 L72,240 Q68,224 66,200 Z", cx: 100, cy: 200, views: ["back"] },
  { id: "wrist_hand_left", d: "M46,110 Q40,130 36,160 Q34,180 34,200 Q32,224 30,244 Q28,260 32,270 L40,268 Q38,258 38,244 Q38,224 40,200 Q42,180 42,160 Q44,130 54,112 Z", cx: 38, cy: 190, views: ["front", "back"] },
  { id: "wrist_hand_right", d: "M154,110 Q160,130 164,160 Q166,180 166,200 Q168,224 170,244 Q172,260 168,270 L160,268 Q162,258 162,244 Q162,224 160,200 Q158,180 158,160 Q156,130 146,112 Z", cx: 162, cy: 190, views: ["front", "back"] },
  { id: "hip_left", d: "M72,242 L98,242 L96,268 L78,270 Q72,260 70,248 Z", cx: 84, cy: 256, views: ["front", "back"] },
  { id: "hip_right", d: "M102,242 L128,242 Q130,260 122,270 L104,268 Z", cx: 116, cy: 256, views: ["front", "back"] },
  { id: "knee_left", d: "M76,330 L94,330 L94,362 L76,362 Q74,346 76,330 Z", cx: 85, cy: 346, views: ["front", "back"] },
  { id: "knee_right", d: "M106,330 L124,330 Q126,346 124,362 L106,362 Z", cx: 115, cy: 346, views: ["front", "back"] },
  { id: "ankle_foot_left", d: "M78,398 L92,398 L92,424 Q92,438 86,446 L70,446 Q72,438 74,424 Z", cx: 83, cy: 422, views: ["front", "back"] },
  { id: "ankle_foot_right", d: "M108,398 L122,398 L126,424 Q128,438 130,446 L114,446 Q108,438 108,424 Z", cx: 117, cy: 422, views: ["front", "back"] },
];

/** Biomechanical connection chains for drawing lines */
const CONNECTION_CHAINS: [BodyRegion, BodyRegion][] = [
  ["ankle_foot_left", "knee_left"],
  ["knee_left", "hip_left"],
  ["hip_left", "lower_back"],
  ["ankle_foot_right", "knee_right"],
  ["knee_right", "hip_right"],
  ["hip_right", "lower_back"],
  ["lower_back", "upper_back"],
  ["upper_back", "neck"],
  ["neck", "head_jaw"],
  ["neck", "shoulder_left"],
  ["neck", "shoulder_right"],
  ["shoulder_left", "wrist_hand_left"],
  ["shoulder_right", "wrist_hand_right"],
  ["upper_back", "shoulder_left"],
  ["upper_back", "shoulder_right"],
  ["lower_back", "abdomen"],
];

const bodySilhouetteFront = `
  M100,6 C80,6 66,20 66,36 C66,52 78,64 90,66
  L90,80 Q74,80 60,88 Q46,98 44,112
  Q38,132 34,164 Q32,192 32,220 Q30,248 30,268
  L40,270 Q40,248 42,220 Q44,192 48,164 Q50,136 56,114
  L64,108 Q62,132 64,160 L64,200 Q66,228 72,244
  C74,254 76,264 78,272
  C80,296 81,314 82,330
  Q78,346 78,362
  C77,380 76,400 74,424 Q72,438 70,448 L86,448 Q92,438 92,424
  C92,400 93,380 94,362
  Q96,346 94,330
  C94,314 95,296 96,272
  C97,264 98,260 100,260
  C102,260 103,264 104,272
  C105,296 106,314 106,330
  Q104,346 106,362
  C107,380 108,400 108,424 Q108,438 114,448 L130,448 Q128,438 126,424
  C126,400 125,380 124,362
  Q126,346 124,330
  C124,314 123,296 122,272
  C124,264 126,254 128,244
  Q134,228 136,200 L136,160 Q138,132 136,108 L144,114
  Q150,136 152,164 Q156,192 158,220 Q160,248 160,270
  L170,268 Q170,248 168,220 Q166,192 166,164 Q162,132 156,112
  Q154,98 140,88 Q126,80 110,80 L110,66
  C122,64 134,52 134,36 C134,20 120,6 100,6 Z
`;

const regionMap = new Map(regions.map((r) => [r.id, r]));

const BodyMap = ({ onRegionSelect }: BodyMapProps) => {
  const { state, visibleEvents } = useApp();
  const [view, setView] = useState<BodyView>("front");
  const [hoveredRegion, setHoveredRegion] = useState<BodyRegion | null>(null);
  const [tappedRegion, setTappedRegion] = useState<BodyRegion | null>(null);

  const activeRegion = state.selectedRegion;
  const highlightedRegions = state.highlightedRegions || [];
  const visibleRegions = regions.filter((r) => r.views.includes(view));

  const handleRegionTap = (regionId: BodyRegion) => {
    setTappedRegion(regionId);
    setTimeout(() => setTappedRegion(null), 500);
    onRegionSelect(regionId);
  };

  // Compute which connections to show
  const activeConnections = useMemo(() => {
    if (highlightedRegions.length < 2) return [];
    const visibleIds = new Set(visibleRegions.map((r) => r.id));
    return CONNECTION_CHAINS.filter(
      ([a, b]) =>
        highlightedRegions.includes(a) &&
        highlightedRegions.includes(b) &&
        visibleIds.has(a) &&
        visibleIds.has(b)
    );
  }, [highlightedRegions, visibleRegions]);

  const getRegionColor = (regionId: BodyRegion): string | null => {
    const events = visibleEvents.filter(
      (e) => e.regions.includes(regionId) && (state.activeLayer === "all" || e.type === state.activeLayer)
    );
    if (events.length === 0) return null;
    const priority: EventType[] = ["injury", "symptom", "stress", "treatment", "life-event"];
    for (const t of priority) {
      if (events.some((e) => e.type === t)) return typeHSL[t];
    }
    return null;
  };

  const getRegionEventCount = (regionId: BodyRegion): number =>
    visibleEvents.filter(
      (e) => e.regions.includes(regionId) && (state.activeLayer === "all" || e.type === state.activeLayer)
    ).length;

  return (
    <div
      className="relative flex flex-col items-center w-full select-none"
      role="img"
      aria-label="Your body map. Tap any area to explore what you've noticed there."
    >
      {/* View toggle */}
      <div className="flex items-center gap-0.5 mb-6 p-1 rounded-full bg-secondary/40 border border-border/20" role="tablist" aria-label="Body view">
        {(["front", "back"] as BodyView[]).map((v) => (
          <button
            key={v}
            role="tab"
            aria-selected={view === v}
            onClick={() => setView(v)}
            className="relative px-5 py-2 rounded-full text-[11px] font-medium tracking-wide capitalize"
          >
            {view === v && (
              <motion.div
                className="absolute inset-0 bg-card rounded-full"
                layoutId="bodyViewToggle"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                style={{ boxShadow: "var(--shadow-xs)" }}
              />
            )}
            <span className={`relative z-10 transition-colors duration-400 ${
              view === v ? "text-foreground/80" : "text-muted-foreground/40 hover:text-muted-foreground/60"
            }`}>{v}</span>
          </button>
        ))}
      </div>

      {/* Floating region label */}
      <div className="h-7 mb-3 flex items-center justify-center" aria-live="polite">
        <AnimatePresence mode="wait">
          {hoveredRegion && (
            <motion.div
              key={hoveredRegion}
              className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-card/90 backdrop-blur-sm border border-border/20"
              style={{ boxShadow: "var(--shadow-sm)" }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              <span className="text-[12px] font-medium text-foreground/70">
                {REGION_LABELS[hoveredRegion]}
              </span>
              {getRegionEventCount(hoveredRegion) > 0 && (
                <span className="text-[10px] text-muted-foreground/40">
                  {getRegionEventCount(hoveredRegion)} {getRegionEventCount(hoveredRegion) === 1 ? "event" : "events"}
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* SVG Body */}
      <div className="relative w-full max-w-[300px] sm:max-w-[320px] mx-auto">
        <div className="absolute -inset-10 body-ambient rounded-full pointer-events-none opacity-60" />

        <svg
          viewBox="20 -2 160 460"
          className="relative z-10 w-full"
          style={{ filter: "drop-shadow(0 8px 32px hsl(158 16% 88% / 0.15))" }}
          role="group"
          aria-label={`Body map — ${view} view`}
        >
          <defs>
            <linearGradient id="bodyFill2" x1="0.5" y1="0" x2="0.5" y2="1">
              <stop offset="0%" stopColor="hsl(40 10% 93%)" />
              <stop offset="100%" stopColor="hsl(40 8% 88%)" />
            </linearGradient>
            <linearGradient id="regionHover" x1="0.5" y1="0" x2="0.5" y2="1">
              <stop offset="0%" stopColor="hsl(40 10% 88%)" />
              <stop offset="100%" stopColor="hsl(40 8% 84%)" />
            </linearGradient>
            <filter id="glow2" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="7" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="selectedGlow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="12" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="connectionGlow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="4" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          <path d={bodySilhouetteFront} fill="url(#bodyFill2)" stroke="hsl(var(--body-stroke))" strokeWidth="0.4" strokeLinejoin="round" />

          {[thighLeft, thighRight, shinLeft, shinRight].map((d, i) => (
            <path key={i} d={d} fill="url(#bodyFill2)" stroke="none" />
          ))}

          {view === "front" && (
            <>
              <path d="M72,92 Q100,86 128,92" fill="none" stroke="hsl(var(--body-stroke))" strokeWidth="0.2" opacity="0.18" />
              <line x1="100" y1="92" x2="100" y2="240" stroke="hsl(var(--body-stroke))" strokeWidth="0.15" opacity="0.08" />
            </>
          )}
          {view === "back" && (
            <>
              <line x1="100" y1="80" x2="100" y2="240" stroke="hsl(var(--body-stroke))" strokeWidth="0.25" opacity="0.14" />
              <path d="M76,104 Q84,114 80,130" fill="none" stroke="hsl(var(--body-stroke))" strokeWidth="0.2" opacity="0.12" />
              <path d="M124,104 Q116,114 120,130" fill="none" stroke="hsl(var(--body-stroke))" strokeWidth="0.2" opacity="0.12" />
            </>
          )}

          <line x1="66" y1="160" x2="134" y2="160" stroke="hsl(var(--body-stroke))" strokeWidth="0.15" opacity="0.1" />

          {/* Connection lines between highlighted regions */}
          {activeConnections.map(([a, b], i) => {
            const ra = regionMap.get(a);
            const rb = regionMap.get(b);
            if (!ra || !rb) return null;
            return (
              <line
                key={`conn-${a}-${b}`}
                x1={ra.cx}
                y1={ra.cy}
                x2={rb.cx}
                y2={rb.cy}
                stroke="hsl(var(--primary) / 0.2)"
                strokeWidth="1.2"
                strokeDasharray="3 4"
                filter="url(#connectionGlow)"
                className="pointer-events-none animate-breathe"
                style={{ animationDelay: `${i * 0.3}s` }}
              />
            );
          })}

          {visibleRegions.map((region) => {
            const color = getRegionColor(region.id);
            const isHovered = hoveredRegion === region.id;
            const isSelected = activeRegion === region.id;
            const isTapped = tappedRegion === region.id;
            const isHighlighted = highlightedRegions.includes(region.id);
            const hasEvents = !!color;
            const count = getRegionEventCount(region.id);

            const a11yLabel = REGION_A11Y[region.id] + (count > 0 ? `. ${count} ${count === 1 ? "event" : "events"} recorded.` : ". Nothing recorded yet.");

            return (
              <g key={`${view}-${region.id}`} id={`region-${region.id}`} role="button" aria-label={a11yLabel} tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleRegionTap(region.id); } }}
                style={{
                  transform: isTapped ? `scale(1.04)` : "scale(1)",
                  transformOrigin: `${region.cx}px ${region.cy}px`,
                  transition: "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              >
                {/* Tap ripple glow */}
                {isTapped && (
                  <circle
                    cx={region.cx}
                    cy={region.cy}
                    r="18"
                    fill={hasEvents ? `hsl(${color} / 0.15)` : "hsl(var(--primary) / 0.1)"}
                    className="pointer-events-none"
                    style={{
                      animation: "soft-pulse 0.5s ease-out forwards",
                    }}
                  />
                )}

                {/* Highlight glow for pattern insights */}
                {isHighlighted && (
                  <path
                    d={region.d}
                    fill="hsl(var(--primary) / 0.25)"
                    filter="url(#selectedGlow)"
                    className="pointer-events-none animate-soft-pulse"
                  />
                )}

                {hasEvents && !isHighlighted && (
                  <path
                    d={region.d}
                    fill={`hsl(${color} / ${isSelected ? 0.4 : 0.2})`}
                    filter={isSelected ? "url(#selectedGlow)" : "url(#glow2)"}
                    className="pointer-events-none"
                    style={{ transition: "fill 0.5s ease, filter 0.5s ease" }}
                  />
                )}

                <path
                  d={region.d}
                  fill={
                    isHighlighted
                      ? "hsl(var(--primary) / 0.18)"
                      : isSelected
                        ? hasEvents ? `hsl(${color} / 0.45)` : "hsl(var(--primary) / 0.08)"
                        : isHovered
                          ? hasEvents ? `hsl(${color} / 0.35)` : "url(#regionHover)"
                          : "transparent"
                  }
                  stroke={
                    isHighlighted
                      ? "hsl(var(--primary) / 0.3)"
                      : isSelected
                        ? "hsl(var(--foreground) / 0.12)"
                        : isHovered ? "hsl(var(--foreground) / 0.06)" : "transparent"
                  }
                  strokeWidth={isHighlighted ? "1" : isSelected ? "0.7" : "0.4"}
                  className="cursor-pointer"
                  style={{ transition: "fill 0.45s cubic-bezier(0.22, 1, 0.36, 1), stroke 0.45s ease" }}
                  onClick={() => handleRegionTap(region.id)}
                  onMouseEnter={() => setHoveredRegion(region.id)}
                  onMouseLeave={() => setHoveredRegion(null)}
                />

                {hasEvents && !isHovered && !isSelected && !isHighlighted && (
                  <circle cx={region.cx} cy={region.cy} r="1.8" fill={`hsl(${color})`} opacity="0.45" className="pointer-events-none animate-soft-pulse" />
                )}

                {isSelected && count > 0 && (
                  <g className="pointer-events-none" style={{
                    animation: "reveal 0.35s cubic-bezier(0.22, 1, 0.36, 1) forwards",
                  }}>
                    <circle cx={region.cx + 14} cy={region.cy - 10} r="7" fill="hsl(var(--primary))" opacity="0.75" />
                    <text x={region.cx + 14} y={region.cy - 6.5} textAnchor="middle" fill="hsl(var(--primary-foreground))" fontSize="7" fontWeight="500" fontFamily="DM Sans, sans-serif">
                      {count}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Active layer indicator */}
      {state.activeLayer !== "all" && (
        <motion.p
          className="text-[10px] text-primary/50 mt-3 tracking-wide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Viewing: {state.activeLayer === "treatment" ? "what helped" : state.activeLayer === "life-event" ? "life transitions" : state.activeLayer + "s"}
        </motion.p>
      )}

      <p className="text-[10px] text-muted-foreground/30 mt-3 tracking-[0.2em] uppercase" aria-hidden="true">
        {activeRegion ? "Tap to deselect" : "Tap to explore"}
      </p>
    </div>
  );
};

export default BodyMap;
