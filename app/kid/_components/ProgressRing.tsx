'use client';

export default function ProgressRing({
  value,
  max = 5000,
  size = 140,
  stroke = 10,
}: {
  value: number;
  max?: number;
  size?: number;
  stroke?: number;
}) {
  const clamped = Math.max(0, Math.min(value, max));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference * (1 - clamped / max);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="rgba(255,255,255,0.15)"
        strokeWidth={stroke}
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="url(#grad)"
        strokeLinecap="round"
        strokeWidth={stroke}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={progress}
        style={{ transition: 'stroke-dashoffset 300ms ease' }}
      />
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="16"
        fill="white"
        style={{ fontWeight: 700 }}
      >
        {clamped.toLocaleString()} / {max.toLocaleString()}
      </text>
    </svg>
  );
}
