import { ReactNode, SVGProps } from "react";

export const BODY_SILHOUETTE_VIEWBOX = "0 0 200 480";

interface BodySilhouetteFigureProps extends SVGProps<SVGSVGElement> {
  children?: ReactNode;
  extraDefs?: ReactNode;
}

export const BodySilhouetteFigure = ({ children, extraDefs, ...props }: BodySilhouetteFigureProps) => {
  return (
    <svg viewBox={BODY_SILHOUETTE_VIEWBOX} xmlns="http://www.w3.org/2000/svg" width="100%" {...props}>
      <defs>
        <linearGradient id="bodyGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="hsl(var(--body-fill))" />
          <stop offset="50%" stopColor="hsl(var(--body-fill) / 0.96)" />
          <stop offset="100%" stopColor="hsl(var(--body-fill))" />
        </linearGradient>
        {extraDefs}
      </defs>

      <ellipse cx="100" cy="38" rx="28" ry="34" fill="url(#bodyGrad)" stroke="hsl(var(--body-stroke))" strokeWidth="1" />

      <path
        d="M88 68 Q100 74 112 68 L114 86 Q100 92 86 86 Z"
        fill="url(#bodyGrad)"
        stroke="none"
      />

      <path
        d="M60 88 Q42 92 36 108 Q28 130 30 160 Q32 185 38 200 Q44 215 50 224 L68 224 Q72 210 74 195 L74 160 L126 160 L126 195 Q128 210 132 224 L150 224 Q156 215 162 200 Q168 185 170 160 Q172 130 164 108 Q158 92 140 88 Q120 82 100 81 Q80 82 60 88 Z"
        fill="url(#bodyGrad)"
        stroke="hsl(var(--body-stroke))"
        strokeWidth="0.8"
      />

      <path
        d="M60 90 Q44 96 36 116 Q28 138 26 165 Q24 185 28 200 Q32 212 40 214 Q48 214 52 202 Q56 188 56 168 Q58 148 62 130 L68 108 Z"
        fill="url(#bodyGrad)"
        stroke="hsl(var(--body-stroke))"
        strokeWidth="0.8"
      />

      <ellipse cx="36" cy="218" rx="10" ry="14" fill="url(#bodyGrad)" stroke="hsl(var(--body-stroke))" strokeWidth="0.8" />

      <path
        d="M140 90 Q156 96 164 116 Q172 138 174 165 Q176 185 172 200 Q168 212 160 214 Q152 214 148 202 Q144 188 144 168 Q142 148 138 130 L132 108 Z"
        fill="url(#bodyGrad)"
        stroke="hsl(var(--body-stroke))"
        strokeWidth="0.8"
      />

      <ellipse cx="164" cy="218" rx="10" ry="14" fill="url(#bodyGrad)" stroke="hsl(var(--body-stroke))" strokeWidth="0.8" />

      <path
        d="M50 222 Q48 238 50 252 Q52 262 60 266 L140 266 Q148 262 150 252 Q152 238 150 222 L68 224 L132 224 Z"
        fill="url(#bodyGrad)"
        stroke="hsl(var(--body-stroke))"
        strokeWidth="0.8"
      />

      <path
        d="M60 264 Q52 280 50 310 Q48 340 50 375 Q52 400 54 420 Q56 440 60 455 Q66 466 76 466 Q86 466 90 455 Q94 440 94 420 Q96 395 94 365 Q92 335 90 305 L88 268 Z"
        fill="url(#bodyGrad)"
        stroke="hsl(var(--body-stroke))"
        strokeWidth="0.8"
      />

      <path
        d="M60 458 Q54 462 50 468 Q48 474 56 476 Q70 478 82 474 Q90 470 90 464 L76 462 Z"
        fill="url(#bodyGrad)"
        stroke="hsl(var(--body-stroke))"
        strokeWidth="0.8"
      />

      <path
        d="M140 264 Q148 280 150 310 Q152 340 150 375 Q148 400 146 420 Q144 440 140 455 Q134 466 124 466 Q114 466 110 455 Q106 440 106 420 Q108 395 106 365 Q108 335 110 305 L112 268 Z"
        fill="url(#bodyGrad)"
        stroke="hsl(var(--body-stroke))"
        strokeWidth="0.8"
      />

      <path
        d="M140 458 Q146 462 150 468 Q152 474 144 476 Q130 478 118 474 Q110 470 110 464 L124 462 Z"
        fill="url(#bodyGrad)"
        stroke="hsl(var(--body-stroke))"
        strokeWidth="0.8"
      />

      {children}
    </svg>
  );
};
