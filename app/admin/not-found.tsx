import Link from 'next/link';

export default function AdminNotFound() {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            padding: '40px',
        }}>
            <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '48px',
                textAlign: 'center',
                maxWidth: '400px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            }}>
                <div style={{
                    fontSize: '64px',
                    fontWeight: 800,
                    color: '#d4a853',
                    lineHeight: 1,
                    marginBottom: '12px',
                }}>
                    404
                </div>
                <h1 style={{
                    fontSize: '20px',
                    fontWeight: 700,
                    marginBottom: '12px',
                    color: '#1a1a1a',
                }}>
                    Page Not Found
                </h1>
                <p style={{
                    color: '#666',
                    marginBottom: '24px',
                    fontSize: '14px',
                    lineHeight: 1.6,
                }}>
                    This admin page does not exist.
                </p>
                <Link
                    href="/admin"
                    style={{
                        display: 'inline-block',
                        background: '#d4a853',
                        color: 'white',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 600,
                        textDecoration: 'none',
                    }}
                >
                    Back to Dashboard
                </Link>
            </div>
        </div>
    );
}
