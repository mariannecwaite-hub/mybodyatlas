import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, BookOpen } from "lucide-react";

export interface TreatmentGuideEntry {
  id: string;
  name: string;
  description: string;
  situations: string[];
  practitioner: string;
  approach: string;
  category: string;
}

const treatments: TreatmentGuideEntry[] = [
  {
    id: "physiotherapy",
    name: "Physiotherapy",
    description: "A movement-based approach that uses exercise, manual therapy and education to help restore function and reduce discomfort.",
    situations: [
      "Recovering from injury or surgery",
      "Persistent joint or muscle discomfort",
      "Improving mobility after a period of inactivity",
      "Pelvic floor rehabilitation",
    ],
    practitioner: "Chartered physiotherapist (often via GP referral or self-referral)",
    approach: "Typically involves an assessment followed by a tailored exercise programme. May include hands-on techniques, stretching, and movement education. Sessions are usually 30–60 minutes.",
    category: "Movement & rehabilitation",
  },
  {
    id: "osteopathy",
    name: "Osteopathy",
    description: "A hands-on approach focused on the musculoskeletal system. Osteopaths use manual techniques to improve joint mobility and ease tension.",
    situations: [
      "Back, neck or shoulder tension",
      "Headaches related to posture or tension",
      "General stiffness or restricted movement",
      "Pregnancy-related discomfort",
    ],
    practitioner: "Registered osteopath (self-referral, regulated profession in the UK)",
    approach: "Assessment through observation and touch, followed by gentle joint mobilisation, soft tissue work and sometimes cranial techniques. Sessions are typically 30–45 minutes.",
    category: "Manual therapy",
  },
  {
    id: "fascial-stretch",
    name: "Fascial Stretch Therapy",
    description: "A table-based assisted stretching technique that targets the fascia — the connective tissue surrounding muscles, joints and nerves.",
    situations: [
      "Feeling generally stiff or restricted",
      "Complementing an exercise programme",
      "Recovering from repetitive strain",
      "Improving range of motion",
    ],
    practitioner: "Certified fascial stretch therapist (often found in sports or wellness clinics)",
    approach: "The therapist guides your body through pain-free stretches while you relax on a treatment table. Uses gentle traction and movement patterns. Sessions typically last 30–60 minutes.",
    category: "Movement & flexibility",
  },
  {
    id: "surgery",
    name: "Surgery",
    description: "A medical intervention involving an operation to repair, remove or replace tissue. Usually considered when other approaches haven't resolved the issue.",
    situations: [
      "Structural damage (e.g., torn ligament, fracture)",
      "Conditions requiring removal (e.g., cysts, growths)",
      "Joint replacement for severe degeneration",
      "When conservative approaches have been insufficient",
    ],
    practitioner: "Surgeon (via NHS or private referral, requires specialist consultation)",
    approach: "Involves a consultation, pre-operative assessment, the procedure itself, and a recovery programme. Recovery time varies significantly depending on the type of surgery.",
    category: "Medical intervention",
  },
  {
    id: "massage",
    name: "Massage Therapy",
    description: "Hands-on manipulation of soft tissues to ease muscle tension, improve circulation and support relaxation.",
    situations: [
      "Muscle tightness or tension",
      "Stress-related physical discomfort",
      "Recovery support after exercise",
      "General wellbeing and relaxation",
    ],
    practitioner: "Qualified massage therapist (various specialisations available)",
    approach: "Techniques range from gentle Swedish massage to deeper tissue work. The therapist works on specific areas based on your needs. Sessions are typically 30–90 minutes.",
    category: "Manual therapy",
  },
  {
    id: "pilates",
    name: "Pilates",
    description: "A low-impact exercise method focusing on core strength, flexibility and body awareness. Can be done on a mat or using specialised equipment.",
    situations: [
      "Core and pelvic floor strengthening",
      "Postural improvement",
      "Rehabilitation after injury",
      "Pregnancy and postnatal recovery",
    ],
    practitioner: "Qualified Pilates instructor (look for rehabilitation-focused instructors for specific conditions)",
    approach: "Controlled, precise movements with attention to breathing and alignment. Classes may be group or one-to-one. Reformer Pilates uses spring-loaded equipment for resistance.",
    category: "Movement & exercise",
  },
  {
    id: "acupuncture",
    name: "Acupuncture",
    description: "A practice originating from traditional Chinese medicine involving the insertion of fine needles at specific points on the body.",
    situations: [
      "Chronic pain management",
      "Tension headaches and migraines",
      "Nausea and digestive concerns",
      "Stress and anxiety-related tension",
    ],
    practitioner: "Licensed acupuncturist or physiotherapist with acupuncture training",
    approach: "Fine, sterile needles are inserted at specific points and left for 15–30 minutes. Many people report the sensation as minimal. Often used alongside other treatments.",
    category: "Complementary therapy",
  },
  {
    id: "cbt",
    name: "Cognitive Behavioural Therapy (CBT)",
    description: "A structured talking therapy that helps people understand connections between thoughts, feelings and physical sensations.",
    situations: [
      "Pain that persists beyond expected healing time",
      "Anxiety about physical symptoms",
      "Stress-related physical tension",
      "Building coping strategies for chronic conditions",
    ],
    practitioner: "Clinical psychologist, counsellor or therapist trained in CBT",
    approach: "Structured sessions exploring thought patterns and behaviours. Involves practical techniques and exercises between sessions. Typically 6–20 sessions.",
    category: "Psychological support",
  },
  {
    id: "dermatology",
    name: "Dermatology",
    description: "Medical care focused on skin, hair and nail conditions. Dermatologists diagnose and treat a wide range of skin concerns.",
    situations: [
      "Persistent skin changes or rashes",
      "Conditions like eczema, psoriasis or acne",
      "New or changing moles",
      "Hair loss or nail changes",
    ],
    practitioner: "Consultant dermatologist (via GP referral or private consultation)",
    approach: "Assessment through visual examination, sometimes with skin tests or biopsy. Treatment may involve topical preparations, oral medication, light therapy or monitoring.",
    category: "Medical specialist",
  },
];

interface TreatmentGuideProps {
  open: boolean;
  onClose: () => void;
  initialTreatmentId?: string | null;
}

const TreatmentGuide = ({ open, onClose, initialTreatmentId }: TreatmentGuideProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(initialTreatmentId || null);
  const selected = treatments.find((t) => t.id === selectedId);

  const handleClose = () => {
    setSelectedId(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="modal-overlay" onClick={handleClose} />
          <motion.div
            className="modal-content max-w-md"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
          >
            <div className="modal-header">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-sage-foreground/50" />
                <h2 className="text-xl">{selected ? selected.name : "Treatment Guide"}</h2>
              </div>
              <button onClick={handleClose} className="modal-close">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <AnimatePresence mode="wait">
              {!selected ? (
                <motion.div
                  key="list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="text-[13px] text-muted-foreground/55 mb-5 leading-relaxed">
                    Plain-language descriptions of common care approaches. Neutral and educational — not a recommendation.
                  </p>

                  {/* Group by category */}
                  {[...new Set(treatments.map((t) => t.category))].map((category) => (
                    <div key={category} className="mb-4">
                      <p className="section-label mb-2">{category}</p>
                      <div className="space-y-1.5">
                        {treatments
                          .filter((t) => t.category === category)
                          .map((t) => (
                            <button
                              key={t.id}
                              onClick={() => setSelectedId(t.id)}
                              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-secondary/40 border border-border/15 hover:bg-secondary/60 transition-all duration-200 text-left group"
                            >
                              <div>
                                <p className="text-[13px] font-medium text-foreground/75 group-hover:text-foreground/90 transition-colors">
                                  {t.name}
                                </p>
                                <p className="text-[11px] text-muted-foreground/40 mt-0.5 line-clamp-1">
                                  {t.description.slice(0, 70)}…
                                </p>
                              </div>
                              <ChevronRight className="w-4 h-4 text-muted-foreground/25 group-hover:text-muted-foreground/45 flex-shrink-0 ml-2 transition-colors" />
                            </button>
                          ))}
                      </div>
                    </div>
                  ))}

                  <p className="text-[10px] text-muted-foreground/30 text-center mt-4 leading-relaxed">
                    For treatment literacy, not medical advice. Always consult a qualified practitioner.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="detail"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-5"
                >
                  <button
                    onClick={() => setSelectedId(null)}
                    className="flex items-center gap-1 text-[12px] text-muted-foreground/45 hover:text-muted-foreground/65 transition-colors mb-2"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> All treatments
                  </button>

                  <div className="inline-block px-2.5 py-1 rounded-full bg-sage/15 text-[10px] text-sage-foreground/60 font-medium">
                    {selected.category}
                  </div>

                  {/* Description */}
                  <div>
                    <p className="text-[13px] text-foreground/70 leading-relaxed">{selected.description}</p>
                  </div>

                  {/* Common situations */}
                  <div>
                    <p className="section-label mb-2">Common situations</p>
                    <div className="space-y-1.5">
                      {selected.situations.map((s, i) => (
                        <div key={i} className="flex items-start gap-2.5 py-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-sage/50 mt-1.5 flex-shrink-0" />
                          <p className="text-[12px] text-muted-foreground/55 leading-relaxed">{s}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Practitioner */}
                  <div className="rounded-2xl p-4 bg-secondary/40 border border-border/15">
                    <p className="section-label mb-1.5">Practitioner</p>
                    <p className="text-[12px] text-foreground/65 leading-relaxed">{selected.practitioner}</p>
                  </div>

                  {/* Approach */}
                  <div className="rounded-2xl p-4 bg-warm/10 border border-warm/15">
                    <p className="section-label mb-1.5 text-warm-foreground/60">Approach</p>
                    <p className="text-[12px] text-foreground/65 leading-relaxed">{selected.approach}</p>
                  </div>

                  {/* Disclaimer */}
                  <div className="rounded-xl p-3.5 bg-lavender/8 border border-lavender/12">
                    <p className="text-[11px] text-muted-foreground/40 leading-relaxed italic">
                      This is a general overview for understanding purposes. Individual experiences vary.
                      Always discuss treatment options with a qualified healthcare professional.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export { treatments as treatmentGuideData };
export default TreatmentGuide;
