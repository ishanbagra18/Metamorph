import React from 'react';

/**
 * Precision geometric vector mark for Metamorph.
 * Replaces generic butterfly emojis with an architectural code transformation glyph.
 */
export function BrandLogo({ size = 20, className = '', color = 'currentColor' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
    >
      {/* Precision architectural geometric glyph */}
      <path
        d="M12 2L3 7V17L12 22L21 17V7L12 2Z"
        stroke={color}
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M12 22V12"
        stroke={color}
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M12 12L21 7"
        stroke={color}
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M12 12L3 7"
        stroke={color}
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2" fill={color} />
    </svg>
  );
}

