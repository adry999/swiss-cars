'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useOptionalToast } from '@/components/ui/Toast';
import { subscribe } from '@/lib/actions/subscribers';
import styles from './Footer.module.css';

export default function Footer({ settings = {} }: { settings?: any }) {
    const t = useTranslations('footer');
    const year = new Date().getFullYear();
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const phone = settings.phone;
    const whatsapp = settings.whatsapp;
    const emailAddress = settings.email;
    const address = settings.address;

    // Toast might not be available if Footer is outside ToastProvider
    const toast = useOptionalToast();

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        setIsSubmitting(true);
        const result = await subscribe(email);
        setIsSubmitting(false);

        if (result.success) {
            setEmail('');
            if (toast) {
                toast.success(t('subscribe_success'));
            }
        } else {
            if (toast) {
                toast.error(result.error || 'Subscription failed');
            }
        }
    };

    return (
        <footer className={styles.footer}>
            <div className={`container ${styles.inner}`}>
                <div className={styles.col}>
                    <div className={styles.brand}>
                        <Image
                            src="/media/general/swiss-logo-2-red.png"
                            alt="SwissCars"
                            width={130}
                            height={44}
                        />
                    </div>
                    <p className={styles.slogan}>{t('slogan')}</p>
                    <p className={styles.description}>{t('description')}</p>

                    <div className={styles.contacts}>
                        <div className={styles.contactGroup}>
                            <p className={styles.contactTitle}>{t('main_office')}</p>
                            {address ? (
                                <p style={{ whiteSpace: 'pre-line' }}>{address}</p>
                            ) : (
                                <p style={{ color: '#dc2626' }}>⚠️ Adresa lipsește</p>
                            )}
                            {emailAddress ? <p><a href={`mailto:${emailAddress}`}>{emailAddress}</a></p> : <p style={{ color: '#dc2626' }}>⚠️ Email lipsește</p>}
                            {phone ? <p><a href={`tel:${phone}`}>{phone}</a></p> : <p style={{ color: '#dc2626' }}>⚠️ Telefon lipsește</p>}
                            {settings.footer_phones && settings.footer_phones.split(',').map((p: string, idx: number) => (
                                <p key={idx}><a href={`tel:${p.trim()}`}>{p.trim()}</a></p>
                            ))}
                        </div>
                        <div className={styles.contactGroup}>
                            <p className={styles.contactTitle}>{t('contact_title')}</p>
                            {whatsapp ? (
                                <p>
                                    <a href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className={styles.whatsapp}>
                                        WhatsApp: {whatsapp}
                                    </a>
                                </p>
                            ) : (
                                <p style={{ color: '#dc2626' }}>⚠️ WhatsApp lipsește</p>
                            )}
                            {settings.facebook && (
                                <p>
                                    <a href={settings.facebook} target="_blank" rel="noopener noreferrer">
                                        Facebook
                                    </a>
                                </p>
                            )}
                            {settings.instagram && (
                                <p>
                                    <a href={settings.instagram} target="_blank" rel="noopener noreferrer">
                                        Instagram
                                    </a>
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className={styles.col}>
                    <h3 className={styles.colTitle}>{t('about_title')}</h3>
                    <div className={styles.divider} />
                    <ul className={styles.links}>
                        <li><Link href="/">{t('nav_home')}</Link></li>
                        <li><Link href="/about">{t('nav_about')}</Link></li>
                        <li><Link href="/services">{t('nav_services')}</Link></li>
                        <li><Link href="/contact">{t('nav_contact')}</Link></li>
                    </ul>
                </div>

                <div className={styles.col}>
                    <h3 className={styles.colTitle}>{t('promotions_title')}</h3>
                    <div className={styles.divider} />
                    <ul className={styles.links}>
                        <li><Link href="/inventory">{t('nav_inventory')}</Link></li>
                        <li><Link href="/leasing">{t('nav_leasing')}</Link></li>
                        <li><Link href="/#offers">{t('nav_offers')}</Link></li>
                    </ul>
                </div>

                <div className={styles.col}>
                    <h3 className={styles.colTitle}>{t('subscribe_title')}</h3>
                    <div className={styles.divider} />
                    <p className={styles.subscribeText}>{t('subscribe_text')}</p>
                    <form className={styles.subscribeForm} onSubmit={handleSubscribe}>
                        <input
                            type="email"
                            placeholder={t('subscribe_placeholder')}
                            className={styles.input}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? '...' : t('subscribe_btn')}
                        </button>
                    </form>
                </div>
            </div>

            <div className={styles.copyright}>
                <div className="container">
                    {t('copyright', { year })}
                </div>
            </div>
        </footer>
    );
}
