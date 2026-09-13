import Link from 'next/link';
import { listVisiblePartners } from '@features/partners/server';
import { PartnersTable } from '@features/partners/admin';
import styles from './page.module.css';

export default async function AdminPartnersPage() {
    const partners = await listVisiblePartners();

    return (
        <div>
            <div className={styles.header}>
                <h1 className={styles.title}>Our Partners ({partners.length})</h1>
                <Link href="/admin/partners/new" className="btn btn-primary">Add Partner</Link>
            </div>
            <PartnersTable partners={partners} />
        </div>
    );
}
