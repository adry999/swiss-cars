'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Car,
    Users,
    MessageSquare,
    LayoutDashboard,
    Settings,
    LogOut,
    Image as ImageIcon,
    Inbox,
    Mail,
    Languages,
    X,
} from 'lucide-react';
import Image from 'next/image';
import { signOut } from '@/lib/actions/auth';
import styles from './AdminSidebar.module.css';

const MENU_ITEMS = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/inventory', label: 'Cars', icon: Car },
    { href: '/admin/leads', label: 'Leads', icon: Inbox },
    { href: '/admin/subscribers', label: 'Subscribers', icon: Mail },
    { href: '/admin/reviews', label: 'Reviews', icon: MessageSquare },
    { href: '/admin/partners', label: 'Partners', icon: Users },
    { href: '/admin/homepage', label: 'Homepage', icon: ImageIcon },
    { href: '/admin/translations', label: 'Translations', icon: Languages },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
];

interface AdminSidebarProps {
    userEmail?: string;
    isOpen?: boolean;
    onClose?: () => void;
    logoUrl?: string;
}

export default function AdminSidebar({ userEmail, isOpen, onClose, logoUrl }: AdminSidebarProps) {
    const pathname = usePathname();

    const handleLogout = async () => {
        await signOut();
    };

    return (
        <aside className={`${styles.sidebar} ${isOpen ? styles.mobileOpen : ''}`}>
            <div className={styles.logo}>
                {logoUrl ? (
                    <div className={styles.logoImageWrapper}>
                        <Image
                            src={logoUrl}
                            alt="SwissCars Logo"
                            fill
                            style={{ objectFit: 'contain' }}
                            sizes="120px"
                        />
                    </div>
                ) : (
                    <div>
                        <span className={styles.brand}>Swiss</span>
                        <span className={styles.brandBold}>Cars</span>
                    </div>
                )}
                {onClose && (
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Close menu">
                        <X size={24} />
                    </button>
                )}
            </div>

            <nav className={styles.nav}>
                {MENU_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className={styles.footer}>
                {userEmail && (
                    <div className={styles.userEmail}>{userEmail}</div>
                )}
                <button className={styles.logoutBtn} onClick={handleLogout}>
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}
