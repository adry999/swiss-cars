'use client';

import { useEffect } from 'react';

export default function LocaleError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Locale error:', error);
    }, [error]);

    return (
        <div style={{
            minHeight: '60vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 20px',
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
                    fontSize: '24px',
                    fontWeight: 600,
                    marginBottom: '16px',
                    color: '#1a1a1a',
                }}>
                    Page Error
                </h1>
                <p style={{
                    color: '#666',
                    marginBottom: '24px',
                    lineHeight: 1.6,
                }}>
                    We encountered an error loading this page. Please try again.
                </p>
                <button
                    onClick={reset}
                    style={{
                        background: '#d4a853',
                        color: 'white',
                        padding: '12px 24px',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: 600,
                        cursor: 'pointer',
                    }}
                >
                    Try again
                </button>
            </div>
        </div>
    );
}
