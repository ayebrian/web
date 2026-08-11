import './globals.css';
import {BlockingQRProvider} from '@/app/blocking-qr/dialog';
import {AppContextProvider} from '@/app.context';
import {Suspense} from 'react';
import {Scaffold} from '@/app/scaffold';
import {Toaster} from '@/components/ui/sonner';
import {RootContainer} from '@/components/root-container';
import {BackendProvider} from '@/backend.context';
import {QueryProvider} from '@/components/query-provider';
import {SessionProvider} from '@/components/session-provider';
import IntlProvider from '@/components/intl-provider';
import {FriendlyStorageProvider} from '@/components/friendly-storage-provider';
import {DeferredLinkProvider} from '@/app/redirect/[deeplink]/deferred-link';
import {Outlet} from 'react-router';

export default function RootLayout() {
    return (
        <>
            <Suspense>
                <BackendProvider>
                    <SessionProvider>
                        <FriendlyStorageProvider>
                            <QueryProvider>
                                <AppContextProvider>
                                    <DeferredLinkProvider>
                                        <IntlProvider>
                                            <RootContainer>
                                                <BlockingQRProvider>
                                                    <Scaffold>
                                                        <Outlet />
                                                    </Scaffold>
                                                    <Toaster richColors />
                                                </BlockingQRProvider>
                                            </RootContainer>
                                        </IntlProvider>
                                    </DeferredLinkProvider>
                                </AppContextProvider>
                            </QueryProvider>
                        </FriendlyStorageProvider>
                    </SessionProvider>
                </BackendProvider>
            </Suspense>
        </>
    );
}
