import './globals.css';
import {BlockingQRProvider} from '@/app/blocking-qr/dialog';
import {AppContextProvider} from '@/app.context';
import {Suspense, useEffect, ReactNode} from 'react';
import {Scaffold} from '@/app/scaffold';
import {Toaster} from '@/components/ui/sonner';
import {RootContainer} from '@/components/root-container';
import {BackendProvider} from '@/backend.context';
import {QueryProvider} from '@/components/query-provider';
import {SessionProvider} from '@/components/session-provider';
import IntlProvider from '@/components/intl-provider';
import {UserAccessHashesProvider} from '@/components/useraccesshashes-provider';
import {DeferredLinkProvider} from '@/app/redirect/[deeplink]/deferred-link';
import {useLocation, Outlet} from 'react-router';

export default function RootLayout() {
    return (
        <>
            <ScrollToTop />
            <Suspense>
                <BackendProvider>
                    <SessionProvider>
                        <UserAccessHashesProvider>
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
                        </UserAccessHashesProvider>
                    </SessionProvider>
                </BackendProvider>
            </Suspense>
        </>
    );
}

/**
 * Prevent react-router from retaining scroll state.
 * Source: https://dev.to/bcncodeschool/how-to-reset-scroll-position-to-top-in-react-router-1i8
 */
function ScrollToTop(): ReactNode {
    const {pathname} = useLocation();

    useEffect(() => {
        document.documentElement.scrollTo({
            top: 0,
            left: 0,
        });
    }, [pathname]);

    return null;
}
