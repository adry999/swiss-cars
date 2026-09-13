import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    label?: string;
}

const sizeMap = { sm: 16, md: 24, lg: 32 };

export default function LoadingSpinner({ size = 'md', label }: LoadingSpinnerProps) {
    const px = sizeMap[size];
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666' }}>
            <Loader2 size={px} style={{ animation: 'spin 1s linear infinite' }} />
            {label && <span style={{ fontSize: size === 'sm' ? '12px' : '14px' }}>{label}</span>}
        </div>
    );
}
