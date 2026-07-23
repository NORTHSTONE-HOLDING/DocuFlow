interface LogoProps {
  compact?: boolean;
}

export function Logo({ compact = false }: LogoProps) {
  return (
    <div className={`logo ${compact ? 'logo--compact' : ''}`} aria-label="PaperFlow">
      <svg
        className="logo__icon"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="df-flow" x1="8" y1="28" x2="34" y2="10" gradientUnits="userSpaceOnUse">
            <stop stopColor="#059669" />
            <stop offset="0.55" stopColor="#10B981" />
            <stop offset="1" stopColor="#6EE7B7" />
          </linearGradient>
          <linearGradient id="df-page" x1="10" y1="6" x2="30" y2="34" gradientUnits="userSpaceOnUse">
            <stop stopColor="#134E4A" />
            <stop offset="1" stopColor="#0F172A" />
          </linearGradient>
        </defs>
        <rect x="1" y="1" width="38" height="38" rx="10" fill="#0B1220" stroke="#1E293B" strokeWidth="1.5" />
        <path
          d="M12 8.5h11.5L28 13v16.5a2.5 2.5 0 0 1-2.5 2.5H12A2.5 2.5 0 0 1 9.5 29.5v-18A2.5 2.5 0 0 1 12 8.5z"
          fill="url(#df-page)"
          stroke="#10B981"
          strokeWidth="1.4"
        />
        <path d="M23.5 8.5V13H28" stroke="#34D399" strokeWidth="1.4" strokeLinejoin="round" />
        <path
          d="M13.5 22.5c3.2 4.2 6.4 7.2 10.8 10 4.6-7.2 8.8-11.4 14.2-15.8"
          stroke="url(#df-flow)"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M14 24.5l4.2 4.2 8.8-9.4"
          stroke="#A7F3D0"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.9"
        />
      </svg>
      {!compact && (
        <span className="logo__text">
          Docu<span>Flow</span>
        </span>
      )}
    </div>
  );
}
