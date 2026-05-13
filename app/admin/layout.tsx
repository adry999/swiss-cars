import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import AdminLayoutClient from '@/components/admin/AdminLayoutClient';
import { getSettings } from '@/lib/actions/settings';
import { getUser } from '@/lib/actions/auth';
import { ToastProvider } from '@/components/ui/Toast';
import '@/app/globals.css';

export default async function AdminLayout({ children }: { children: ReactNode }) {
    const [user, siteConfig] = await Promise.all([
        getUser(),
        getSettings('site_config')
    ]);

    if (!user) {
        redirect('/login');
    }

    const logoUrl = (siteConfig as any)?.logo_url;

    return (
        <html lang="ro" suppressHydrationWarning>
            <body suppressHydrationWarning>
                <ToastProvider>
                    <AdminLayoutClient userEmail={user.email} logoUrl={logoUrl}>
                        {children}
                    </AdminLayoutClient>
                </ToastProvider>
            </body>
        </html>
    );
}
