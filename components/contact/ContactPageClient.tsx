'use client';

import { useState } from 'react';
import { Phone, MapPin, Clock, Mail, Send, CheckCircle, Loader2, User, PhoneCall, CalendarCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import styles from './ContactPageClient.module.css';

type FormType = 'contact' | 'testdrive';

type Props = {
    phoneNumber?: string;
    whatsapp?: string;
    emailAddress?: string;
    address?: string;
    workingHours?: string;
    workingDaysClosed?: string;
    googleMapsEmbed?: string;
};

export default function ContactPageClient({
    phoneNumber,
    whatsapp,
    emailAddress,
    address,
    workingHours,
    workingDaysClosed,
    googleMapsEmbed,
}: Props) {
    const t = useTranslations('contact_page');
    const tError = useTranslations('errors');
    const [formType, setFormType] = useState<FormType>('contact');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [preferredDate, setPreferredDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !phone.trim()) {
            setError(tError('required_fields'));
            return;
        }
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, phone, email, message, preferredDate, formType, sourceUrl: typeof window !== 'undefined' ? window.location.href : undefined }),
            });
            const data = await res.json();

            if (res.ok) {
                setSuccess(true);
            } else {
                setError(data.error || tError('submit_error'));
            }
        } catch (err) {
            console.error('Submission error:', err);
            setError(tError('submit_error'));
        }
        setLoading(false);
    };

    return (
        <main className={styles.main}>
            <div className="container">
                <div className={styles.topSection}>
                    <h1 className="ui-title">{t('title')}</h1>
                    <div className="ui-decor" style={{ marginTop: '15px' }} />
                    <p className={styles.intro}>{t('intro')}</p>
                </div>

                {/* Info Cards */}
                <div className={styles.infoCards}>
                    <div className={styles.infoCard}>
                        <div className={styles.iconWrap}><MapPin size={26} color="var(--color-primary)" /></div>
                        <h3>{t('location')}</h3>
                        <p style={{ whiteSpace: 'pre-line' }}>{address || <span style={{ color: '#dc2626' }}>⚠️ Adresa lipsește din setări</span>}</p>
                    </div>
                    <div className={styles.infoCard}>
                        <div className={styles.iconWrap}><Phone size={26} color="var(--color-primary)" /></div>
                        <h3>{t('phone')}</h3>
                        {phoneNumber ? (
                            <>
                                <p><a href={`tel:${phoneNumber.replace(/\s/g, '')}`}>{phoneNumber}</a></p>
                                <small>WhatsApp · Viber · Telegram</small>
                            </>
                        ) : (
                            <p style={{ color: '#dc2626' }}>⚠️ Telefon lipsește din setări</p>
                        )}
                    </div>
                    <div className={styles.infoCard}>
                        <div className={styles.iconWrap}><Mail size={26} color="var(--color-primary)" /></div>
                        <h3>{t('email')}</h3>
                        {emailAddress ? (
                            <p><a href={`mailto:${emailAddress}`}>{emailAddress}</a></p>
                        ) : (
                            <p style={{ color: '#dc2626' }}>⚠️ Email lipsește din setări</p>
                        )}
                    </div>
                    <div className={styles.infoCard}>
                        <div className={styles.iconWrap}><Clock size={26} color="var(--color-primary)" /></div>
                        <h3>{t('schedule')}</h3>
                        <p>{workingHours || t('schedule_hours', { defaultValue: '09:00 - 18:00' })}</p>
                        <p style={{ marginTop: '5px', fontSize: '13px' }}>{workingDaysClosed || t('schedule_days', { defaultValue: 'Luni — Sâmbătă' })}</p>
                    </div>
                </div>

                <div className={styles.mainGrid}>
                    {/* Contact Form */}
                    <div className={styles.formCard}>
                        <div className={styles.formTabs}>
                            <button
                                className={`${styles.tab} ${formType === 'contact' ? styles.tabActive : ''}`}
                                onClick={() => setFormType('contact')}
                            >
                                <Mail size={16} /> {t('tab_message')}
                            </button>
                            <button
                                className={`${styles.tab} ${formType === 'testdrive' ? styles.tabActive : ''}`}
                                onClick={() => setFormType('testdrive')}
                            >
                                <CalendarCheck size={16} /> {t('tab_testdrive')}
                            </button>
                        </div>

                        {success ? (
                            <div className={styles.success}>
                                <CheckCircle size={50} color="var(--color-primary)" />
                                <h3>{t('success_title')}</h3>
                                <p>{t('success_text')}</p>
                                <button className="btn btn-primary" onClick={() => { setSuccess(false); setName(''); setPhone(''); setEmail(''); setMessage(''); setPreferredDate(''); }}>
                                    {t('send_another')}
                                </button>
                            </div>
                        ) : (
                            <form className={styles.form} onSubmit={handleSubmit}>
                                {formType === 'testdrive' && (
                                    <div className={styles.alertInfo}>
                                        <CalendarCheck size={18} />
                                        {t('testdrive_info')}
                                    </div>
                                )}

                                <div className={styles.row}>
                                    <div className={styles.inputGroup}>
                                        <User size={16} className={styles.inputIcon} />
                                        <input type="text" placeholder={t('name_placeholder')} value={name} onChange={e => setName(e.target.value)} className={styles.input} required />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <PhoneCall size={16} className={styles.inputIcon} />
                                        <input type="tel" placeholder={t('phone_placeholder')} value={phone} onChange={e => setPhone(e.target.value)} className={styles.input} required />
                                    </div>
                                </div>

                                <div className={styles.inputGroup}>
                                    <Mail size={16} className={styles.inputIcon} />
                                    <input type="email" placeholder={t('email_placeholder')} value={email} onChange={e => setEmail(e.target.value)} className={styles.input} />
                                </div>

                                {formType === 'testdrive' && (
                                    <div className={styles.inputGroup}>
                                        <CalendarCheck size={16} className={styles.inputIcon} />
                                        <input type="date" value={preferredDate} onChange={e => setPreferredDate(e.target.value)} className={styles.input} min={new Date().toISOString().split('T')[0]} />
                                    </div>
                                )}

                                <textarea
                                    placeholder={formType === 'testdrive' ? t('testdrive_message_placeholder') : t('message_placeholder')}
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    className={styles.textarea}
                                    rows={4}
                                />

                                {error && <p className={styles.err}>{error}</p>}

                                <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={loading}>
                                    {loading ? <><Loader2 size={18} className={styles.spin} /> {t('submit_sending')}</> : <><Send size={18} /> {formType === 'testdrive' ? t('submit_testdrive') : t('submit_message')}</>}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* WhatsApp Quick Contact */}
                    <div className={styles.sidePanel}>
                        <div className={styles.waCard}>
                            <div className={styles.waIcon}>💬</div>
                            <h3>{t('quick_contact')}</h3>
                            <p>{t('quick_contact_text')}</p>
                            {whatsapp ? (
                                <a
                                    href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}?text=Buna ziua! As dori informatii despre...`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.waBtn}
                                >
                                    WhatsApp {phoneNumber || whatsapp}
                                </a>
                            ) : (
                                <p style={{ color: '#dc2626', fontSize: '14px' }}>⚠️ WhatsApp lipsește din setări</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Map */}
            {googleMapsEmbed && (
                <div className={styles.mapWrap}>
                    <iframe
                        src={googleMapsEmbed}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen={true}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    />
                </div>
            )}
        </main>
    );
}
