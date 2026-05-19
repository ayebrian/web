export default async function getRequestConfig() {
    // const headerList = await headers();
    // const acceptLanguage = headerList.get('accept-language');
    // const locale = acceptLanguage?.split(',')[0].split('-')[0] || 'en';

    // console.log(`Detected locale: ${locale}`);
    const locale = 'en';

    return {
        locale,
        messages: (await import(`../messages/${locale}.json`)).default,
    };
}
