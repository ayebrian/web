import {StrictMode} from 'react';
import {initializeBackendService} from '@/backend.context';
import * as Notifications from '@/notifications';
import {authService} from '@/services/auth-service';
import {createRoot} from 'react-dom/client';
import {BlockingQR} from '@/app/blocking-qr/page';
import {AppPage, AuthorizedGuard, UnauthorizedGuard} from '@/app/page';
import {ActivityPage} from '@/app/activity/page';
import {DevPage} from '@/app/dev/page';
import SignInPage from '@/app/sign-in/page';
import SignUpPage from '@/app/sign-up/page';
import {CommunityPage} from '@/app/community/page';
import {RepliesPage} from '@/app/community/replies/page';
import {ChatPage} from '@/app/chat/page';
import Bypass from '@/app/blocking-qr/bypass/page';
import UserPage from '@/app/user/[id]/page';
import DeeplinkPage from '@/app/redirect/[deeplink]/page';
import {NotFoundPage} from '@/app/not-found';
import {ProfilePage} from '@/app/profile/page';
import {RootLayout} from '@/app/layout';
import {createBrowserRouter, RouterProvider} from 'react-router';
import FeedPage from '@/app/feed/page';
import RouteErrorScreen from '@/route-errorscreen';
import IntlProvider from '@/components/intl-provider';
import {AppContext} from '@/app.context';

// Dynamic initialization for the app context.
//
// This dynamism helps to stop fighting type system where logic can be easily
// checked once during startup. Either it starts, or it fails.
//
// No conditionals should be introduced while initializing app context to avoid
// floating bugs.
const app = {} as AppContext;

const router = createBrowserRouter([
    {
        path: '/',
        element: <RootLayout app={app} />,
        errorElement: (
            <IntlProvider>
                <RouteErrorScreen />
            </IntlProvider>
        ),
        children: [
            {
                path: '/',
                Component: AppPage,
            },
            {
                path: '/dev',
                Component: DevPage,
            },
            {
                element: <UnauthorizedGuard />,
                children: [
                    {
                        path: 'sign-in',
                        Component: SignInPage,
                    },
                    {
                        path: 'sign-up',
                        Component: SignUpPage,
                    },
                ],
            },
            {
                element: <AuthorizedGuard />,
                children: [
                    {
                        path: 'blocking-qr',
                        Component: BlockingQR,
                    },
                    {
                        path: 'activity',
                        Component: ActivityPage,
                    },
                    {
                        path: 'profile',
                        Component: ProfilePage,
                    },
                    {
                        path: 'blocking-qr/bypass',
                        Component: Bypass,
                    },
                    {
                        path: 'user/:id',
                        Component: UserPage,
                    },
                    {
                        path: 'redirect/:deeplink',
                        Component: DeeplinkPage,
                    },
                    {
                        path: 'community',
                        Component: CommunityPage,
                    },
                    {
                        path: 'community/:id/replies',
                        Component: RepliesPage,
                    },
                    {
                        path: 'chat',
                        Component: ChatPage,
                    },
                    {
                        path: 'feed',
                        Component: FeedPage,
                    },
                ],
            },
            {
                path: '*',
                Component: NotFoundPage,
            },
        ],
    },
]);

const start = performance.now();

await authService.initialize(app);
initializeBackendService(app);
Notifications.main(app);

console.log(`Initialization finished in ${performance.now() - start}`);

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <RouterProvider router={router} useTransitions />
    </StrictMode>,
);
