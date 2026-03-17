import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useApp, BodyRegion, EventType, BodyEvent, BodyRelationship } from "@/context/AppContext";
import { Shield, Check, ChevronRight, Undo2 } from "lucide-react";
import { BodySilhouetteFigure } from "@/components/BodySilhouette";

/* ─── Suggestion card type ─── */
interface SuggestionCard {
  id: string;
  title: string;
  description: string;
  type: EventType;
  regions: BodyRegion[];
  defaultYear: number;
  severity: "mild" | "moderate" | "significant";
  ongoing?: boolean;
}

/* ─── Event type dot colors (CSS var references) ─── */
const typeDotClass: Record<EventType, string> = {
  injury: "bg-body-pain",
  symptom: "bg-body-tension",
  stress: "bg-body-tension",
  treatment: "bg-body-healing",
  "life-event": "bg-body-neutral",
  "safety-experience": "bg-body-neutral",
};

const typeColor: Record<EventType, string> = {
  injury: "var(--body-pain)",
  symptom: "var(--body-tension)",
  stress: "var(--body-tension)",
  treatment: "var(--body-healing)",
  "life-event": "var(--body-neutral)",
  "safety-experience": "var(--body-neutral)",
};

/* ─── Pre-built suggestions per life stage ─── */
const childhoodCards: SuggestionCard[] = [
  { id: "c2", title: "Ankle or knee injury", description: "A sprain, twist or impact from sport or play.", type: "injury", regions: ["ankle_foot_left", "knee_left"], defaultYear: 2004, severity: "moderate" },
  { id: "c3", title: "Childhood surgery", description: "Tonsils, appendix, grommets or another procedure.", type: "treatment", regions: ["abdomen"], defaultYear: 2000, severity: "moderate" },
  { id: "c4", title: "Recurring illness", description: "Frequent ear infections, asthma, allergies or similar.", type: "symptom", regions: ["chest", "head_jaw"], defaultYear: 2001, severity: "mild" },
  { id: "c5", title: "A fall or impact", description: "A memorable fall — from a bike, tree, trampoline or stairs.", type: "injury", regions: ["head_jaw", "wrist_hand_right"], defaultYear: 2003, severity: "mild" },
  { id: "c6", title: "Childhood stress", description: "A period that felt overwhelming — school, family, moving.", type: "stress", regions: ["chest", "abdomen"], defaultYear: 2005, severity: "mild" },
  { id: "c7", title: "Birth story", description: "Anything notable about your birth — early arrival, complications, or a difficult delivery.", type: "life-event", regions: ["head_jaw", "neck", "abdomen"], defaultYear: 1998, severity: "mild" },
];

const adultCards: SuggestionCard[] = [
  { id: "a1", title: "Back discomfort", description: "Lower or upper back tension, aching or stiffness.", type: "symptom", regions: ["lower_back", "upper_back"], defaultYear: 2018, severity: "moderate", ongoing: true },
  { id: "a2", title: "Neck & shoulder tension", description: "Tightness across the shoulders and neck — often stress-related.", type: "symptom", regions: ["neck", "shoulder_left", "shoulder_right"], defaultYear: 2019, severity: "moderate" },
  { id: "a3", title: "Knee issue", description: "Clicking, aching or instability in one or both knees.", type: "symptom", regions: ["knee_left"], defaultYear: 2020, severity: "mild" },
  { id: "a4", title: "Headaches or migraines", description: "Recurring headaches — tension, cluster or migraine.", type: "symptom", regions: ["head_jaw"], defaultYear: 2019, severity: "moderate" },
  { id: "a5", title: "Wrist or hand discomfort", description: "RSI, carpal tunnel, or strain from repetitive use.", type: "symptom", regions: ["wrist_hand_right", "wrist_hand_left"], defaultYear: 2021, severity: "mild" },
  { id: "a6", title: "Foot or ankle issue", description: "Plantar fasciitis, recurring sprains, or arch discomfort.", type: "symptom", regions: ["ankle_foot_left", "ankle_foot_right"], defaultYear: 2020, severity: "mild" },
  { id: "a7", title: "Breathing or chest tightness", description: "Feeling restricted, shallow breathing or chest discomfort.", type: "symptom", regions: ["chest"], defaultYear: 2021, severity: "mild" },
  { id: "a8", title: "Skin changes", description: "Eczema, psoriasis, rashes or other skin patterns.", type: "symptom", regions: ["wrist_hand_left", "head_jaw"], defaultYear: 2022, severity: "mild", ongoing: true },
];

const transitionCards: SuggestionCard[] = [
  { id: "t1", title: "Pregnancy or postpartum", description: "The physical journey of carrying, delivering and recovering.", type: "life-event", regions: ["abdomen", "lower_back"], defaultYear: 2020, severity: "moderate" },
  { id: "t2", title: "Burnout or exhaustion", description: "A period of sustained overwhelm affecting your body.", type: "stress", regions: ["neck", "chest", "head_jaw"], defaultYear: 2021, severity: "significant" },
  { id: "t3", title: "Major relocation", description: "Moving cities or countries — disrupted routines and stress.", type: "life-event", regions: ["neck", "chest"], defaultYear: 2019, severity: "moderate" },
  { id: "t4", title: "Loss or grief", description: "Losing someone close and the physical weight of grief.", type: "life-event", regions: ["chest", "abdomen"], defaultYear: 2018, severity: "significant" },
  { id: "t5", title: "Career change or pressure", description: "A demanding new role, job loss, or professional shift.", type: "stress", regions: ["neck", "shoulder_right", "lower_back"], defaultYear: 2020, severity: "moderate" },
  { id: "t6", title: "Becoming a parent", description: "The physical and emotional shift of caring for a new life.", type: "life-event", regions: ["lower_back", "wrist_hand_left", "shoulder_left"], defaultYear: 2021, severity: "moderate" },
  { id: "t7", title: "Hormonal changes", description: "Menopause, puberty, thyroid changes or hormonal shifts.", type: "life-event", regions: ["abdomen", "head_jaw"], defaultYear: 2022, severity: "moderate" },
  { id: "t8", title: "Mental health period", description: "Anxiety, depression or a period of emotional difficulty.", type: "stress", regions: ["chest", "head_jaw", "abdomen"], defaultYear: 2020, severity: "moderate" },
  // Male-specific life transition cards — terracotta dots
  { id: "tm1", title: "Becoming a father — the shift in identity and body", description: "Sleep deprivation, responsibility, and physical adjustment.", type: "life-event", regions: ["lower_back", "neck", "chest"], defaultYear: 2020, severity: "moderate" },
  { id: "tm2", title: "Redundancy or professional failure", description: "The physical toll of losing your footing.", type: "stress", regions: ["chest", "head_jaw", "neck"], defaultYear: 2019, severity: "significant" },
  { id: "tm3", title: "Bereavement — carrying a loss", description: "Grief sits in the body, not just the mind.", type: "life-event", regions: ["chest", "abdomen"], defaultYear: 2018, severity: "significant" },
  { id: "tm4", title: "Relationship breakdown", description: "The physical weight of things falling apart.", type: "stress", regions: ["chest", "abdomen", "head_jaw"], defaultYear: 2019, severity: "moderate" },
  { id: "tm5", title: "High-pressure period — when everything was on you", description: "Sustained demand with no recovery.", type: "stress", regions: ["neck", "shoulder_left", "shoulder_right", "lower_back"], defaultYear: 2020, severity: "significant" },
  { id: "tm6", title: "Heart event or health scare", description: "The moment your body demanded attention.", type: "life-event", regions: ["chest"], defaultYear: 2021, severity: "significant" },
  { id: "tm7", title: "Sleep stopped working — extended disruption", description: "Months or years of broken sleep.", type: "symptom", regions: ["head_jaw", "neck"], defaultYear: 2020, severity: "moderate", ongoing: true },
  { id: "tm8", title: "Running on empty — sustained exhaustion with no clear cause", description: "Tiredness that doesn't make sense and doesn't resolve.", type: "symptom", regions: ["chest", "head_jaw"], defaultYear: 2021, severity: "moderate", ongoing: true },
];

const treatmentCards: SuggestionCard[] = [
  { id: "tr1", title: "Physiotherapy", description: "Structured rehabilitation with a physiotherapist.", type: "treatment", regions: ["knee_left", "lower_back"], defaultYear: 2020, severity: "mild" },
  { id: "tr2", title: "Osteopathy or chiropractic", description: "Manual therapy for alignment and movement.", type: "treatment", regions: ["lower_back", "upper_back", "neck"], defaultYear: 2019, severity: "mild" },
  { id: "tr3", title: "Ongoing medication", description: "Regular medication for a chronic or recurring condition.", type: "treatment", regions: [], defaultYear: 2021, severity: "mild", ongoing: true },
  { id: "tr4", title: "Massage therapy", description: "Regular or occasional massage for tension or recovery.", type: "treatment", regions: ["upper_back", "neck", "shoulder_left"], defaultYear: 2021, severity: "mild" },
  { id: "tr5", title: "Yoga or Pilates", description: "Movement practice for strength, flexibility or recovery.", type: "treatment", regions: ["lower_back", "abdomen"], defaultYear: 2022, severity: "mild", ongoing: true },
  { id: "tr6", title: "Acupuncture", description: "Traditional or dry needling for pain or tension.", type: "treatment", regions: ["lower_back", "neck"], defaultYear: 2021, severity: "mild" },
  { id: "tr7", title: "Psychotherapy or counselling", description: "Therapy for emotional wellbeing and stress management.", type: "treatment", regions: [], defaultYear: 2020, severity: "mild" },
  { id: "tr8", title: "Strength & conditioning", description: "Structured exercise for rehabilitation or prevention.", type: "treatment", regions: ["knee_left", "hip_left", "lower_back"], defaultYear: 2022, severity: "mild" },
];

/* ─── Step definitions ─── */
interface OnboardingStep {
  id: string;
  phase: "intro" | "prompt" | "reveal";
  title: string;
  subtitle: string;
  cards?: SuggestionCard[];
  principle?: { icon: typeof Shield; label: string };
}

/* ── Women's health suggestion cards ── */
const womensHealthCards: SuggestionCard[] = [
  { id: "wh1", title: "Menstrual cycle changes or irregularities", description: "Changes in cycle length, flow, or regularity.", type: "symptom", regions: ["abdomen"], defaultYear: 2018, severity: "mild" },
  { id: "wh2", title: "Perimenopause or menopause", description: "Hot flashes, sleep changes, mood shifts, or other transitions.", type: "life-event", regions: ["abdomen", "head_jaw"], defaultYear: 2022, severity: "moderate" },
  { id: "wh3", title: "Pregnancy, postpartum or birth experience", description: "The physical and emotional journey of pregnancy and recovery.", type: "life-event", regions: ["abdomen", "lower_back"], defaultYear: 2020, severity: "moderate" },
  { id: "wh4", title: "Miscarriage or pregnancy loss", description: "A loss that the body carries alongside the heart.", type: "life-event", regions: ["abdomen"], defaultYear: 2019, severity: "significant" },
  { id: "wh5", title: "Fertility treatment or challenges", description: "IVF, hormonal treatments, or the physical toll of trying.", type: "treatment", regions: ["abdomen"], defaultYear: 2020, severity: "moderate" },
  { id: "wh6", title: "Hormonal contraception and its effects", description: "The pill, IUD, implant — and what your body noticed.", type: "treatment", regions: ["abdomen", "head_jaw"], defaultYear: 2016, severity: "mild" },
  { id: "wh7", title: "Endometriosis or suspected endometriosis", description: "Chronic pelvic discomfort, heavy periods, or a long path to understanding.", type: "symptom", regions: ["abdomen", "lower_back"], defaultYear: 2018, severity: "significant", ongoing: true },
  { id: "wh8", title: "PCOS or hormonal conditions", description: "Hormonal patterns that affect many systems at once.", type: "symptom", regions: ["abdomen"], defaultYear: 2017, severity: "moderate", ongoing: true },
  { id: "wh9", title: "Thyroid changes", description: "Overactive, underactive, or fluctuating — and what your body felt.", type: "symptom", regions: ["neck"], defaultYear: 2019, severity: "moderate" },
  { id: "wh10", title: "Being dismissed or disbelieved by a healthcare professional", description: "An experience that changed how you sought care.", type: "life-event", regions: [], defaultYear: 2018, severity: "significant" },
  { id: "wh11", title: "A diagnosis that took years to receive", description: "The weight of not knowing — and finally being heard.", type: "life-event", regions: [], defaultYear: 2020, severity: "significant" },
  { id: "wh12", title: "Chronic fatigue or unexplained exhaustion", description: "Tiredness that rest doesn't resolve.", type: "symptom", regions: ["chest", "head_jaw"], defaultYear: 2021, severity: "moderate", ongoing: true },
  { id: "wh13", title: "Fibromyalgia or widespread discomfort", description: "When your whole body speaks at once.", type: "symptom", regions: ["neck", "shoulder_left", "shoulder_right", "lower_back"], defaultYear: 2019, severity: "significant", ongoing: true },
  { id: "wh14", title: "Hypermobility", description: "Flexibility that comes with its own set of experiences.", type: "symptom", regions: ["knee_left", "wrist_hand_left", "shoulder_left"], defaultYear: 2015, severity: "mild", ongoing: true },
  { id: "wh15", title: "An experience that affected how safe you felt in your body", description: "You only need to record what feels right.", type: "life-event", regions: [], defaultYear: 2015, severity: "significant" },
];

const onboardingSteps: OnboardingStep[] = [
  {
    id: "intro",
    phase: "intro",
    title: "Your body has a story",
    subtitle: "We'll guide you through a few life stages — just tap anything that feels familiar. It takes about 2–3 minutes.",
  },
  {
    id: "acknowledgement",
    phase: "intro",
    title: "",
    subtitle: "",
  },
  {
    id: "privacy",
    phase: "intro",
    title: "Everything stays yours",
    subtitle: "Your body story is private. Nothing is shared unless you choose to share it. You can skip anything, anytime.",
    principle: { icon: Shield, label: "Private by default" },
  },
  {
    id: "childhood",
    phase: "prompt",
    title: "Childhood body memories",
    subtitle: "Think back to your earliest body experiences — injuries, illnesses, or things that stood out. Tap any that feel familiar.",
    cards: childhoodCards,
  },
  {
    id: "adult",
    phase: "prompt",
    title: "Your body now",
    subtitle: "What has your body been telling you in recent years? Aches, tensions, changes you've noticed.",
    cards: adultCards,
  },
  {
    id: "transitions",
    phase: "prompt",
    title: "Life transitions",
    subtitle: "Major life changes often leave a mark on the body. Tap any that you've been through.",
    cards: transitionCards,
  },
  {
    id: "womens-health",
    phase: "prompt",
    title: "Your body through womanhood",
    subtitle: "Experiences that are often overlooked but matter deeply",
    cards: womensHealthCards,
  },
  {
    id: "treatments",
    phase: "prompt",
    title: "What you've explored",
    subtitle: "Treatments, therapies or practices you've tried — even briefly.",
    cards: treatmentCards,
  },
  {
    id: "reveal",
    phase: "reveal",
    title: "Your Body Story So Far",
    subtitle: "Here's what you've mapped. This is just the beginning — you can always add, edit or remove events later.",
  },
];

/* ─── Mini body silhouette for reveal ─── */
const regionPositions: Partial<Record<BodyRegion, { x: number; y: number }>> = {
  head_jaw: { x: 50, y: 8 },
  neck: { x: 50, y: 16 },
  shoulder_left: { x: 33, y: 22 },
  shoulder_right: { x: 67, y: 22 },
  chest: { x: 50, y: 28 },
  upper_back: { x: 50, y: 28 },
  abdomen: { x: 50, y: 42 },
  lower_back: { x: 50, y: 42 },
  wrist_hand_left: { x: 20, y: 45 },
  wrist_hand_right: { x: 80, y: 45 },
  hip_left: { x: 42, y: 55 },
  hip_right: { x: 58, y: 55 },
  knee_left: { x: 42, y: 72 },
  knee_right: { x: 58, y: 72 },
  ankle_foot_left: { x: 42, y: 90 },
  ankle_foot_right: { x: 58, y: 90 },
};

/* ── Acknowledgement screen — a breath before asking anything ── */
const AcknowledgementScreen = ({ onContinue }: { onContinue: () => void }) => {
  const [showContinue, setShowContinue] = useState(false);

  useState(() => {
    const timer = setTimeout(() => setShowContinue(true), 1500);
    return () => clearTimeout(timer);
  });

  // Use useEffect for the delayed continue button
  React.useEffect(() => {
    const timer = setTimeout(() => setShowContinue(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
      <motion.h2
        className="text-[28px] font-serif italic text-foreground/85 leading-[1.4] mb-8 max-w-xs"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        Everything your body has experienced is worth recording
      </motion.h2>
      <motion.div
        className="max-w-[280px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
      >
        <p className="text-[16px] leading-[1.75] text-center" style={{ color: "#6B6960", fontFamily: "'DM Sans', sans-serif" }}>
          Many people who come to My Body Atlas have spent years feeling that their body wasn't fully understood — by the healthcare system, or sometimes even by themselves.
        </p>
        <p className="text-[16px] leading-[1.75] text-center mt-4 italic" style={{ color: "#6B6960", fontFamily: "'DM Sans', sans-serif" }}>
          Nothing you've experienced is too small. Nothing is imagined. Your body has been responding to your life all along — this is simply the first time you've had somewhere to put it.
        </p>
      </motion.div>
      <AnimatePresence>
        {showContinue && (
          <motion.button
            onClick={onContinue}
            className="mt-10 text-[14px] text-foreground/50 hover:text-foreground/70 transition-colors duration-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            Continue →
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─── Component ─── */
const Onboarding = () => {
  const [step, setStep] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [customYears, setCustomYears] = useState<Record<string, number>>({});
  const [dismissalAck, setDismissalAck] = useState(false);
  const navigate = useNavigate();
  const { addEvent, completeOnboarding } = useApp();

  const current = onboardingSteps[step];
  const totalSteps = onboardingSteps.length;

  const toggleCard = useCallback((card: SuggestionCard) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(card.id)) {
        next.delete(card.id);
      } else {
        next.add(card.id);
      }
      return next;
    });
  }, []);

  const adjustYear = useCallback((cardId: string, delta: number) => {
    setCustomYears((prev) => {
      const card = [...childhoodCards, ...adultCards, ...transitionCards, ...treatmentCards].find((c) => c.id === cardId);
      const currentYear = prev[cardId] ?? card?.defaultYear ?? 2020;
      return { ...prev, [cardId]: Math.max(1950, Math.min(2026, currentYear + delta)) };
    });
  }, []);

  const finishOnboarding = () => {
    const allCards = [...childhoodCards, ...adultCards, ...transitionCards, ...womensHealthCards, ...treatmentCards];
    allCards.forEach((card) => {
      if (selectedIds.has(card.id)) {
        const year = customYears[card.id] ?? card.defaultYear;
        const event: Omit<BodyEvent, "id"> = {
          type: card.type,
          title: card.title,
          description: card.description,
          regions: card.regions,
          date: `${year}-06-15`,
          severity: card.severity,
          ongoing: card.ongoing || false,
        };
        addEvent(event);
      }
    });
    completeOnboarding();
    navigate("/atlas");
  };

  const next = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      finishOnboarding();
    }
  };

  const back = () => {
    if (step > 0) setStep(step - 1);
  };

  const skip = () => {
    completeOnboarding();
    navigate("/atlas");
  };

  const allCards = [...childhoodCards, ...adultCards, ...transitionCards, ...womensHealthCards, ...treatmentCards];
  const selectedEvents = allCards.filter((c) => selectedIds.has(c.id));
  const affectedRegions = new Set(selectedEvents.flatMap((e) => e.regions));

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Progress bar */}
      <div className="sticky top-0 z-20 px-6 pt-6 pb-2 bg-background/80 backdrop-blur-xl">
        <div className="flex gap-1.5 w-full max-w-md mx-auto">
          {onboardingSteps.map((_, i) => (
            <motion.div
              key={i}
              className="h-[3px] flex-1 rounded-full"
              animate={{
                backgroundColor: i <= step
                  ? "hsl(var(--primary) / 0.7)"
                  : "hsl(var(--border))",
              }}
              transition={{ duration: 0.5 }}
            />
          ))}
        </div>
        {selectedIds.size > 0 && (
          <motion.p
            className="text-[10px] text-center text-muted-foreground/40 mt-2 tracking-wide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {selectedIds.size} {selectedIds.size === 1 ? "event" : "events"} mapped
          </motion.p>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full px-6 pb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            className="flex-1 flex flex-col"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Header — no emojis, clean typography */}
            {current.id !== "acknowledgement" && (
            <div className="text-center pt-6 pb-6">
              {current.principle && (
                <motion.div
                  className="mx-auto w-14 h-14 rounded-full bg-sage/40 flex items-center justify-center mb-4"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15, duration: 0.5 }}
                >
                  <current.principle.icon className="w-6 h-6 text-sage-foreground/60" />
                </motion.div>
              )}

              {current.principle && (
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40 font-medium block mb-3">
                  {current.principle.label}
                </span>
              )}

              <h2 className="text-foreground text-[24px] leading-tight mb-2 font-serif">{current.title}</h2>
              <p className="text-muted-foreground/60 text-[14px] leading-relaxed max-w-sm mx-auto">
                {current.subtitle}
              </p>
              {current.id === "intro" && (
                <p className="text-muted-foreground/40 text-[12px] leading-relaxed mt-3 max-w-xs mx-auto">
                  For people who've felt their health history has never quite been understood.
                </p>
              )}
              {current.id === "womens-health" && (
                <p className="text-muted-foreground/50 text-[13px] leading-relaxed mt-3 max-w-xs mx-auto italic" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  Women's health experiences are among the most underrecorded. All of these are worth having in your body story.
                </p>
              )}
            </div>
            )}

            {/* ── Prompt cards — with colored dots (lavender for women's health) ── */}
            {current.phase === "prompt" && current.cards && (
              <motion.div
                className="flex-1 overflow-y-auto pb-4 -mx-1 px-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <div className="grid grid-cols-2 gap-2.5">
                  {current.cards.map((card, i) => {
                    const isSelected = selectedIds.has(card.id);
                    const year = customYears[card.id] ?? card.defaultYear;
                    const isWomensHealth = current.id === "womens-health";
                    const isSafetyCard = card.id === "wh15";
                    const isDismissalCard = card.id === "wh10";
                    return (
                      <motion.button
                        key={card.id}
                        onClick={() => {
                          toggleCard(card);
                          // Dismissal acknowledgement
                          if (isDismissalCard && !selectedIds.has(card.id)) {
                            setDismissalAck(true);
                            setTimeout(() => setDismissalAck(false), 2500);
                          }
                        }}
                        className={`relative text-left p-4 rounded-2xl border transition-colors duration-300 ${
                          isSelected
                            ? "bg-sage/15 border-sage/30"
                            : "bg-card/60 border-border/20 hover:bg-secondary/30"
                        }`}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: 0.25 + i * 0.04,
                          duration: 0.5,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        whileTap={{ scale: 0.97 }}
                      >
                        {/* Selected checkmark */}
                        <AnimatePresence>
                          {isSelected && (
                            <motion.div
                              className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary/80 flex items-center justify-center"
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              transition={{ type: "spring", stiffness: 500, damping: 25 }}
                            >
                              <Check className="w-3 h-3 text-primary-foreground" />
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Colored dot — lavender for women's health */}
                        <div className={`w-3 h-3 rounded-full mb-2 ${isWomensHealth ? "bg-lavender" : typeDotClass[card.type]}`} />

                        <p className="text-[13px] font-medium text-foreground/80 leading-snug mb-1 pr-6">
                          {card.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground/40 leading-relaxed line-clamp-2">
                          {card.description}
                        </p>

                        {/* Year adjuster */}
                        <AnimatePresence>
                          {isSelected && (
                            <motion.div
                              className="mt-3 flex items-center gap-2"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={(e) => { e.stopPropagation(); adjustYear(card.id, -1); }}
                                className="w-6 h-6 rounded-full bg-secondary/60 flex items-center justify-center text-[11px] text-muted-foreground/50 hover:bg-secondary transition-colors"
                              >
                                ‹
                              </button>
                              <span className="text-[12px] font-medium text-foreground/60 min-w-[36px] text-center">
                                {year}
                              </span>
                              <button
                                onClick={(e) => { e.stopPropagation(); adjustYear(card.id, 1); }}
                                className="w-6 h-6 rounded-full bg-secondary/60 flex items-center justify-center text-[11px] text-muted-foreground/50 hover:bg-secondary transition-colors"
                              >
                                ›
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    );
                  })}
                </div>
                {/* Dismissal acknowledgement */}
                <AnimatePresence>
                  {dismissalAck && (
                    <motion.p
                      className="text-[15px] italic text-center mt-4 max-w-xs mx-auto"
                      style={{ color: "#6B6960", fontFamily: "'DM Serif Display', serif" }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      This is worth recording. It is part of your body story.
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* ── Acknowledgement screen ── */}
            {current.id === "acknowledgement" && (
              <AcknowledgementScreen onContinue={next} />
            )}

            {/* ── Intro content ── */}
            {current.phase === "intro" && current.id !== "acknowledgement" && (
              <div className="flex-1 flex items-center justify-center">
                {current.id === "intro" ? (
                  <motion.div
                    className="flex flex-col items-center gap-4"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  >
                    <BodySilhouetteFigure className="w-28 h-40">
                      <circle cx="100" cy="216" r="8" fill="hsl(var(--body-tension) / 0.7)" className="animate-soft-pulse" />
                    </BodySilhouetteFigure>
                  </motion.div>
                ) : (
                  <motion.div
                    className="rounded-2xl p-6 bg-sage/8 border border-sage/12 max-w-sm"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  >
                    <p className="text-[13px] text-foreground/70 leading-[1.8]">
                      Your body story remains on your device. No practitioner, platform or third party sees anything unless you explicitly choose to share.
                    </p>
                  </motion.div>
                )}
              </div>
            )}

            {/* ── Reveal screen ── */}
            {current.phase === "reveal" && (
              <div className="flex-1 flex flex-col items-center pt-2">
                {selectedEvents.length > 0 ? (
                  <>
                    {/* Mini body silhouette with highlights */}
                    <motion.div
                      className="relative w-[140px] h-[200px] mb-6"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <BodySilhouetteFigure className="w-full h-full opacity-20" />
                      {Array.from(affectedRegions).map((regionId, i) => {
                        const pos = regionPositions[regionId];
                        if (!pos) return null;
                        const events = selectedEvents.filter((e) => e.regions.includes(regionId));
                        const primaryType = events[0]?.type || "symptom";
                        return (
                          <motion.div
                            key={regionId}
                            className="absolute rounded-full animate-soft-pulse"
                            style={{
                              left: `${pos.x}%`,
                              top: `${pos.y}%`,
                              width: 10 + events.length * 2,
                              height: 10 + events.length * 2,
                              backgroundColor: `hsl(${typeColor[primaryType]} / 0.6)`,
                              transform: "translate(-50%, -50%)",
                              boxShadow: `0 0 12px hsl(${typeColor[primaryType]} / 0.3)`,
                            }}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.5 + i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                          />
                        );
                      })}
                    </motion.div>

                    {/* Summary stats */}
                    <motion.div
                      className="flex items-center gap-6 mb-6"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7, duration: 0.5 }}
                    >
                      <div className="text-center">
                        <p className="text-[22px] font-serif text-foreground/80">{selectedEvents.length}</p>
                        <p className="text-[10px] text-muted-foreground/40 uppercase tracking-wider">Events</p>
                      </div>
                      <div className="w-px h-8 bg-border/30" />
                      <div className="text-center">
                        <p className="text-[22px] font-serif text-foreground/80">{affectedRegions.size}</p>
                        <p className="text-[10px] text-muted-foreground/40 uppercase tracking-wider">Regions</p>
                      </div>
                      <div className="w-px h-8 bg-border/30" />
                      <div className="text-center">
                        <p className="text-[22px] font-serif text-foreground/80">
                          {selectedEvents.filter((e) => e.type === "treatment").length}
                        </p>
                        <p className="text-[10px] text-muted-foreground/40 uppercase tracking-wider">Treatments</p>
                      </div>
                    </motion.div>

                    {/* Event list preview — colored dots instead of emojis */}
                    <motion.div
                      className="w-full max-w-sm space-y-1.5 max-h-[200px] overflow-y-auto"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.9, duration: 0.5 }}
                    >
                      {selectedEvents.slice(0, 8).map((event, i) => (
                        <motion.div
                          key={event.id}
                          className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-card/50 border border-border/15"
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1 + i * 0.06, duration: 0.4 }}
                        >
                          <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${typeDotClass[event.type]}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-medium text-foreground/70 truncate">{event.title}</p>
                            <p className="text-[10px] text-muted-foreground/35">{customYears[event.id] ?? event.defaultYear}</p>
                          </div>
                        </motion.div>
                      ))}
                      {selectedEvents.length > 8 && (
                        <p className="text-[10px] text-muted-foreground/30 text-center pt-1">
                          + {selectedEvents.length - 8} more
                        </p>
                      )}
                    </motion.div>
                  </>
                ) : (
                  <motion.div
                    className="flex-1 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="text-center space-y-3">
                      <p className="text-[14px] font-serif text-foreground/70">No events mapped yet</p>
                      <p className="text-[12px] text-muted-foreground/40">
                        That's perfectly fine — you can add events anytime from the atlas.
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Actions — hidden on acknowledgement screen */}
        {current.id !== "acknowledgement" && (
        <div className="pt-4 space-y-2.5 max-w-sm mx-auto w-full">
          <div className="flex gap-2.5">
            {step > 0 && (
              <button
                onClick={back}
                className="flex items-center justify-center w-12 py-3.5 rounded-2xl border border-border/30 text-muted-foreground/50 hover:text-muted-foreground/70 transition-colors"
              >
                <Undo2 className="w-4 h-4" />
              </button>
            )}
            <button onClick={next} className="btn-primary flex items-center justify-center gap-2">
              {current.phase === "reveal"
                ? "Explore your atlas"
                : current.phase === "prompt"
                  ? `Continue${selectedIds.size > 0 ? "" : " — skip this"}`
                  : "Continue"}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          {step < totalSteps - 1 && (
            <button onClick={skip} className="btn-ghost text-[12px]">
              Skip — I'll add events myself
            </button>
          )}
        </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
