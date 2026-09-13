'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from '../actions';
import { AdminCredentialsSchema, type AdminCredentials } from '../auth.schema';
import styles from './LoginForm.module.css';

const INVALID_CREDENTIALS_MESSAGE = 'Invalid email or password';

export default function LoginForm() {
    const router = useRouter();
    const [serverError, setServerError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<AdminCredentials>({
        resolver: zodResolver(AdminCredentialsSchema),
    });

    const submitCredentials = async (credentials: AdminCredentials) => {
        setIsLoading(true);
        setServerError(null);

        const result = await signIn(credentials);

        if (result.status === 'rejected') {
            setServerError(INVALID_CREDENTIALS_MESSAGE);
            setIsLoading(false);
            return;
        }

        router.push('/admin');
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.logo}>
                    <span className={styles.brand}>Swiss</span>
                    <span className={styles.brandBold}>Cars</span>
                </div>
                <h1 className={styles.title}>Admin Login</h1>

                <form onSubmit={handleSubmit(submitCredentials)} className={styles.form}>
                    <div className={styles.field}>
                        <label htmlFor="email" className={styles.label}>
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            {...register('email')}
                            className={styles.input}
                            placeholder="admin@swisscars.md"
                            disabled={isLoading}
                        />
                        {errors.email && (
                            <span className={styles.error}>{errors.email.message}</span>
                        )}
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="password" className={styles.label}>
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            {...register('password')}
                            className={styles.input}
                            placeholder="Enter your password"
                            disabled={isLoading}
                        />
                        {errors.password && (
                            <span className={styles.error}>{errors.password.message}</span>
                        )}
                    </div>

                    {serverError && (
                        <div className={styles.serverError}>{serverError}</div>
                    )}

                    <button
                        type="submit"
                        className={styles.button}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
}
