import styles from '@/styles/ui.module.css';

interface BarItem {
  label: string;
  value: number;
  color: string;
}

interface BarChartProps {
  data: BarItem[];
  maxValue?: number;
}

export default function BarChart({ data, maxValue }: BarChartProps) {
  const max = maxValue || Math.max(...data.map((d) => d.value));

  return (
    <div className={styles.barChart}>
      {data.map((item) => (
        <div key={item.label} className={styles.barRow}>
          <div className={styles.barLabel}>{item.label}</div>
          <div className={styles.barTrack}>
            <div
              className={styles.barFill}
              style={{
                width: `${(item.value / max) * 100}%`,
                background: item.color,
              }}
            />
          </div>
          <div className={styles.barVal} style={{ color: item.color }}>
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
}
