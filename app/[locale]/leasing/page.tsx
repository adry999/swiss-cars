import { getTranslations } from 'next-intl/server';
import { getPartners } from '@/lib/supabase/queries';
import Image from 'next/image';
import LeasingCalculator from '@/components/leasing/LeasingCalculator';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Leasing Auto | SwissCars.md',
    description: 'Află opțiunile de finanțare și leasing pentru mașinile importate din Elveția.',
};

export default async function LeasingPage() {
    const t = await getTranslations('leasing');
    const partners = await getPartners();

    return (
        <main style={{ paddingTop: 'var(--header-height)', paddingBottom: '80px', minHeight: '80vh', background: 'var(--color-bg)' }}>
            <div className="container">
                <div style={{ marginBottom: '50px', textAlign: 'center' }}>
                    <h1 className="ui-title">{t('title')}</h1>
                    <div className="ui-decor" style={{ margin: '15px auto 0' }} />
                </div>

                <div style={{ background: 'var(--color-white)', padding: '40px', borderRadius: '16px', border: '1px solid var(--color-gray-2)', marginBottom: '50px' }}>
                    <div style={{ maxWidth: '800px', margin: '0 auto', color: 'var(--color-text-light)', lineHeight: 1.8, fontSize: '16px' }}>
                        <p style={{ marginBottom: '20px' }}>{t('text1')}</p>
                        <p>{t('text2')}</p>
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: 'var(--font-primary)' }}>{t('partners_title')}</h2>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', justifyContent: 'center' }}>
                    {partners.filter(p => !!p.logo_url).map(p => (
                        <div key={p.id} style={{ background: 'var(--color-white)', padding: '20px', borderRadius: '12px', border: '1px solid var(--color-gray-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '200px', height: '100px' }}>
                            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                <Image src={p.logo_url as string} alt={p.name ?? 'Partner'} fill style={{ objectFit: 'contain' }} />
                            </div>
                        </div>
                    ))}
                </div>

                <LeasingCalculator />
            </div>
        </main>
    );
}
