import type { ReactNode } from 'react';

interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    description?: string;
}

export default function EmptyState({ icon, title, description }: EmptyStateProps) {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px 24px',
            color: '#9ca3af',
            textAlign: 'center',
        }}>
            {icon && <div style={{ marginBottom: '16px', opacity: 0.5 }}>{icon}</div>}
            <p style={{ fontWeight: '600', fontSize: '16px', color: '#6b7280', margin: '0 0 6px' }}>{title}</p>
            {description && <p style={{ fontSize: '14px', margin: 0 }}>{description}</p>}
        </div>
    );
}
