'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import styles from './LeasingCalculator.module.css';

export default function LeasingCalculator() {
    const t = useTranslations('leasing');
    const [price, setPrice] = useState(15000);
    const [downPct, setDownPct] = useState(20);
    const [months, setMonths] = useState(48);
    const [rate, setRate] = useState(7.5);

    const downPayment = (price * downPct) / 100;
    const principal = price - downPayment;
    const monthlyRate = rate / 100 / 12;
    const monthly = monthlyRate === 0
        ? principal / months
        : (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);

    const totalCost = monthly * months + downPayment;
    const totalInterest = totalCost - price;

    const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

    return (
        <div className={styles.calculator}>
            <h2 className={styles.title}>{t('calculator_title')}</h2>
            <p className={styles.subtitle}>{t('calculator_subtitle')}</p>

            <div className={styles.grid}>
                {/* Inputs */}
                <div className={styles.inputs}>
                    <div className={styles.field}>
                        <label className={styles.label}>{t('car_price')}</label>
                        <div className={styles.sliderWrap}>
                            <input type="range" min={3000} max={120000} step={500} value={price}
                                onChange={e => setPrice(+e.target.value)} className={styles.slider} />
                            <div className={styles.sliderValue}>{fmt(price)} €</div>
                        </div>
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>{t('down_payment')} ({downPct}%)</label>
                        <div className={styles.sliderWrap}>
                            <input type="range" min={10} max={50} step={5} value={downPct}
                                onChange={e => setDownPct(+e.target.value)} className={styles.slider} />
                            <div className={styles.sliderValue}>{fmt(downPayment)} €</div>
                        </div>
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>{t('duration')}</label>
                        <div className={styles.monthsBtns}>
                            {[24, 36, 48, 60, 72].map(m => (
                                <button key={m} onClick={() => setMonths(m)}
                                    className={`${styles.monthBtn} ${months === m ? styles.monthActive : ''}`}>
                                    {m} {t('months')}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>{t('annual_rate')} ({rate}%)</label>
                        <div className={styles.sliderWrap}>
                            <input type="range" min={4} max={15} step={0.5} value={rate}
                                onChange={e => setRate(+e.target.value)} className={styles.slider} />
                            <div className={styles.sliderValue}>{rate}%</div>
                        </div>
                    </div>
                </div>

                {/* Results */}
                <div className={styles.results}>
                    <div className={styles.mainResult}>
                        <span className={styles.mainLabel}>{t('monthly_estimate')}</span>
                        <span className={styles.mainValue}>{fmt(monthly)} €</span>
                        <span className={styles.mainSub}>{t('per_month')}</span>
                    </div>

                    <div className={styles.breakdown}>
                        <div className={styles.breakItem}>
                            <span>{t('down_payment_result')}</span>
                            <strong>{fmt(downPayment)} €</strong>
                        </div>
                        <div className={styles.breakItem}>
                            <span>{t('credit')}</span>
                            <strong>{fmt(principal)} €</strong>
                        </div>
                        <div className={styles.breakItem}>
                            <span>{t('total_interest')}</span>
                            <strong>{fmt(totalInterest)} €</strong>
                        </div>
                        <div className={`${styles.breakItem} ${styles.breakTotal}`}>
                            <span>{t('total_payment')}</span>
                            <strong>{fmt(totalCost)} €</strong>
                        </div>
                    </div>

                    <Link href="/contact" className={`btn btn-primary ${styles.ctaBtn}`}>
                        {t('request_offer')}
                    </Link>
                </div>
            </div>
        </div>
    );
}
