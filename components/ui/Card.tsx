'use client';

import styles from '@/styles/ui.module.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function Card({ children, className, style }: CardProps) {
  return (
    <div className={`${styles.card} ${className || ''}`} style={style}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  action?: string;
  onAction?: () => void;
  right?: React.ReactNode;
}

export function CardHeader({ title, action, onAction, right }: CardHeaderProps) {
  return (
    <div className={styles.cardHeader}>
      <div className={styles.cardTitle}>{title}</div>
      {action && (
        <div className={styles.cardAction} onClick={onAction}>
          {action}
        </div>
      )}
      {right}
    </div>
  );
}
