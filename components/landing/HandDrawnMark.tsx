export function HandDrawnCheck({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={`-rotate-2 ${className}`}
    >
      <path
        d="M3.2 12.8 C4.6 14 6 15.4 7.2 16.7 C7.9 17.4 8.5 18.2 9.1 18.6 C9.7 17.3 10.5 16 11.3 14.7 C13.6 11.1 16.2 7.5 19.1 4.3 C19.6 3.8 20.2 3.4 20.7 3.2"
        stroke="currentColor"
        strokeWidth="3.6"
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
        d="M3.3 4.8 C6.8 8.9 9.4 12 11.4 14.5 C13.8 17.5 16.4 19.8 19.3 21.4"
        stroke="currentColor"
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20.6 4.1 C17.4 7.6 14.6 10.3 12.6 12.6 C10.3 15.3 8 17.2 5.8 18.6"
        stroke="currentColor"
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

