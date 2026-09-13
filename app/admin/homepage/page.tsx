import { HomepageContentForm } from '@features/site-settings/admin';
import { getHomepageContent } from '@/lib/settings';
import type { HomepageContent } from '@/lib/types';

export default async function AdminHomepage() {
    // Stored as a loose JSON blob; the form fills in any missing sections.
    const homepageData = (await getHomepageContent()) as Partial<HomepageContent>;
    return (
        <div style={{ padding: '24px' }}>
            <HomepageContentForm initialData={homepageData as HomepageContent} />
        </div>
    );
}
