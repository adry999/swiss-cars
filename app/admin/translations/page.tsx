import { TranslationsEditor, type MessagesTree } from '@features/translations/admin';
import { readLocaleMessages } from '@features/translations/server';
import { routing } from '@i18n/routing';

export default async function TranslationsPage() {
    const messagesByLocale: Record<string, MessagesTree> = {};
    for (const locale of routing.locales) {
        const localeMessages = await readLocaleMessages(locale);
        if (localeMessages) {
            messagesByLocale[locale] = localeMessages;
        }
    }

    return <TranslationsEditor locales={[...routing.locales]} initialMessages={messagesByLocale} />;
}
