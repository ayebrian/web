export function setCookie<T>(key: string, value: T, days: number = 7): void {
    if (typeof document === 'undefined') return;

    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);

    const expires = `expires=${date.toUTCString()}`;
    const stringValue = JSON.stringify(value);

    document.cookie = `${key}=${encodeURIComponent(stringValue)}; ${expires}; path=/; SameSite=None; Secure`;
}

export function getCookie<T>(key: string): T | null {
    if (typeof document === 'undefined') return null;

    const nameEQ = `${key}=`;
    const ca = document.cookie.split(';');

    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);

        if (c.indexOf(nameEQ) === 0) {
            const rawValue = decodeURIComponent(
                c.substring(nameEQ.length, c.length),
            );
            try {
                return JSON.parse(rawValue) as T;
            } catch {
                return rawValue as unknown as T;
            }
        }
    }
    return null;
}

export function removeCookie(key: string): void {
    if (typeof document === 'undefined') return;
    document.cookie = `${key}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
}
