import { getI18nMessages } from '@/lib/actions/translations';
import TranslationsEditor from './TranslationsEditor';

export default async function TranslationsPage() {
    const locales = ['ro', 'ru', 'en'];

    // Fetch all messages serverside
    const messages: Record<string, any> = {};
    for (const loc of locales) {
        messages[loc] = await getI18nMessages(loc);
    }

    return (
        <TranslationsEditor
            locales={locales}
            initialMessages={messages}
        />
    );
}
