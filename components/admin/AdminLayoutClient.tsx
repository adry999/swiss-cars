'use client';

import { ReactNode, useState, useEffect } from 'react';
import { Menu, ExternalLink } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import AdminSidebar from '@/components/admin/AdminSidebar';
import styles from '@/app/admin/layout.module.css';

import Image from 'next/image';

interface AdminLayoutClientProps {
    children: ReactNode;
    userEmail?: string;
    logoUrl?: string;
}

export default function AdminLayoutClient({ children, userEmail, logoUrl }: AdminLayoutClientProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const pathname = usePathname();

    // Close sidebar on route change on mobile
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname]);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className={styles.layout}>
            {/* Overlay for mobile */}
            {isSidebarOpen && (
                <div
                    className={styles.mobileOverlay}
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <AdminSidebar
                userEmail={userEmail}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                logoUrl={logoUrl}
            />

            <main className={styles.main}>
                <header className={styles.header}>
                    <div className={styles.headerLeft}>
                        <button
                            className={styles.menuButton}
                            onClick={toggleSidebar}
                            aria-label="Toggle menu"
                        >
                            <Menu size={24} />
                        </button>
                        <div className={styles.headerTitle}>SwissCars Admin</div>
                    </div>
                    <div className={styles.userInfo}>
                        <Link href="/" target="_blank" className={styles.viewWebsiteBtn}>
                            <span className={styles.viewWebsiteText}>View Website</span>
                            <span className={styles.viewWebsiteMobile}>Site</span>
                            <ExternalLink size={14} />
                        </Link>
                    </div>
                </header>
                <div className={styles.content}>
                    {children}
                </div>
            </main>
        </div>
    );
}
