import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp, REGION_LABELS } from "@/context/AppContext";
import { X } from "lucide-react";

const STORAGE_KEY = "last-atlas-visit";
const GAP_THRESHOLD_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

const ReturnPrompt = () => {
  const { visibleEvents } = useApp();
  const [show, setShow] = useState(false);
  const [prompt, setPrompt] = useState<{ title: string; subtitle: string } | null>(null);

  useEffect(() => {
    try {
      const lastVisit = localStorage.getItem(STORAGE_KEY);
      const now = Date.now();

      if (lastVisit) {
        const gap = now - parseInt(lastVisit, 10);
        if (gap > GAP_THRESHOLD_MS && visibleEvents.length > 0) {
          const ongoing = visibleEvents.filter(e => e.ongoing);
          const recent = ongoing.length > 0 ? ongoing[ongoing.length - 1] : visibleEvents[visibleEvents.length - 1];

          if (recent) {
            const days = Math.floor(gap / (24 * 60 * 60 * 1000));
            const weeks = Math.floor(days / 7);
            const timeLabel = weeks > 0 ? `${weeks} ${weeks === 1 ? 'week' : 'weeks'}` : `${days} days`;
            const regionLabel = recent.regions.length > 0 ? REGION_LABELS[recent.regions[0]] : null;

            setPrompt({
              title: regionLabel
                ? `It's been ${timeLabel} since you noted your ${regionLabel.toLowerCase()}.`
                : `It's been a little while since you checked in.`,
              subtitle: "Has anything changed? Take a moment to notice how your body feels today.",
            });
            setShow(true);
          }
        }
      }

      localStorage.setItem(STORAGE_KEY, now.toString());
    } catch {}
  }, []);

  if (!prompt) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute inset-0 bg-background/92 backdrop-blur-xl" onClick={() => setShow(false)} />
          <motion.div
            className="relative bg-card rounded-3xl p-8 max-w-sm w-full text-center border border-border/20"
            style={{ boxShadow: "var(--shadow-lg)" }}
            initial={{ y: 24, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 12, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <button onClick={() => setShow(false)} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-secondary/50 transition-colors duration-300">
              <X className="w-4 h-4 text-muted-foreground/30" />
            </button>

            <motion.div
              className="w-12 h-12 mx-auto mb-5 rounded-full bg-lavender/25 flex items-center justify-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <span className="text-lg">🌿</span>
            </motion.div>

            <motion.h3
              className="text-[20px] font-serif text-foreground/85 leading-relaxed mb-3"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {prompt.title}
            </motion.h3>

            <motion.p
              className="text-[14px] text-muted-foreground/50 leading-relaxed mb-7"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              {prompt.subtitle}
            </motion.p>

            <motion.div
              className="space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <button
                onClick={() => setShow(false)}
                className="w-full py-3 rounded-2xl bg-sage/20 text-foreground/70 text-[13px] font-medium hover:bg-sage/30 transition-colors duration-300"
              >
                Check in now
              </button>
              <button
                onClick={() => setShow(false)}
                className="w-full py-2.5 text-[12px] text-muted-foreground/40 hover:text-muted-foreground/60 transition-colors duration-300"
              >
                Not right now
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReturnPrompt;
