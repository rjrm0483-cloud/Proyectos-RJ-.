// Decorative illustration: Ometepe's twin volcanoes over Lake Nicaragua at
// sunset. Pure inline SVG so the site stays asset-free and fast.
export function HeroArt() {
  return (
    <svg
      className="hero-art"
      viewBox="0 0 800 520"
      role="img"
      aria-label="Illustration of the Concepción and Maderas volcanoes over Lake Nicaragua at sunset"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffd98a" />
          <stop offset="0.55" stopColor="#f7a15c" />
          <stop offset="1" stopColor="#e86a3a" />
        </linearGradient>
        <linearGradient id="lake" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a97a6" />
          <stop offset="1" stopColor="#14606d" />
        </linearGradient>
        <linearGradient id="far" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6b4c6e" />
          <stop offset="1" stopColor="#4d3a5c" />
        </linearGradient>
        <linearGradient id="near" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3f4f3b" />
          <stop offset="1" stopColor="#24302a" />
        </linearGradient>
      </defs>
      <rect width="800" height="520" fill="url(#sky)" />
      <circle cx="590" cy="215" r="74" fill="#fff1b8" opacity="0.95" />
      <circle cx="590" cy="215" r="110" fill="#ffe08a" opacity="0.25" />
      <g opacity="0.75" fill="#fff4cf">
        <ellipse cx="180" cy="120" rx="110" ry="14" />
        <ellipse cx="330" cy="170" rx="70" ry="9" />
        <ellipse cx="700" cy="110" rx="80" ry="10" />
      </g>
      <path d="M0 360 L120 305 L210 340 L330 250 L470 360 Z" fill="url(#far)" opacity="0.9" />
      <path d="M380 360 L520 240 L560 265 L620 230 L800 360 Z" fill="url(#far)" opacity="0.85" />
      <path d="M40 372 L215 190 L260 215 L300 200 L470 372 Z" fill="url(#near)" />
      <path d="M215 190 L232 202 L247 194 L262 214 L300 200" fill="none" stroke="#fff3c4" strokeWidth="4" strokeLinejoin="round" opacity="0.7" />
      <path d="M470 372 L600 268 L660 300 L790 372 Z" fill="url(#near)" opacity="0.92" />
      <rect y="360" width="800" height="160" fill="url(#lake)" />
      <g stroke="#a8e3e8" strokeWidth="3" strokeLinecap="round" opacity="0.55" fill="none">
        <path d="M60 400 q30 -10 60 0 t60 0" />
        <path d="M420 425 q30 -10 60 0 t60 0 t60 0" />
        <path d="M200 460 q30 -10 60 0 t60 0" />
        <path d="M560 480 q30 -10 60 0 t60 0" />
      </g>
      <g fill="#ffe7a8" opacity="0.6">
        <path d="M545 378 q45 -14 90 0 q-45 10 -90 0z" />
        <path d="M560 398 q30 -10 60 0 q-30 8 -60 0z" />
      </g>
      <g fill="#1d2a1f">
        <path d="M120 520 l6 -110 4 0 6 110z" />
        <path d="M126 412 q-40 -30 -70 -5 q35 -8 70 5z" />
        <path d="M126 412 q40 -34 74 -8 q-38 -6 -74 8z" />
        <path d="M126 412 q-12 -48 20 -70 q-10 38 -20 70z" />
        <path d="M126 412 q-46 -18 -66 -60 q36 22 66 60z" />
        <path d="M126 412 q10 -50 52 -58 q-30 24 -52 58z" />
      </g>
      <g fill="#1d2a1f">
        <path d="M700 520 l5 -80 3 0 5 80z" />
        <path d="M705 442 q-30 -22 -55 -3 q28 -6 55 3z" />
        <path d="M705 442 q30 -26 56 -6 q-28 -4 -56 6z" />
        <path d="M705 442 q-8 -38 18 -54 q-8 30 -18 54z" />
        <path d="M705 442 q-36 -14 -50 -46 q28 18 50 46z" />
      </g>
      <path d="M0 512 q100 -18 200 0 t200 0 t200 0 t200 0 v8 h-800z" fill="#0f4a54" />
    </svg>
  );
}
