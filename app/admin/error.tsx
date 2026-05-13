'use client';

import { useEffect } from 'react';

export default function AdminError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Admin error:', error);
    }, [error]);

    return (
        <div style={{
            padding: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
        }}>
            <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '40px',
                textAlign: 'center',
                maxWidth: '500px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            }}>
                <h1 style={{
                    fontSize: '20px',
                    fontWeight: 600,
                    marginBottom: '16px',
                    color: '#1a1a1a',
                }}>
                    Eroare Admin
                </h1>
                <p style={{
                    color: '#666',
                    marginBottom: '24px',
                    lineHeight: 1.6,
                    fontSize: '14px',
                }}>
                    A apărut o eroare în panoul de administrare. Te rugăm să încerci din nou sau să contactezi suportul.
                </p>
                <button
                    onClick={reset}
                    style={{
                        background: '#d4a853',
                        color: 'white',
                        padding: '12px 24px',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer',
                    }}
                >
                    Încearcă din nou
                </button>
            </div>
        </div>
    );
}
