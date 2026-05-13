import Link from 'next/link';

export default function NotFound() {
    return (
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
                borderRadius: '16px',
                padding: '60px 40px',
                textAlign: 'center',
                maxWidth: '500px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            }}>
                <div style={{
                    fontSize: '80px',
                    fontWeight: 800,
                    color: '#d4a853',
                    lineHeight: 1,
                    marginBottom: '16px',
                }}>
                    404
                </div>
                <h1 style={{
                    fontSize: '24px',
                    fontWeight: 700,
                    marginBottom: '12px',
                    color: '#1a1a1a',
                }}>
                    Page Not Found
                </h1>
                <p style={{
                    color: '#666',
                    marginBottom: '32px',
                    lineHeight: 1.6,
                }}>
                    The page you are looking for does not exist or has been moved.
                </p>
                <Link
                    href="/"
                    style={{
                        display: 'inline-block',
                        background: '#d4a853',
                        color: 'white',
                        padding: '14px 32px',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: 600,
                        textDecoration: 'none',
                    }}
                >
                    Go Home
                </Link>
            </div>
        </div>
    );
}
