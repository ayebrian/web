import './globals.css';
import {AppContextProvider} from '@/app.context';
import {Suspense} from 'react';
import {Toaster} from '@/components/ui/sonner';
import {RootContainer} from '@/components/root-container';
import {BackendProvider} from '@/backend.context';
import {QueryProvider} from '@/components/query-provider';
import {SessionProvider} from '@/components/session-provider';
import IntlProvider from '@/components/intl-provider';
import {UserAccessHashesProvider} from '@/components/useraccesshashes-provider';
import {DeferredLinkProvider} from '@/app/redirect/[deeplink]/deferred-link';

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <Suspense>
            <BackendProvider>
                <SessionProvider>
                    <UserAccessHashesProvider>
                        <QueryProvider>
                            <AppContextProvider>
                                <DeferredLinkProvider>
                                    <IntlProvider>
                                        <RootContainer>
                                            {children}
                                            <Toaster richColors />
                                        </RootContainer>
                                    </IntlProvider>
                                </DeferredLinkProvider>
                            </AppContextProvider>
                        </QueryProvider>
                    </UserAccessHashesProvider>
                </SessionProvider>
            </BackendProvider>
        </Suspense>
    );
}
