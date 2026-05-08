// Eleiko-style circular plate SVG — no branding, standard Olympic colours
const PLATE_COLORS_KG = {
  25: '#C62828', // Red
  20: '#1565C0', // Blue
  15: '#F9A825', // Yellow/Gold
  10: '#2E7D32', // Green
  5:  '#E0E0E0', // White/Light
  2.5:'#6D1F0F', // Dark Red
  1.25:'#90A4AE', // Silver
};
const PLATE_COLORS_LB = {
  45: '#C62828',
  35: '#1565C0',
  25: '#F9A825',
  10: '#2E7D32',
  5:  '#E0E0E0',
  2.5:'#90A4AE',
};

export default function PlateCircle({ weight, unit = 'kg', size = 50 }) {
  const palette = unit === 'lb' ? PLATE_COLORS_LB : PLATE_COLORS_KG;
  const bg = palette[weight] ?? '#607D8B';
  const isLight = bg === '#E0E0E0';
  const textFill = isLight ? '#212121' : '#FFFFFF';
  const cx = size / 2, cy = size / 2;
  const outerR = size / 2 - 1.5;
  const hubR   = outerR * 0.33;
  const holeR  = hubR   * 0.42;
  // Unique gradient ID avoids SVG defs conflicts when many plates are rendered
  const gid = `pc-${weight}-${unit}-${size}`;

  return (
    <svg
      width={size} height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ flexShrink: 0, display: 'block' }}
      aria-label={`${weight}${unit} plate`}
    >
      <defs>
        <radialGradient id={gid} cx="36%" cy="30%" r="68%">
          <stop offset="0%"   stopColor="#D8D8DC" />
          <stop offset="48%"  stopColor="#9A9AA2" />
          <stop offset="100%" stopColor="#585860" />
        </radialGradient>
      </defs>

      {/* Drop shadow */}
      <circle cx={cx + 1} cy={cy + 1.5} r={outerR} fill="rgba(0,0,0,0.3)" />
      {/* Plate body */}
      <circle cx={cx} cy={cy} r={outerR} fill={bg} />
      {/* Outer shine ring */}
      <circle cx={cx} cy={cy} r={outerR - 0.5} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth={1.2} />
      {/* Inner groove (recessed ring near hub) */}
      <circle cx={cx} cy={cy} r={outerR * 0.76} fill="none"
        stroke={isLight ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.22)'} strokeWidth={1.5} />
      {/* Chrome hub */}
      <circle cx={cx} cy={cy} r={hubR} fill={`url(#${gid})`} />
      <circle cx={cx} cy={cy} r={hubR}     fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth={0.8} />
      <circle cx={cx} cy={cy} r={hubR * 0.8} fill="none" stroke="rgba(255,255,255,0.2)"  strokeWidth={0.6} />
      {/* Center hole */}
      <circle cx={cx} cy={cy} r={holeR} fill="#06060e" />
      <circle cx={cx} cy={cy} r={holeR} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={0.5} />

      {/* Weight number — left of hub */}
      <text
        x={size * 0.24} y={cy}
        textAnchor="middle" dominantBaseline="middle"
        fontSize={size * 0.16} fontWeight="900" fill={textFill}
        fontFamily="-apple-system,BlinkMacSystemFont,sans-serif"
      >{weight}</text>

      {/* Weight number — right of hub */}
      <text
        x={size * 0.76} y={cy}
        textAnchor="middle" dominantBaseline="middle"
        fontSize={size * 0.16} fontWeight="900" fill={textFill}
        fontFamily="-apple-system,BlinkMacSystemFont,sans-serif"
      >{weight}</text>
    </svg>
  );
}
