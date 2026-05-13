'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import Image from 'next/image';
import MobileMenu from './MobileMenu';
import FavoritesIcon from './FavoritesIcon';
import styles from './Header.module.css';

export default function Header({ logoUrl, logoHeight = 50, phone }: { logoUrl?: string; logoHeight?: number; phone?: string }) {
    const clampedLogoHeight = Math.min(logoHeight, 400);
    const t = useTranslations('nav');
    const locale = useLocale();
    const pathname = usePathname();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isHidden, setIsHidden] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    useEffect(() => {
        let lastY = window.scrollY;
        const handleScroll = () => {
            const currentY = window.scrollY;
            setIsScrolled(currentY > 80);
            setIsHidden(currentY > 120 && currentY > lastY);
            lastY = currentY;
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { href: '/', label: t('home') },
        { href: '/inventory', label: t('inventory') },
        { href: '/about', label: t('about') },
        { href: '/services', label: t('services') },
        { href: '/leasing', label: 'Leasing' },
        { href: '/contact', label: t('contact') },
    ];

    const isHome = pathname === '/';

    return (
        <>
            <MobileMenu
                isOpen={isMobileOpen}
                onClose={() => setIsMobileOpen(false)}
                navLinks={navLinks}
                locale={locale}
                pathname={pathname}
                phone={phone}
            />

            <header className={`${styles.header} ${isScrolled || !isHome ? styles.scrolled : ''} ${isHidden ? styles.hidden : ''}`}>
                <div className={`container ${styles.inner}`}>
                    {/* Logo */}
                    <Link href="/" className={styles.logo}>
                        <Image
                            src={logoUrl && logoUrl.length > 0 ? logoUrl : '/media/general/swiss-logo-2-red.png'}
                            alt="SwissCars Logo"
                            width={500}
                            height={150}
                            priority
                            className={styles.logoImg}
                            style={{ height: clampedLogoHeight, width: 'auto', objectFit: 'contain' }}
                        />
                    </Link>

                    {/* Desktop Nav */}
                    <nav className={styles.nav}>
                        <ul className={styles.navList}>
                            {navLinks.map((link) => (
                                <li key={link.href}>
                                    <a
                                        href={link.href}
                                        className={`${styles.navLink} ${pathname === link.href ? styles.navActive : ''}`}
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Right side: Language switcher + favorites + mobile toggle */}
                    <div className={styles.right}>
                        <FavoritesIcon />
                        <div className={styles.langSwitcher}>
                            {locale !== 'ro' && (
                                <Link href={pathname} locale="ro" className={styles.langBtn} title="Română">
                                    <Image src="/media/general/romanian-flag.png" alt="RO" width={22} height={16} />
                                </Link>
                            )}
                            {locale !== 'ru' && (
                                <Link href={pathname} locale="ru" className={styles.langBtn} title="Русский">
                                    <Image src="/media/general/russian.png" alt="RU" width={22} height={16} />
                                </Link>
                            )}
                            {locale !== 'en' && (
                                <Link href={pathname} locale="en" className={styles.langBtn} title="English">
                                    <Image src="/media/general/uk.png" alt="EN" width={22} height={16} />
                                </Link>
                            )}
                        </div>

                        {/* Mobile hamburger */}
                        <button
                            className={`${styles.hamburger} ${isMobileOpen ? styles.hamburgerOpen : ''}`}
                            onClick={() => setIsMobileOpen(true)}
                            aria-label="Open menu"
                        >
                            <span />
                            <span />
                            <span />
                        </button>
                    </div>
                </div>
            </header>
        </>
    );
}
