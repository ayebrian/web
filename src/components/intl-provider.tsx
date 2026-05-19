
import {IntlProvider as UseIntlProvider} from 'use-intl';
import {useEffect, useState} from 'react';
import en from '../messages/en.json';

type Messages = typeof en;

const loaders: Record<string, () => Promise<{default: Messages}>> = {
    en: () => import('../messages/en.json'),
    ru: () => import('../messages/ru.json'),
};

const fallbackLocale = 'en';

export default function IntlProvider({children}: {children: React.ReactNode}) {
    const [messages, setMessages] = useState<Messages | null>(null);
    const [locale, setLocale] = useState(fallbackLocale);

    useEffect(() => {
        const detected = navigator.language.split('-')[0];
        const loc = loaders[detected] ? detected : fallbackLocale;

        loaders[loc]()
            .then(mod => {
                setMessages(mod.default);
                setLocale(loc);
                console.log(`Loaded locale ${loc}`);
            })
            .catch(() => {
                void loaders[fallbackLocale]().then(mod => {
                    setMessages(mod.default);
                    setLocale(fallbackLocale);
                });
            });
    }, []);

    if (!messages) return null;

    return (
        <UseIntlProvider locale={locale} messages={messages}>
            {children}
        </UseIntlProvider>
    );
}
