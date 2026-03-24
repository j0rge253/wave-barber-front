export default function WaveLogo({ size = 56, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none"
      xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="60" cy="60" r="56" stroke="#c1692a" strokeWidth="3" fill="none"/>
      {/* Água */}
      <path d="M8 72 C22 56,38 50,52 60 C64 68,76 74,92 62 C100 56,108 52,112 56 L112 92 Q60 104 8 92Z"
        fill="#2d7d7d" opacity="0.9"/>
      <path d="M8 80 C24 68,40 64,56 72 C68 78,80 82,96 72 C104 66,110 64,112 68 L112 96 Q60 108 8 96Z"
        fill="#4aa8a8" opacity="0.55"/>
      {/* Poste */}
      <rect x="75" y="26" width="9" height="44" rx="2" fill="#f0ece4"/>
      <path d="M75 30 L84 36 L84 42 L75 36Z" fill="#c1692a"/>
      <path d="M75 44 L84 50 L84 56 L75 50Z" fill="#c1692a"/>
      <path d="M75 58 L84 64 L84 68 L75 64Z" fill="#c1692a"/>
      <ellipse cx="79.5" cy="26" rx="5.5" ry="3" fill="#c1692a"/>
      <rect x="77" y="20" width="5" height="6" rx="1" fill="#2d7d7d"/>
      <ellipse cx="79.5" cy="70" rx="5.5" ry="2.5" fill="#c1692a"/>
      {/* Onda decorativa */}
      <path d="M16 46 C24 40,34 38,44 44 C52 49,60 53,70 47"
        stroke="#4aa8a8" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.65"/>
    </svg>
  )
}
