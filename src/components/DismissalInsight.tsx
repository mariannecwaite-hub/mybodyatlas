import { motion } from "framer-motion";
import { BodyEvent } from "@/context/AppContext";

interface DismissalInsightProps {
  dismissalEvent: BodyEvent;
  followingEvents: BodyEvent[];
  onIncludeInPassport?: () => void;
}

/**
 * Insight card for "Time lost to being unheard" — when a medical dismissal
 * event exists in the record.
 */
const DismissalInsight = ({ dismissalEvent, followingEvents, onIncludeInPassport }: DismissalInsightProps) => {
  const dismissalYear = new Date(dismissalEvent.date).getFullYear();
  const now = new Date().getFullYear();
  const timeDiff = now - dismissalYear;
  const timeWord = timeDiff <= 1 ? "months" : "years";

  const followingText = followingEvents.length > 0
    ? `${followingEvents.length} experience${followingEvents.length > 1 ? "s" : ""} in your record appeared in the ${timeWord} that followed. Whether or not they are connected, they are all part of your body story.`
    : null;

  return (
    <motion.div
      className="rounded-2xl p-5 border bg-warm/12 border-warm/18"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <p
        className="text-[18px] leading-[1.5] mb-3"
        style={{ color: "#2A2A28", fontFamily: "'DM Serif Display', serif" }}
      >
        Time lost to being unheard
      </p>
      <p
        className="text-[15px] leading-[1.75] mb-2"
        style={{ color: "#6B6960", fontFamily: "'DM Sans', sans-serif" }}
      >
        Your record includes a period when your experiences weren't taken seriously. For many women, this adds months or years to the time between first noticing something and receiving support. The experiences you logged after this time are part of that story.
      </p>

      {followingText && (
        <p
          className="text-[14px] leading-[1.75] mt-3 italic"
          style={{ color: "#6B6960", fontFamily: "'DM Sans', sans-serif" }}
        >
          {followingText}
        </p>
      )}

      {onIncludeInPassport && (
        <button
          onClick={onIncludeInPassport}
          className="mt-4 text-[13px] transition-colors duration-200 hover:opacity-80"
          style={{ color: "#A8A59E", fontFamily: "'DM Sans', sans-serif" }}
        >
          Include this context in my Body Passport →
        </button>
      )}
    </motion.div>
  );
};

export default DismissalInsight;
