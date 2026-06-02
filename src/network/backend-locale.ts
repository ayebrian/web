import {useLocale} from 'use-intl';

export type BackendLocale = 'en' | 'ru';

export function useBackendLocale() {
    const locale = useLocale();
    switch (locale) {
        case 'ru':
            return 'ru';
        default:
            return 'en';
    }
}
