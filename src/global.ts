// import {routing} from '@/i18n/routing';
// import {formats} from '@/i18n/request';
import messages from './messages/en.json';

declare module 'use-intl' {
    interface AppConfig {
        Messages: typeof messages;
    }
}
