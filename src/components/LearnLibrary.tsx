import { motion, AnimatePresence } from "framer-motion";
import { X, BookOpen } from "lucide-react";

interface LearnLibraryProps {
  open: boolean;
  onClose: () => void;
}

const articles = [
  {
    title: "Understanding body patterns",
    summary: "Our bodies often communicate through repeating patterns. Learning to notice them can be a gentle first step.",
    category: "Awareness",
    readTime: "3 min",
  },
  {
    title: "Stress and the body",
    summary: "Stress doesn't just live in our minds. Here's how it can show up physically — and what that might mean for you.",
    category: "Connection",
    readTime: "4 min",
  },
  {
    title: "The value of tracking",
    summary: "Keeping a record isn't about perfection. It's about giving your future self context and compassion.",
    category: "Practice",
    readTime: "2 min",
  },
  {
    title: "Talking to your practitioner",
    summary: "How to share your body history in a way that feels comfortable and helps them help you.",
    category: "Communication",
    readTime: "3 min",
  },
];

const LearnLibrary = ({ open, onClose }: LearnLibraryProps) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
          <motion.div className="relative bg-card w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl p-6 shadow-elevated z-10"
            initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl flex items-center gap-2"><BookOpen className="w-5 h-5" /> Learn</h2>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-secondary transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-3">
              {articles.map((article, i) => (
                <motion.div key={i} className="insight-card cursor-pointer"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-xs font-medium text-sage-foreground">{article.category}</span>
                      <h3 className="text-base font-serif text-foreground mt-1">{article.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{article.summary}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">{article.readTime} read</p>
                </motion.div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground text-center mt-4">
              In a full version, these would be full articles with evidence-based content.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LearnLibrary;
