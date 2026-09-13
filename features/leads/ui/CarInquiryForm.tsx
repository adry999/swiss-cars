'use client';

import { useState } from 'react';
import { Phone, MessageCircle, Send, CheckCircle, Loader2, User, PhoneCall, Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { formatPrice } from '@/lib/utils/format';
import { leadInquiryFailureMessageKey, useLeadInquirySubmission, type LeadInquiryAction } from './use-lead-inquiry-submission';
import styles from './CarInquiryForm.module.css';

type Props = {
    carId: string;
    carTitle: string;
    carPrice: number;
    phoneNumber?: string;
    whatsappNumber?: string;
    submitLeadInquiry: LeadInquiryAction;
};

export default function CarInquiryForm({ carId, carTitle, carPrice, phoneNumber, whatsappNumber, submitLeadInquiry }: Props) {
    const t = useTranslations('errors');
    const tc = useTranslations('car_detail');
    const { state, submit } = useLeadInquirySubmission(submitLeadInquiry);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [requiredFieldsMessage, setRequiredFieldsMessage] = useState('');

    const submitCarInquiry = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !phone.trim()) {
            setRequiredFieldsMessage(t('required_fields'));
            return;
        }
        setRequiredFieldsMessage('');

        await submit({
            formType: 'inquiry',
            carId,
            carTitle,
            customerName: name,
            customerPhone: phone,
            customerEmail: email,
            message,
            sourceUrl: window.location.href,
        });
    };

    const errorMessage = requiredFieldsMessage || (state.status === 'failed' ? t(leadInquiryFailureMessageKey(state.failure)) : '');

    return (
        <div className={styles.wrapper}>
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
                            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`${tc('whatsapp_message', { carName: carTitle })} (${formatPrice(carPrice)} €)`)}`}
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

            <div className={styles.formSeparator}>
                <span>{tc('form_separator')}</span>
            </div>

            {state.status === 'succeeded' ? (
                <div className={styles.successState}>
                    <CheckCircle size={40} color="var(--color-primary)" />
                    <h4>{tc('form_success_title')}</h4>
                    <p>{tc('form_success_text')}</p>
                </div>
            ) : (
                <form className={styles.form} onSubmit={submitCarInquiry}>
                    <div className={styles.inputGroup}>
                        <User size={16} className={styles.inputIcon} />
                        <input
                            type="text"
                            placeholder={tc('form_name_placeholder')}
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
                            placeholder={tc('form_phone_placeholder')}
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
                            placeholder={tc('form_email_placeholder')}
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className={styles.input}
                        />
                    </div>
                    <textarea
                        placeholder={tc('form_message_placeholder', { carName: carTitle })}
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        className={styles.textarea}
                        rows={3}
                    />

                    {errorMessage && <p className={styles.errorMsg}>{errorMessage}</p>}

                    <button type="submit" className={styles.submitBtn} disabled={state.status === 'submitting'}>
                        {state.status === 'submitting' ? (
                            <><Loader2 size={18} className={styles.spinner} /> {tc('form_loading')}</>
                        ) : (
                            <><Send size={18} /> {tc('form_submit')}</>
                        )}
                    </button>
                </form>
            )}
        </div>
    );
}
