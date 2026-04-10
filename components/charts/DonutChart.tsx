import styles from '@/styles/ui.module.css';

interface DonutItem {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutItem[];
  centerLabel?: string;
}

export default function DonutChart({ data, centerLabel }: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const circumference = 2 * Math.PI * 35; // radius = 35

  // Build stroke segments
  let offset = 0;
  const segments = data.map((item) => {
    const length = (item.value / total) * circumference;
    const segment = {
      color: item.color,
      dasharray: `${length} ${circumference - length}`,
      dashoffset: -offset,
    };
    offset += length;
    return segment;
  });

  return (
    <div className={styles.donutWrap}>
      <svg width="90" height="90" viewBox="0 0 90 90">
        <circle
          cx="45"
          cy="45"
          r="35"
          fill="none"
          stroke="var(--bg3)"
          strokeWidth="14"
        />
        {segments.map((seg, i) => (
          <circle
            key={i}
            cx="45"
            cy="45"
            r="35"
            fill="none"
            stroke={seg.color}
            strokeWidth="14"
            strokeDasharray={seg.dasharray}
            strokeDashoffset={seg.dashoffset}
            transform="rotate(-90 45 45)"
          />
        ))}
        {centerLabel && (
          <text
            x="45"
            y="49"
            textAnchor="middle"
            fontSize="13"
            fontWeight="600"
            fill="var(--text)"
            fontFamily="var(--font)"
          >
            {centerLabel}
          </text>
        )}
      </svg>

      <div className={styles.donutLegend}>
        {data.map((item) => (
          <div key={item.label} className={styles.legendItem}>
            <div className={styles.legendDot} style={{ background: item.color }} />
            <div className={styles.legendName}>{item.label}</div>
            <div className={styles.legendVal}>{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
