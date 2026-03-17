/**
 * Body literacy paragraphs, reflective questions, and orientation text
 * for the "So What" layer after Aha insights.
 *
 * All copy is observational, general, and non-diagnostic.
 */

export interface BodyLiteracyEntry {
  understanding: string;
  questions: string[];
  orientation: string;
}

type PatternCategory = "biomechanical" | "stress_body" | "recurring" | "care_gap";

// ── Region-pair body literacy (Understanding section) ──

const REGION_PAIR_LITERACY: Record<string, string> = {
  "lower_back+hip_left": "The lower back and hips are closely connected — they share muscle groups, load-bearing responsibilities, and movement patterns. When one area experiences strain or change, the other often adapts over time. This is a recognised pattern in how bodies respond to physical load and change.",
  "lower_back+hip_right": "The lower back and hips are closely connected — they share muscle groups, load-bearing responsibilities, and movement patterns. When one area experiences strain or change, the other often adapts over time. This is a recognised pattern in how bodies respond to physical load and change.",
  "lower_back+ankle_foot_left": "The lower back and ankles are connected through the chain of load-bearing joints. When something changes at the base — how you walk, how your foot meets the ground — it can quietly influence how your back responds over months or years. Bodies often compensate in ways we don't notice at the time.",
  "lower_back+ankle_foot_right": "The lower back and ankles are connected through the chain of load-bearing joints. When something changes at the base — how you walk, how your foot meets the ground — it can quietly influence how your back responds over months or years. Bodies often compensate in ways we don't notice at the time.",
  "neck+shoulder_left": "The neck and shoulders share a complex network of muscles and nerves. Tension, posture changes, or strain in one area often shows up in the other — sometimes immediately, sometimes over longer periods. Many people notice these two areas respond together.",
  "neck+shoulder_right": "The neck and shoulders share a complex network of muscles and nerves. Tension, posture changes, or strain in one area often shows up in the other — sometimes immediately, sometimes over longer periods. Many people notice these two areas respond together.",
  "neck+head_jaw": "The neck and head are deeply interconnected — jaw tension, headaches, and neck stiffness often travel together. Muscles in the jaw and upper neck share pathways that can amplify each other, especially during periods of stress or sustained posture. This is one of the body's most common clustering patterns.",
  "shoulder_left+wrist_hand_left": "The shoulder and wrist are connected through the arm's nerve and muscle pathways. Changes in how you use your shoulder — especially after strain or injury — can gradually shift how load travels down to your wrist and hand. These patterns sometimes take years to become noticeable.",
  "shoulder_right+wrist_hand_right": "The shoulder and wrist are connected through the arm's nerve and muscle pathways. Changes in how you use your shoulder — especially after strain or injury — can gradually shift how load travels down to your wrist and hand. These patterns sometimes take years to become noticeable.",
  "hip_left+knee_left": "The hip and knee work together as part of your body's primary weight-bearing chain. When one joint adapts — through injury, stiffness, or change in movement — the other often compensates. This is one of the most common connected patterns in the lower body.",
  "hip_right+knee_right": "The hip and knee work together as part of your body's primary weight-bearing chain. When one joint adapts — through injury, stiffness, or change in movement — the other often compensates. This is one of the most common connected patterns in the lower body.",
  "knee_left+ankle_foot_left": "The knee and ankle share the work of absorbing impact and guiding movement. A change in one — even a small shift in how you walk — can gradually influence the other. Many people find these areas speak up in sequence rather than at the same time.",
  "knee_right+ankle_foot_right": "The knee and ankle share the work of absorbing impact and guiding movement. A change in one — even a small shift in how you walk — can gradually influence the other. Many people find these areas speak up in sequence rather than at the same time.",
};

const STRESS_BODY_LITERACY =
  "Research increasingly recognises that the body and nervous system respond to life stress in physical ways — muscle tension, pain sensitivity, fatigue, and changes in how areas heal or recover. These responses are real and valid. Many people notice their body speaks up more during harder periods, and quiets during calmer ones.";

const RECURRING_REGION_LITERACY =
  "When the same area of the body appears in your record across multiple years, it may reflect an ongoing pattern of use, compensation, or sensitivity. Bodies develop habits — some protective, some simply the result of how we move, work, and live. Understanding a long-running pattern as a whole can sometimes be more useful than addressing each episode separately.";

const CARE_GAP_LITERACY =
  "When an area of the body has been present in your experience over time but hasn't yet been explored with a practitioner, it can be worth considering. Not every pattern needs treatment — but some benefit from being understood in context, especially when they've been quietly present for a while.";

const FALLBACK_LITERACY =
  "Connected regions of the body often influence each other over time — especially when one area has experienced repeated change or load. Patterns that appear across multiple areas and years are often worth understanding as a whole rather than in isolation.";

// ── Reflective questions by pattern category ──

const QUESTIONS: Record<PatternCategory, string[]> = {
  biomechanical: [
    "Has your movement or posture changed since this first appeared?",
    "Do the two areas tend to speak up at the same times, or separately?",
    "Has anything in how you move day-to-day shifted during this period?",
  ],
  stress_body: [
    "Do you notice your body responding differently during harder periods?",
    "Has this area settled during calmer times, or stayed present regardless?",
    "What does this area feel like right now, compared to when it first appeared?",
  ],
  recurring: [
    "Has the character of this changed over the years, or does it feel the same each time?",
    "Is there a time of year or a life pattern that seems to bring this back?",
    "What have you tried for this area, and what has felt most helpful?",
  ],
  care_gap: [
    "Have you ever explored this area with a practitioner, or has it mostly been self-managed?",
    "Is this something you've learned to live with, or something that still asks for your attention?",
    "If you could ask a practitioner one question about this area, what would it be?",
  ],
};

// ── Orientation text by pattern category ──

const ORIENTATION: Record<PatternCategory, string> = {
  biomechanical:
    "Practitioners who work with the relationship between connected joints and movement patterns include physiotherapists, osteopaths, and movement specialists. Any of these could be a useful starting point for exploring this further — with whoever you choose and whenever feels right.",
  stress_body:
    "Practitioners who work with the connection between stress, the nervous system, and physical experience include psychotherapists, somatic therapists, and some osteopaths and physiotherapists. This is a growing area of understanding — you don't need to have a diagnosis to explore it.",
  recurring:
    "For a pattern that has been present across several years, practitioners who take a whole-history approach — such as osteopaths, physiotherapists with a chronic pain interest, or integrative health practitioners — may offer a useful perspective. Bringing your body map with you could help the conversation.",
  care_gap:
    "If this area has been present for a while without being explored, a good starting point could be a physiotherapist, osteopath, or your GP. Sometimes simply naming the full pattern to a practitioner — rather than describing the most recent episode — can open a more useful conversation.",
};

// ── Lookup helpers ──

function normalizeRegionPairKey(a: string, b: string): string {
  return [a, b].sort().join("+");
}

export function getRegionPairLiteracy(regionA: string, regionB: string): string {
  const key = normalizeRegionPairKey(regionA, regionB);
  return REGION_PAIR_LITERACY[key] || FALLBACK_LITERACY;
}

export type AhaPatternType = "biomechanical" | "stress_body" | "recurring" | "care_gap";

export function getBodyLiteracy(
  patternType: AhaPatternType,
  regionA?: string,
  regionB?: string
): BodyLiteracyEntry {
  let understanding: string;

  switch (patternType) {
    case "biomechanical":
      understanding = regionA && regionB
        ? getRegionPairLiteracy(regionA, regionB)
        : FALLBACK_LITERACY;
      break;
    case "stress_body":
      understanding = STRESS_BODY_LITERACY;
      break;
    case "recurring":
      understanding = RECURRING_REGION_LITERACY;
      break;
    case "care_gap":
      understanding = CARE_GAP_LITERACY;
      break;
    default:
      understanding = FALLBACK_LITERACY;
  }

  return {
    understanding,
    questions: QUESTIONS[patternType] || QUESTIONS.biomechanical,
    orientation: ORIENTATION[patternType] || ORIENTATION.biomechanical,
  };
}
