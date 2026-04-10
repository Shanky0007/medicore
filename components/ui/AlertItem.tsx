import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import styles from '@/styles/ui.module.css';

type AlertType = 'error' | 'warning' | 'info';

const icons: Record<AlertType, React.ReactNode> = {
  error: <AlertCircle size={16} />,
  warning: <AlertTriangle size={16} />,
  info: <Info size={16} />,
};

interface AlertItemProps {
  type: AlertType;
  title: string;
  message: string;
}

export default function AlertItem({ type, title, message }: AlertItemProps) {
  return (
    <div className={`${styles.alert} ${styles[type]}`}>
      <div className={styles.alertIcon}>{icons[type]}</div>
      <div className={styles.alertText}>
        <strong className={styles.alertTitle}>{title}</strong>
        {message}
      </div>
    </div>
  );
}
