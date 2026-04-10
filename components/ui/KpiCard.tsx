import styles from '@/styles/ui.module.css';

type KpiColor = 'blue' | 'green' | 'amber' | 'purple';

interface KpiCardProps {
  label: string;
  value: string | number;
  delta: string;
  deltaDirection: 'up' | 'down';
  color: KpiColor;
  icon: React.ReactNode;
}

export default function KpiCard({ label, value, delta, deltaDirection, color, icon }: KpiCardProps) {
  return (
    <div className={`${styles.kpiCard} ${styles[color]}`}>
      <div className={styles.kpiLabel}>{label}</div>
      <div className={styles.kpiValue}>{value}</div>
      <div className={`${styles.kpiDelta} ${styles[deltaDirection]}`}>{delta}</div>
      <div className={`${styles.kpiIcon} ${styles[color]}`}>{icon}</div>
    </div>
  );
}
