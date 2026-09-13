import { AlertCircle } from 'lucide-react';

interface FormErrorMessageProps {
    message?: string;
}

export default function FormErrorMessage({ message }: FormErrorMessageProps) {
    if (!message) return null;
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 16px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            color: '#dc2626',
            fontSize: '14px',
            marginBottom: '16px',
        }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{message}</span>
        </div>
    );
}
