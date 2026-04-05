import {getRequestConfig} from 'next-intl/server';

export default getRequestConfig(async () => {
    const locale = 'en'; // TODO: Get locale from headers or cookies

    return {
        locale,
        messages: (await import(`../messages/${locale}.json`)).default,
    };
});
