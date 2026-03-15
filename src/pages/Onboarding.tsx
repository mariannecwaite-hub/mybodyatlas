import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";

const steps = [
  {
    title: "Your body has a story",
    description: "Body Atlas helps you map what's happened — injuries, symptoms, stress, treatments — so you can see the bigger picture over time.",
    icon: "🗺️",
  },
  {
    title: "Private and yours",
    description: "Everything stays on your device. You choose what to share and with whom. This is your personal record, not a medical chart.",
    icon: "🔒",
  },
  {
    title: "Gentle insights",
    description: "We'll surface patterns you might not have noticed — like how stress and tension often travel together. Never diagnostic, always supportive.",
    icon: "🌿",
  },
];

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const { completeOnboarding } = useApp();

  const next = () => {
    if (step < 2) setStep(step + 1);
    else { completeOnboarding(); navigate("/atlas"); }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-background px-6 py-14">
      {/* Progress */}
      <div className="flex gap-2.5 w-full max-w-[200px]">
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
          <div className="text-4xl mb-1">{steps[step].icon}</div>
          <h2 className="text-foreground text-2xl">{steps[step].title}</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {steps[step].description}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Actions */}
      <div className="w-full max-w-xs space-y-3">
        <button onClick={next} className="btn-primary">
          {step < 2 ? "Continue" : "Start mapping"}
        </button>
        {step < 2 && (
          <button
            onClick={() => { completeOnboarding(); navigate("/atlas"); }}
            className="btn-ghost"
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
