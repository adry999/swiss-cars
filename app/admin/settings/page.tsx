import { getSiteConfig } from '@/lib/settings';
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
        header_height: 80,
    };

    // Notification credentials are environment variables now, not settings.
    // Strip them so the form cannot write them back into the anon-readable row.
    const {
        /* eslint-disable @typescript-eslint/no-unused-vars */
        telegram_bot_token: _token,
        telegram_chat_id: _chatId,
        notification_email: _email,
        /* eslint-enable @typescript-eslint/no-unused-vars */
        ...savedSettings
    } = await getSiteConfig();

    const settings = { ...defaultSettings, ...savedSettings };

    return (
        <div>
            <SettingsForm initialSettings={settings} />
        </div>
    );
}
