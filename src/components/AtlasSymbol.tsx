/**
 * The Collective symbol — three organic dots in sage green.
 * Used at 16px inline, 24px in card headers, 32px on consent screen.
 */
const AtlasSymbol = ({ size = 16, className = "" }: { size?: number; className?: string }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle cx="10" cy="18" r="5" fill="hsl(var(--sage))" opacity="0.85" />
      <circle cx="22" cy="14" r="4" fill="hsl(var(--sage))" opacity="0.65" />
      <circle cx="17" cy="24" r="3" fill="hsl(var(--sage))" opacity="0.5" />
    </svg>
  );
};

export default AtlasSymbol;
