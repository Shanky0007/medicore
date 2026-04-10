'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import styles from '@/styles/layout.module.css';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/patients': 'Patients',
  '/appointments': 'Appointments',
  '/records': 'Medical Records',
  '/lab': 'Laboratory',
  '/imaging': 'Imaging',
  '/pharmacy': 'Pharmacy',
  '/billing': 'Billing & Cash',
  '/reports': 'Reporting & Stats',
  '/settings': 'Settings',
};

const publicRoutes = ['/', '/login', '/signup'];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Hide layout on public pages
  if (publicRoutes.includes(pathname)) {
    return <>{children}</>;
  }

  // Match the base path for dynamic routes like /patients/[id]
  const basePath = '/' + (pathname.split('/')[1] || '');
  const title = pageTitles[basePath] || 'MediCore';

  return (
    <>
      <Sidebar />
      <main className={styles.main}>
        <Topbar title={title} />
        <div className={styles.content}>{children}</div>
      </main>
    </>
  );
}
