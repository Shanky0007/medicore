import StatusBadge from './StatusBadge';
import styles from '@/styles/ui.module.css';

const avatarColors: Record<string, { bg: string; color: string }> = {
  blue: { bg: 'rgba(59,130,246,0.15)', color: 'var(--accent)' },
  red: { bg: 'rgba(239,68,68,0.15)', color: 'var(--red)' },
  green: { bg: 'rgba(16,185,129,0.15)', color: 'var(--green)' },
  purple: { bg: 'rgba(139,92,246,0.15)', color: 'var(--purple)' },
  amber: { bg: 'rgba(245,158,11,0.15)', color: 'var(--amber)' },
};

interface PatientRowProps {
  initials: string;
  name: string;
  info: string;
  time: string;
  status: string;
  statusLabel?: string;
  avatarColor?: keyof typeof avatarColors;
}

export default function PatientRow({
  initials,
  name,
  info,
  time,
  status,
  statusLabel,
  avatarColor = 'blue',
}: PatientRowProps) {
  const colors = avatarColors[avatarColor] || avatarColors.blue;

  return (
    <div className={styles.patientRow}>
      <div
        className={styles.patientAvatar}
        style={{ background: colors.bg, color: colors.color }}
      >
        {initials}
      </div>
      <div>
        <div className={styles.patientName}>{name}</div>
        <div className={styles.patientInfo}>{info}</div>
      </div>
      <div className={styles.patientMeta}>
        <div className={styles.patientTime}>{time}</div>
        <StatusBadge status={status} label={statusLabel} />
      </div>
    </div>
  );
}
