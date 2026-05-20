
import {ThemeProvider} from '@/components/theme-provider';
import {useEffect} from 'react';

const appVersion = String(import.meta.env.VITE_APP_VERSION);

export function RootContainer({children}: {children: React.ReactNode}) {
    useEffect(() => console.log('appVersion =', appVersion), []);

    return (
        <ThemeProvider>
            {children}
        </ThemeProvider>
    );
}
