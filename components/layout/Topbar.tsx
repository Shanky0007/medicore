'use client';

import { Bell, Settings, Search } from 'lucide-react';
import styles from '@/styles/topbar.module.css';

interface TopbarProps {
  title: string;
}

export default function Topbar({ title }: TopbarProps) {
  return (
    <header className={styles.topbar}>
      <span className={styles.topbarTitle}>{title}</span>

      <div className={styles.searchWrap}>
        <div className={styles.searchIcon}>
          <Search size={14} />
        </div>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Search patient, record..."
        />
      </div>

      <div className={styles.topbarBtns}>
        <div className={`${styles.iconBtn} ${styles.notifDot}`}>
          <Bell size={16} />
        </div>
        <div className={styles.iconBtn}>
          <Settings size={16} />
        </div>
      </div>
    </header>
  );
}
