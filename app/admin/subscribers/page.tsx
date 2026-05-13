import { getSubscribers } from '@/lib/actions/subscribers';
import SubscribersTable from './SubscribersTable';

export default async function SubscribersPage() {
    const subscribers = await getSubscribers();

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Newsletter Subscribers</h1>
                    <p style={{ color: '#666', fontSize: '14px' }}>
                        {subscribers.length} total subscribers ({subscribers.filter(s => s.is_active).length} active)
                    </p>
                </div>
            </div>

            <SubscribersTable subscribers={subscribers} />
        </div>
    );
}
