import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Shield, Eye, BookOpen, Heart, Users } from "lucide-react";

const steps = [
  {
    title: "Your body has a story",
    description:
      "My Body Atlas helps you understand your body experiences across time. Your body story remains private and under your control.",
    icon: "🗺️",
    principle: null,
  },
  {
    title: "Your body story belongs to you",
    description:
      "You retain full ownership of your body history. This product will never imply that your data belongs to the platform. You decide what to record, what to keep, and what to share.",
    icon: null,
    principle: { icon: Shield, label: "Data ownership" },
  },
  {
    title: "Private by default",
    description:
      "All body history is private unless you explicitly choose to create a summary. There are no public profiles, no social feeds, and no automatic sharing — ever.",
    icon: null,
    principle: { icon: Eye, label: "Privacy first" },
  },
  {
    title: "Context, not diagnosis",
    description:
      "Insights remain observational and reflective. We'll surface patterns worth noticing — never diagnostic conclusions. You may wish to explore them with a practitioner.",
    icon: null,
    principle: { icon: BookOpen, label: "Observational insights" },
  },
  {
    title: "Gentle and trauma-informed",
    description:
      "You can skip any question, delete any event, and dismiss any insight. Language stays calm and non-judgmental. This space moves at your pace.",
    icon: null,
    principle: { icon: Heart, label: "Trauma-informed" },
  },
];

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const { completeOnboarding } = useApp();

  const finish = () => {
    completeOnboarding();
    navigate("/atlas");
  };

  const next = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else finish();
  };

  const current = steps[step];

  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-background px-6 py-14">
      {/* Progress */}
      <div className="flex gap-2 w-full max-w-[240px]">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-[3px] flex-1 rounded-full transition-all duration-700 ${
              i <= step ? "bg-primary/70" : "bg-border"
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          className="max-w-xs w-full text-center space-y-5 flex-1 flex flex-col items-center justify-center"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {current.icon && <div className="text-4xl mb-1">{current.icon}</div>}

          {current.principle && (
            <div className="w-14 h-14 rounded-full bg-sage/40 flex items-center justify-center mb-1">
              <current.principle.icon className="w-6 h-6 text-sage-foreground/60" />
            </div>
          )}

          {current.principle && (
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40 font-medium">
              {current.principle.label}
            </span>
          )}

          <h2 className="text-foreground text-2xl">{current.title}</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {current.description}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Actions */}
      <div className="w-full max-w-xs space-y-3">
        <button onClick={next} className="btn-primary">
          {step < steps.length - 1 ? "Continue" : "Start mapping"}
        </button>
        {step < steps.length - 1 && (
          <button onClick={finish} className="btn-ghost">
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
