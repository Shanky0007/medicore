import Link from 'next/link';
import styles from '@/styles/ui.module.css';

interface ModuleCardProps {
  href: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  name: string;
  description: string;
  count: string;
}

export default function ModuleCard({
  href,
  icon,
  iconBg,
  iconColor,
  name,
  description,
  count,
}: ModuleCardProps) {
  return (
    <Link href={href} className={styles.moduleCard}>
      <div className={styles.moduleIcon} style={{ background: iconBg, color: iconColor }}>
        {icon}
      </div>
      <div className={styles.moduleName}>{name}</div>
      <div className={styles.moduleDesc}>{description}</div>
      <div className={styles.moduleCount}>{count}</div>
    </Link>
  );
}
