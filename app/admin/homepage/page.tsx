import HomepageForm from '@/components/admin/HomepageForm';
import { getSettings } from '@/lib/actions/settings';

export default async function AdminHomepage() {
    const homepageData = await getSettings('homepage_content') || {};
    return (
        <div style={{ padding: '24px' }}>
            <HomepageForm initialData={homepageData} />
        </div>
    );
}
