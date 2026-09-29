export function isMobile(): boolean {
    if (
        'userAgentData' in navigator &&
        typeof navigator.userAgentData === 'object' &&
        navigator.userAgentData !== null &&
        'mobile' in navigator.userAgentData
    ) {
        return !!navigator.userAgentData.mobile;
    }
    return /Mobi/.test(navigator.userAgent);
}
