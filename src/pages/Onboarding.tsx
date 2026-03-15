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
    if (step < 2) {
      setStep(step + 1);
    } else {
      completeOnboarding();
      navigate("/atlas");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-background px-6 py-12">
      {/* Progress */}
      <div className="flex gap-2 w-full max-w-xs">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-500 ${
              i <= step ? "bg-primary" : "bg-border"
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          className="max-w-sm w-full text-center space-y-6 flex-1 flex flex-col items-center justify-center"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.35 }}
        >
          <div className="text-5xl mb-2">{steps[step].icon}</div>
          <h2 className="text-foreground">{steps[step].title}</h2>
          <p className="text-muted-foreground leading-relaxed">
            {steps[step].description}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Actions */}
      <div className="w-full max-w-sm space-y-3">
        <button
          onClick={next}
          className="w-full py-3.5 px-6 bg-primary text-primary-foreground rounded-xl font-medium text-sm transition-all hover:opacity-90 active:scale-[0.98]"
        >
          {step < 2 ? "Continue" : "Start mapping"}
        </button>
        {step < 2 && (
          <button
            onClick={() => { completeOnboarding(); navigate("/atlas"); }}
            className="w-full py-3 text-muted-foreground text-sm hover:text-foreground transition-colors"
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
