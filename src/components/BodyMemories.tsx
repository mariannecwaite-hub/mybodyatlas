import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp, REGION_LABELS } from "@/context/AppContext";
import { useBodyMemories, getDateFromHint, BodyMemory, BodyMemoryResponse } from "@/hooks/useBodyMemories";
import { X, Sparkles } from "lucide-react";

const STORAGE_KEY = "body-memories-state";
const MAX_VISIBLE = 1;
const COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000; // 3 days between prompts in production (shortened for prototype)

interface MemoryState {
  dismissedIds: string[];
  answeredIds: string[];
  lastShownAt: number;
}

function loadState(): MemoryState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { dismissedIds: [], answeredIds: [], lastShownAt: 0 };
}

function saveState(state: MemoryState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

const BodyMemories = () => {
  const { visibleEvents, addEvent } = useApp();
  const [memState, setMemState] = useState<MemoryState>(loadState);
  const [activeMemory, setActiveMemory] = useState<BodyMemory | null>(null);
  const [responding, setResponding] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const allDismissed = [...memState.dismissedIds, ...memState.answeredIds];

  const memories = useBodyMemories(visibleEvents, {
    maxResults: 3,
    lastDismissedIds: allDismissed,
  });

  // Respect cooldown in prototype (use shorter cooldown: 10 seconds for demo)
  const DEMO_COOLDOWN = 10_000;
  const canShow = Date.now() - memState.lastShownAt > DEMO_COOLDOWN;

  const visibleMemories = canShow ? memories.slice(0, MAX_VISIBLE) : [];

  const dismiss = useCallback((id: string) => {
    setMemState((prev) => {
      const next = { ...prev, dismissedIds: [...prev.dismissedIds, id], lastShownAt: Date.now() };
      saveState(next);
      return next;
    });
    if (activeMemory?.id === id) {
      setActiveMemory(null);
      setResponding(false);
      setConfirmed(false);
    }
  }, [activeMemory]);

  const handleResponse = useCallback((memory: BodyMemory, response: BodyMemoryResponse) => {
    const { eventSeed } = response;

    // "Not sure" / "Nothing comes to mind" / "Not yet" — just dismiss
    if (!eventSeed.titleHint || eventSeed.regions.length === 0) {
      dismiss(memory.id);
      return;
    }

    // Create event from seed
    addEvent({
      type: eventSeed.type,
      title: eventSeed.titleHint,
      description: `Added from a Body Memory reflection.`,
      regions: eventSeed.regions,
      date: getDateFromHint(eventSeed.dateHint),
      severity: "mild",
      ongoing: false,
    });

    setConfirmed(true);
    setTimeout(() => {
      setMemState((prev) => {
        const next = { ...prev, answeredIds: [...prev.answeredIds, memory.id], lastShownAt: Date.now() };
        saveState(next);
        return next;
      });
      setActiveMemory(null);
      setResponding(false);
      setConfirmed(false);
    }, 1800);
  }, [addEvent, dismiss]);

  if (visibleMemories.length === 0) return null;

  return (
    <div className="space-y-3">
      <AnimatePresence mode="wait">
        {visibleMemories.map((memory) => (
          <motion.div
            key={memory.id}
            className="rounded-2xl border border-lavender/25 bg-lavender/8 p-5 relative overflow-hidden"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Subtle ambient glow */}
            <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-lavender/15 blur-2xl pointer-events-none animate-gentle-glow" />

            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-lavender-foreground/40" />
                <span className="text-[10px] font-medium text-lavender-foreground/45 uppercase tracking-[0.15em]">
                  Body memory
                </span>
              </div>
              <button
                onClick={() => dismiss(memory.id)}
                className="p-1 rounded-full hover:bg-secondary/40 transition-colors duration-300"
                aria-label="Dismiss this reflection"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground/30" />
              </button>
            </div>

            {/* Prompt */}
            <motion.p
              className="text-[15px] font-serif text-foreground/80 leading-relaxed mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.5 }}
            >
              {memory.prompt}
            </motion.p>

            <motion.p
              className="text-[12px] text-muted-foreground/40 leading-relaxed mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.5 }}
            >
              {memory.context}
            </motion.p>

            {/* Related region badge */}
            {memory.relatedRegion && (
              <motion.div
                className="mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-lavender/15 border border-lavender/15 text-[10px] text-lavender-foreground/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-lavender-foreground/30" />
                  {REGION_LABELS[memory.relatedRegion]}
                </span>
              </motion.div>
            )}

            {/* Confirmed state */}
            <AnimatePresence mode="wait">
              {confirmed && activeMemory?.id === memory.id ? (
                <motion.div
                  key="confirmed"
                  className="flex items-center gap-2 py-3"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <motion.div
                    className="w-6 h-6 rounded-full bg-sage/40 flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  >
                    <span className="text-[11px]">✓</span>
                  </motion.div>
                  <p className="text-[13px] text-sage-foreground/60 font-medium">Added to your body story</p>
                </motion.div>
              ) : (
                <motion.div
                  key="responses"
                  className="space-y-1.5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35, duration: 0.4 }}
                >
                  {memory.responses.map((response, i) => (
                    <motion.button
                      key={response.label}
                      onClick={() => {
                        setActiveMemory(memory);
                        setResponding(true);
                        handleResponse(memory, response);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left bg-card/50 border border-border/15 hover:bg-card/80 hover:border-border/25 transition-all duration-300 group"
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      whileTap={{ scale: 0.98 }}
                      whileHover={{ x: 3, transition: { duration: 0.25 } }}
                    >
                      <span className="text-sm flex-shrink-0">{response.emoji}</span>
                      <span className="text-[13px] text-foreground/65 group-hover:text-foreground/80 transition-colors duration-300">
                        {response.label}
                      </span>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Frequency note */}
            <motion.p
              className="text-[9px] text-muted-foreground/25 mt-4 text-center tracking-wide"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              These reflections appear gently and infrequently
            </motion.p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default BodyMemories;
