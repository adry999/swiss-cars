import { HomepageContentForm } from '@features/site-settings/admin';
import { getHomepageContent } from '@features/site-settings/server';

export default async function AdminHomepage() {
    const homepageData = await getHomepageContent();
    return (
        <div style={{ padding: '24px' }}>
            <HomepageContentForm initialData={homepageData} />
        </div>
    );
}
