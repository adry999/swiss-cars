import type { ReactNode } from 'react';
import Link from 'next/link';

interface AdminPageHeaderProps {
    title: string;
    subtitle?: string;
    action?: {
        label: string;
        href: string;
        icon?: ReactNode;
    };
}

export default function AdminPageHeader({ title, subtitle, action }: AdminPageHeaderProps) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{title}</h1>
                {subtitle && <p style={{ color: '#666', fontSize: '14px', margin: '4px 0 0' }}>{subtitle}</p>}
            </div>
            {action && (
                <Link href={action.href} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {action.icon}
                    {action.label}
                </Link>
            )}
        </div>
    );
}
