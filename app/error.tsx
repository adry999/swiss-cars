'use client';

import { useEffect } from 'react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Global error:', error);
    }, [error]);

    return (
        <html>
            <body>
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f5f5f5',
                    padding: '20px',
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
                            Something went wrong
                        </h1>
                        <p style={{
                            color: '#666',
                            marginBottom: '24px',
                            lineHeight: 1.6,
                        }}>
                            An unexpected error occurred. Please try again.
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
            </body>
        </html>
    );
}
