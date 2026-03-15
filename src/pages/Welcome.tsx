import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
      <motion.div
        className="max-w-md w-full text-center space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Logo mark */}
        <motion.div
          className="mx-auto w-20 h-20 rounded-full bg-sage flex items-center justify-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" className="text-sage-foreground">
            <ellipse cx="18" cy="14" rx="6" ry="8" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <line x1="18" y1="22" x2="18" y2="32" stroke="currentColor" strokeWidth="1.5" />
            <line x1="18" y1="26" x2="13" y2="23" stroke="currentColor" strokeWidth="1.5" />
            <line x1="18" y1="26" x2="23" y2="23" stroke="currentColor" strokeWidth="1.5" />
            <line x1="18" y1="32" x2="14" y2="36" stroke="currentColor" strokeWidth="1.5" />
            <line x1="18" y1="32" x2="22" y2="36" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </motion.div>

        <div className="space-y-3">
          <h1 className="text-foreground">Body Atlas</h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            A lifetime map of your body and health
          </p>
        </div>

        <motion.p
          className="text-muted-foreground/80 text-sm leading-relaxed max-w-xs mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          Understand your body's story. Track injuries, symptoms, and treatments across time — gently and privately.
        </motion.p>

        <motion.div
          className="pt-4 space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <button
            onClick={() => navigate("/onboarding")}
            className="w-full py-3.5 px-6 bg-primary text-primary-foreground rounded-xl font-medium text-sm transition-all hover:opacity-90 active:scale-[0.98]"
          >
            Get started
          </button>
          <button
            onClick={() => navigate("/atlas")}
            className="w-full py-3 px-6 text-muted-foreground text-sm hover:text-foreground transition-colors"
          >
            I've been here before
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Welcome;
