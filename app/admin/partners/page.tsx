import Link from 'next/link';
import { getPartners } from '@/lib/supabase/queries';
import PartnersTable from './PartnersTable';
import styles from './page.module.css';

export default async function AdminPartnersPage() {
    const partners = await getPartners();

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
