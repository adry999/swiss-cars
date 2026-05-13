import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import styles from './not-found.module.css';

export default function LocaleNotFound() {
    const t = useTranslations('not_found');

    return (
        <main className={styles.container}>
            <div className={styles.content}>
                <div className={styles.errorCode}>404</div>
                <h1 className={styles.title}>{t('title')}</h1>
                <p className={styles.description}>
                    {t('description')}
                </p>
                <div className={styles.actions}>
                    <Link href="/" className={styles.primaryBtn}>
                        {t('go_home')}
                    </Link>
                    <Link href="/inventory" className={styles.secondaryBtn}>
                        {t('view_cars')}
                    </Link>
                </div>
            </div>
        </main>
    );
}
