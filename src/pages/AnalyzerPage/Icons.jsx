const Ic = ({ children, size = 32, color = "#22d3ee", glow = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    style={glow ? { filter: `drop-shadow(0 0 6px ${color}55)` } : {}}>
    {children}
  </svg>
);

export const Icons = {
  timer: (sz = 32, c = "#22d3ee") => <Ic size={sz} color={c} glow>
    <circle cx="12" cy="13" r="8" stroke={c} strokeWidth="1.6" opacity="0.2"/>
    <circle cx="12" cy="13" r="8" stroke={c} strokeWidth="1.8" strokeDasharray="14 50" strokeLinecap="round"/>
    <path d="M12 9.5v3.5l2.5 2" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 2.5h4" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M12 2.5V4" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
  </Ic>,
  hexagon: (sz = 32, c = "#22d3ee") => <Ic size={sz} color={c} glow>
    <path d="M12 2L20 7v10l-8 5-8-5V7l8-5z" stroke={c} strokeWidth="1.4" fill={c+"0c"}/>
    <circle cx="12" cy="9.5" r="1.2" fill={c}/>
    <circle cx="8.5" cy="13" r="1" fill={c} opacity="0.65"/>
    <circle cx="15.5" cy="13" r="1" fill={c} opacity="0.65"/>
    <path d="M12 9.5l-3.5 3.5M12 9.5l3.5 3.5" stroke={c} strokeWidth="0.7" opacity="0.4"/>
    <text x="12" y="18.5" textAnchor="middle" fill={c} fontSize="5.5" fontWeight="800" fontFamily="monospace" opacity="0.7">6</text>
  </Ic>,
  shield: (sz = 32, c = "#22d3ee") => <Ic size={sz} color={c} glow>
    <path d="M12 2.5L3.5 6.5v5c0 5.25 3.63 10.15 8.5 11.5 4.87-1.35 8.5-6.25 8.5-11.5v-5L12 2.5z" stroke={c} strokeWidth="1.5" fill={c+"08"}/>
    <path d="M9 12.5l2 2 4-4.5" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Ic>,
  report: (sz = 32, c = "#22d3ee") => <Ic size={sz} color={c} glow>
    <rect x="4.5" y="2.5" width="15" height="19" rx="2.5" stroke={c} strokeWidth="1.5" fill={c+"08"}/>
    <path d="M8 7h8M8 10.5h4.5" stroke={c} strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>
    <rect x="8" y="13.5" width="2.5" height="4.5" rx="0.6" fill={c} opacity="0.55"/>
    <rect x="12" y="11.5" width="2.5" height="6.5" rx="0.6" fill={c} opacity="0.75"/>
  </Ic>,
  male: (sz = 40, c = "#22d3ee") => <Ic size={sz} color={c}>
    <circle cx="10" cy="8.5" r="3.8" stroke={c} strokeWidth="1.6" fill={c+"10"}/>
    <path d="M15.5 4h4v4" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M19.5 4L14 9.5" stroke={c} strokeWidth="1.6" strokeLinecap="round"/>
    <path d="M10 13v4.5M7 21l3-3.5 3 3.5" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 15h8" stroke={c} strokeWidth="1.6" strokeLinecap="round"/>
  </Ic>,
  female: (sz = 40, c = "#22d3ee") => <Ic size={sz} color={c}>
    <circle cx="12" cy="8" r="4.5" stroke={c} strokeWidth="1.6" fill={c+"10"}/>
    <path d="M12 13v5.5" stroke={c} strokeWidth="1.6" strokeLinecap="round"/>
    <path d="M9 16h6" stroke={c} strokeWidth="1.6" strokeLinecap="round"/>
  </Ic>,
  bodyScan: (sz = 48, c = "#22d3ee") => <Ic size={sz} color={c} glow>
    <circle cx="12" cy="5.5" r="2.5" stroke={c} strokeWidth="1.3" fill={c+"12"}/>
    <path d="M12 8.5v4.5M9 20l3-7 3 7" stroke={c} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 12h10" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
    <rect x="2.5" y="2.5" width="19" height="19" rx="2" stroke={c} strokeWidth="1" strokeDasharray="2 2.5" opacity="0.25"/>
    <path d="M2.5 5V2.5H5M19 2.5h2.5V5M2.5 19v2.5H5M19 21.5h2.5V19" stroke={c} strokeWidth="1.4" strokeLinecap="round" opacity="0.5"/>
  </Ic>,
  athletic: (sz = 48, c = "#10b981") => <Ic size={sz} color={c} glow>
    <circle cx="12" cy="5" r="2.5" stroke={c} strokeWidth="1.4" fill={c+"15"}/>
    <path d="M12 8v4M9 20l3-8 3 8" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 10.5l3.5 1.5h2M19 10.5l-3.5 1.5h-2" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4 9l1 1.5M20 9l-1 1.5" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
  </Ic>,
  fit: (sz = 48, c = "#22d3ee") => <Ic size={sz} color={c} glow>
    <circle cx="12" cy="5" r="2.5" stroke={c} strokeWidth="1.4" fill={c+"15"}/>
    <path d="M12 8v5M9 20l3-7 3 7" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 11h10" stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
    <circle cx="12" cy="12" r="7.5" stroke={c} strokeWidth="0.7" strokeDasharray="2 2.5" opacity="0.2"/>
    <path d="M8.5 2l3.5 1 3.5-1" stroke={c} strokeWidth="0.8" strokeLinecap="round" opacity="0.4"/>
  </Ic>,
  average: (sz = 48, c = "#f59e0b") => <Ic size={sz} color={c} glow>
    <circle cx="12" cy="5" r="2.5" stroke={c} strokeWidth="1.4" fill={c+"15"}/>
    <path d="M12 8v5M9.5 20l2.5-7 2.5 7" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 11h10" stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
    <path d="M17 3h3v3M4 3h3" stroke={c} strokeWidth="1" strokeLinecap="round" opacity="0.35"/>
  </Ic>,
  warnTriangle: (sz = 48, c = "#ef4444") => <Ic size={sz} color={c} glow>
    <path d="M12 3L2.5 20.5h19L12 3z" stroke={c} strokeWidth="1.5" fill={c+"10"} strokeLinejoin="round"/>
    <path d="M12 9.5v4.5" stroke={c} strokeWidth="2" strokeLinecap="round"/>
    <circle cx="12" cy="17" r="1.1" fill={c}/>
  </Ic>,
  excess: (sz = 48, c = "#ef4444") => <Ic size={sz} color={c} glow>
    <circle cx="12" cy="5" r="2.5" stroke={c} strokeWidth="1.4" fill={c+"15"}/>
    <ellipse cx="12" cy="13" rx="5" ry="3.5" stroke={c} strokeWidth="1.4" fill={c+"0c"}/>
    <path d="M9.5 19.5l2.5-3 2.5 3" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 10.5h10" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
  </Ic>,
  calendar: (sz = 18, c = "#10b981") => <Ic size={sz} color={c}>
    <rect x="3" y="4" width="18" height="17" rx="2.5" stroke={c} strokeWidth="1.5" fill={c+"0c"}/>
    <path d="M3 9h18" stroke={c} strokeWidth="1.3"/>
    <path d="M8 2v3.5M16 2v3.5" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="12" cy="14" r="1.5" fill={c}/>
  </Ic>,
  check: (s = 20, c = "#10b981") => <Ic size={s} color={c}>
    <circle cx="12" cy="12" r="9" stroke={c} strokeWidth="1.5" fill={c+"10"}/>
    <path d="M8 12.5l2.5 2.5L15 10" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Ic>,
  alert: (s = 20, c = "#f59e0b") => <Ic size={s} color={c}>
    <circle cx="12" cy="12" r="9" stroke={c} strokeWidth="1.5" fill={c+"10"}/>
    <path d="M12 8v4" stroke={c} strokeWidth="2" strokeLinecap="round"/>
    <circle cx="12" cy="15.5" r="1" fill={c}/>
  </Ic>,
  danger: (s = 20, c = "#ef4444") => <Ic size={s} color={c}>
    <circle cx="12" cy="12" r="9" stroke={c} strokeWidth="1.5" fill={c+"10"}/>
    <path d="M14.5 9.5l-5 5M9.5 9.5l5 5" stroke={c} strokeWidth="2" strokeLinecap="round"/>
  </Ic>,
};

export function getBodyTypeIcon(type) {
  if (type === "Атлетическое") return Icons.athletic;
  if (type === "Подтянутое") return Icons.fit;
  if (type === "Среднее") return Icons.average;
  if (type === "Экстремально низкий жир") return Icons.warnTriangle;
  return Icons.excess;
}
