'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import styles from './MobileMenu.module.css';

type NavLink = { href: string; label: string };

type Props = {
    isOpen: boolean;
    onClose: () => void;
    navLinks: NavLink[];
    locale: string;
    pathname: string;
    phone?: string;
};

export default function MobileMenu({ isOpen, onClose, navLinks, locale, pathname, phone }: Props) {
    // Lock body scroll when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    return (
        <>
            {/* Overlay */}
            <div
                className={`${styles.overlay} ${isOpen ? styles.overlayOpen : ''}`}
                onClick={onClose}
            />

            {/* Slide-in panel */}
            <div className={`${styles.panel} ${isOpen ? styles.panelOpen : ''}`}>
                <div className={styles.panelHeader}>
                    <Image
                        src="/media/general/swiss-logo-2-red.png"
                        alt="SwissCars"
                        width={130}
                        height={44}
                    />
                    <button onClick={onClose} className={styles.closeBtn} aria-label="Close menu">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                <nav>
                    <ul className={styles.navList}>
                        {navLinks.map((link) => (
                            <li key={link.href}>
                                <a href={link.href} className={styles.navLink} onClick={onClose}>
                                    {link.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className={styles.langSection}>
                    <span className={styles.langLabel}>Language</span>
                    <div className={styles.langButtons}>
                        {locale !== 'ro' && (
                            <Link href={pathname} locale="ro" className={styles.langBtn}>
                                <Image src="/media/general/romanian-flag.png" alt="RO" width={24} height={18} />
                                <span>Română</span>
                            </Link>
                        )}
                        {locale !== 'ru' && (
                            <Link href={pathname} locale="ru" className={styles.langBtn}>
                                <Image src="/media/general/russian.png" alt="RU" width={24} height={18} />
                                <span>Русский</span>
                            </Link>
                        )}
                        {locale !== 'en' && (
                            <Link href={pathname} locale="en" className={styles.langBtn}>
                                <Image src="/media/general/uk.png" alt="EN" width={24} height={18} />
                                <span>English</span>
                            </Link>
                        )}
                    </div>
                </div>

                {phone && (
                    <div className={styles.phone}>
                        <a href={`tel:${phone.replace(/\s/g, '')}`} className={styles.phoneLink}>
                            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                                <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
                            </svg>
                            {phone}
                        </a>
                    </div>
                )}
            </div>
        </>
    );
}
