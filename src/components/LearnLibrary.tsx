import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, BookOpen } from "lucide-react";
import TreatmentGuide from "@/components/TreatmentGuide";

interface LearnLibraryProps { open: boolean; onClose: () => void; }

const articles = [
  { title: "Understanding body patterns", summary: "Our bodies often communicate through repeating patterns. Learning to notice them can be a gentle first step.", category: "Awareness", readTime: "3 min" },
  { title: "Stress and the nervous system", summary: "Stress doesn't just live in our minds. Here's how it can show up physically — and what that might mean for you.", category: "Connection", readTime: "4 min" },
  { title: "The value of tracking", summary: "Keeping a record isn't about perfection. It's about giving your future self context and compassion.", category: "Practice", readTime: "2 min" },
  { title: "Talking to your practitioner", summary: "How to share your body history in a way that feels comfortable and helps them help you.", category: "Communication", readTime: "3 min" },
  { title: "Life stage body changes", summary: "From adolescence through parenthood to later life — how our bodies naturally shift and what to be aware of.", category: "Life stages", readTime: "4 min" },
];

const LearnLibrary = ({ open, onClose }: LearnLibraryProps) => {
  const [showGuide, setShowGuide] = useState(false);

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="modal-overlay" onClick={onClose} />
            <motion.div className="modal-content max-h-[80vh]"
              initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}>
              <div className="modal-header">
                <h2 className="text-xl">Learn</h2>
                <button onClick={onClose} className="modal-close"><X className="w-5 h-5 text-muted-foreground" /></button>
              </div>
              <p className="text-[13px] text-muted-foreground/55 mb-5 leading-relaxed">
                Plain-language guides to help you understand your body better. No jargon, no judgment.
              </p>

              {/* Treatment Guide link */}
              <motion.button
                onClick={() => setShowGuide(true)}
                className="w-full p-4 rounded-2xl bg-sage/10 border border-sage/18 mb-5 text-left hover:bg-sage/15 transition-all duration-200 group"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sage/30 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-4 h-4 text-sage-foreground/60" />
                  </div>
                  <div>
                    <p className="text-[14px] font-serif text-foreground/80 group-hover:text-foreground/90 transition-colors">Treatment Guide</p>
                    <p className="text-[11px] text-muted-foreground/45 mt-0.5">
                      Understand different care approaches — physiotherapy, osteopathy, surgery and more
                    </p>
                  </div>
                </div>
              </motion.button>

              <div className="space-y-3">
                {articles.map((article, i) => (
                  <motion.div key={i}
                    className="p-4 rounded-2xl bg-secondary/40 border border-border/30 cursor-pointer hover:bg-secondary/60 transition-all duration-300"
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                    <span className="section-label text-sage-foreground">{article.category}</span>
                    <h3 className="text-[15px] font-serif text-foreground mt-1.5 mb-1">{article.title}</h3>
                    <p className="text-[12px] text-muted-foreground/70 leading-relaxed">{article.summary}</p>
                    <p className="text-[10px] text-muted-foreground/40 mt-2.5">{article.readTime} read</p>
                  </motion.div>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground/40 text-center mt-5">
                For treatment literacy, not medical advice.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <TreatmentGuide open={showGuide} onClose={() => setShowGuide(false)} />
    </>
  );
};

export default LearnLibrary;
