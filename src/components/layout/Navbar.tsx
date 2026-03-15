'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navbar.module.css';

const NAV_ITEMS = [
  { href: '/', label: 'The Board' },
  { href: '/explore', label: 'Explore' },
  { href: '/submit', label: 'Submit' },
  { href: '/leaderboards', label: 'Leaderboards' },
];

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navInner}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>⚖</span>
          <span>Tribunal</span>
          <span className={styles.logoSuffix}>.so</span>
        </Link>

        {/* Nav links */}
        <ul className={styles.navLinks}>
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`${styles.navLink} ${isActive(item.href) ? styles.navLinkActive : ''}`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right side — auth */}
        <div className={styles.navRight}>
          <button className={styles.mobileToggle} aria-label="Open menu">
            ☰
          </button>
          <Link href="/auth/login" className={styles.signInButton}>
            Sign In
          </Link>
        </div>
      </div>
    </nav>
  );
}
