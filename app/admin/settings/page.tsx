import { getSettings } from '@/lib/actions/settings';
import SettingsForm from './SettingsForm';

export default async function SettingsPage() {
    const defaultSettings = {
        phone: '+41 78 323 31 50',
        whatsapp: '+41783233150',
        email: 'info@swisscars.md',
        address: 'Switzerland',
        max_car_images: 25,
        facebook: '',
        instagram: '',
        site_title: 'SwissCars.md',
        site_description: 'Dealer autorizat de mașini din Elveția',
        gtm_id: '',
        logo_url: '',
        notification_email: '',
        telegram_bot_token: '',
        telegram_chat_id: '',
        header_height: 80,
    };

    const savedSettings = await getSettings('site_config');
    const settings = { ...defaultSettings, ...(savedSettings || {}) };

    return (
        <div>
            <SettingsForm initialSettings={settings} />
        </div>
    );
}
