import en from '../messages/en.json';

type Messages = typeof en;

export default async function getRequestConfig() {
    // const headerList = await headers();
    // const acceptLanguage = headerList.get('accept-language');
    // const locale = acceptLanguage?.split(',')[0].split('-')[0] || 'en';

    // console.log(`Detected locale: ${locale}`);
    const locale = 'en';
    const mod = await import('../messages/en.json') as {default: Messages};

    return {
        locale,
        messages: mod.default,
    };
}
