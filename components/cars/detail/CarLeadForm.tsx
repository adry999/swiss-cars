'use client';

import { useState } from 'react';
import { Phone, MessageCircle, Send, CheckCircle, Loader2, User, PhoneCall, Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { submitLeadInquiry } from '@/lib/actions/leads';
import { formatPrice } from '@/lib/utils/format';
import styles from './CarLeadForm.module.css';

type Props = {
    carId: string;
    carName: string;
    carPrice: number;
    phoneNumber?: string;
    whatsappNumber?: string;
};

export default function CarLeadForm({ carId, carName, carPrice, phoneNumber, whatsappNumber }: Props) {
    const t = useTranslations('errors');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !phone.trim()) {
            setError(t('required_fields'));
            return;
        }
        setLoading(true);
        setError('');

        const result = await submitLeadInquiry({
            car_id: carId,
            car_name: carName,
            name,
            phone,
            email,
            message,
            source_url: typeof window !== 'undefined' ? window.location.href : undefined
        });

        setLoading(false);
        if (result.success) {
            setSuccess(true);
        } else {
            setError(result.error || t('submit_error'));
        }
    };

    return (
        <div className={styles.wrapper}>
            {/* Quick Actions */}
            {(phoneNumber || whatsappNumber) && (
                <div className={styles.quickActions}>
                    {phoneNumber && (
                        <a href={`tel:${phoneNumber}`} className={styles.callBtn}>
                            <Phone size={18} />
                            <span>{phoneNumber}</span>
                        </a>
                    )}
                    {whatsappNumber && (
                        <a
                            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Bună ziua! Sunt interesat de: ${carName} (${formatPrice(carPrice)} €)`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.waBtn}
                        >
                            <MessageCircle size={18} />
                            <span>WhatsApp</span>
                        </a>
                    )}
                </div>
            )}

            {/* Lead Form */}
            <div className={styles.formSeparator}>
                <span>sau trimite o cerere</span>
            </div>

            {success ? (
                <div className={styles.successState}>
                    <CheckCircle size={40} color="var(--color-primary)" />
                    <h4>Cerere trimisă cu succes!</h4>
                    <p>Te vom contacta în cel mai scurt timp.</p>
                </div>
            ) : (
                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <User size={16} className={styles.inputIcon} />
                        <input
                            type="text"
                            placeholder="Numele tău *"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className={styles.input}
                            required
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <PhoneCall size={16} className={styles.inputIcon} />
                        <input
                            type="tel"
                            placeholder="Numărul de telefon *"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            className={styles.input}
                            required
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <Mail size={16} className={styles.inputIcon} />
                        <input
                            type="email"
                            placeholder="Email (opțional)"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className={styles.input}
                        />
                    </div>
                    <textarea
                        placeholder={`Mesaj (opțional) — ex: Sunt interesat de ${carName}...`}
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        className={styles.textarea}
                        rows={3}
                    />

                    {error && <p className={styles.errorMsg}>{error}</p>}

                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading ? (
                            <><Loader2 size={18} className={styles.spinner} /> Se trimite...</>
                        ) : (
                            <><Send size={18} /> Trimite cererea</>
                        )}
                    </button>
                </form>
            )}
        </div>
    );
}
