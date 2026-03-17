import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
      {/* Subtle ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full bg-sage/20 blur-[100px] animate-breathe" />
      </div>

      <motion.div
        className="relative max-w-sm w-full text-center space-y-10"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {/* Logo */}
        <motion.div
          className="mx-auto w-16 h-16 rounded-full bg-sage/60 flex items-center justify-center"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.7 }}
        >
          <svg width="28" height="32" viewBox="0 0 28 32" fill="none" className="text-sage-foreground">
            <ellipse cx="14" cy="10" rx="5" ry="7" stroke="currentColor" strokeWidth="1.2" fill="none" />
            <line x1="14" y1="17" x2="14" y2="26" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="14" y1="21" x2="10" y2="18.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="14" y1="21" x2="18" y2="18.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="14" y1="26" x2="11" y2="30" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="14" y1="26" x2="17" y2="30" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </motion.div>

        <div className="space-y-3">
          <h1 className="text-foreground">My Body Atlas</h1>
          <p className="text-muted-foreground text-base leading-relaxed max-w-[280px] mx-auto">
            Your body has been keeping its own record all along. This is the first place built to help you read it.
          </p>
        </div>

        <motion.div
          className="rounded-2xl p-5 bg-sage/10 border border-sage/15 text-left space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <p className="text-[13px] text-foreground/75 leading-relaxed">
            My Body Atlas helps you organise your body experiences across time.
          </p>
          <p className="text-[12px] text-muted-foreground/50 leading-relaxed">
            Your body story remains private and under your control.
          </p>
        </motion.div>

        <motion.div
          className="pt-2 space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
        >
          <button onClick={() => navigate("/onboarding")} className="btn-primary">
            Get started
          </button>
          <button onClick={() => navigate("/atlas")} className="btn-ghost">
            I've been here before
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Welcome;
