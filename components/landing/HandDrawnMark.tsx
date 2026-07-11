export function HandDrawnCheck({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={`-rotate-2 ${className}`}
    >
      <path
        d="M3.4 12.6 C4.7 13.7 6 15 7.1 16.3 C7.8 17.1 8.4 17.9 9 18.4 C9.6 17.2 10.3 16 11.1 14.8 C13.3 11.4 15.8 8 18.5 4.9 C19 4.4 19.6 3.9 20.2 3.7"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HandDrawnCross({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={`rotate-1 ${className}`}
    >
      <path
        d="M4.1 4.5 C7.6 8 10.5 10.9 12.9 13.5 C15.3 16.1 17.4 18.3 19.5 20.3"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19.8 4.2 C16.9 7.1 14.4 9.9 12.1 12.6 C9.4 15.7 6.9 18 4.3 20.1"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
