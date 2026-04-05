import type {Metadata} from 'next';
import './globals.css';
import {Suspense} from 'react';
import {RootContainer} from '@/components/root-container';
import {BackendProvider} from '@/backend.context';
import {QueryProvider} from '@/components/query-provider';
import {SessionProvider} from '@/components/session-provider';
import {NextIntlClientProvider} from 'next-intl';

export const metadata: Metadata = {
    title: 'Friendly Web',
    description: 'Web client for Friendly',
    manifest: '/manifest.json',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html suppressHydrationWarning>
            <head>
                <meta
                    name="viewport"
                    content="initial-scale=1, width=device-width"
                />
                <link rel="manifest" href="manifest.json" />
                <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
                <meta name="apple-mobile-web-app-title" content="Friendly" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
            </head>
            <body className="bg-[#fafafa]">
                <Suspense>
                    <BackendProvider>
                        <SessionProvider>
                            <QueryProvider>
                                <NextIntlClientProvider>
                                    <RootContainer>{children}</RootContainer>
                                </NextIntlClientProvider>
                            </QueryProvider>
                        </SessionProvider>
                    </BackendProvider>
                </Suspense>
            </body>
        </html>
    );
}
