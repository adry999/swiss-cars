import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import AdminLayoutClient from '@/components/admin/AdminLayoutClient';
import { getPublicSiteConfig } from '@/lib/settings';
import { getUser } from '@/lib/actions/auth';
import { ToastProvider } from '@/components/ui/Toast';
import '@/app/globals.css';

export default async function AdminLayout({ children }: { children: ReactNode }) {
    const [user, siteConfig] = await Promise.all([
        getUser(),
        getPublicSiteConfig()
    ]);

    // getUser() only proves the visitor is signed in, not that they're an
    // admin. Every mutation already checks app_metadata.role via
    // requireAuth(), but this layout previously didn't — any authenticated
    // Supabase account (a leftover test user, anyone if signup is ever
    // enabled) could view the full admin UI: leads with names/phones/emails,
    // subscriber emails, dashboard stats. They just couldn't save changes.
    const role = (user?.app_metadata as { role?: string } | undefined)?.role;
    if (!user || role !== 'admin') {
        redirect('/login');
    }

    const logoUrl = siteConfig.logo_url;

    // No <html>/<body> here — app/layout.tsx owns the only one in the tree.
    return (
        <ToastProvider>
            <AdminLayoutClient userEmail={user.email} logoUrl={logoUrl}>
                {children}
            </AdminLayoutClient>
        </ToastProvider>
    );
}
