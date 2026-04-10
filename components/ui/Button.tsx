'use client';

import styles from '@/styles/ui.module.css';

type Variant = 'primary' | 'secondary' | 'danger';

const variantMap: Record<Variant, string> = {
  primary: styles.btnPrimary,
  secondary: styles.btnSecondary,
  danger: styles.btnDanger,
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: React.ReactNode;
}

export default function Button({ variant = 'primary', children, className, ...props }: ButtonProps) {
  return (
    <button
      className={`${styles.btn} ${variantMap[variant]} ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
}
