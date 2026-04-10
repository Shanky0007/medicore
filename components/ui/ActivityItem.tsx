import styles from '@/styles/ui.module.css';

interface ActivityItemProps {
  color: string;
  text: React.ReactNode;
  time: string;
}

export default function ActivityItem({ color, text, time }: ActivityItemProps) {
  return (
    <div className={styles.activityItem}>
      <div className={styles.activityDot} style={{ background: color }} />
      <div>
        <div className={styles.activityText}>{text}</div>
        <div className={styles.activityTime}>{time}</div>
      </div>
    </div>
  );
}
