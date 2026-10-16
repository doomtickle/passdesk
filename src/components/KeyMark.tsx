/** The Passdesk key: a simple key outline. Decorative; inherits currentColor. */
export function KeyMark({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="10" cy="16" r="5.5" fill="none" stroke="currentColor" strokeWidth="2.25" />
      <path
        d="M15.5 16H28M23.5 16v5M27 16v4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
      />
    </svg>
  );
}
