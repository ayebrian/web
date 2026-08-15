import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {BlockingQR} from '@/app/blocking-qr/page';
import {AppPage} from '@/app/page';
import {ActivityPage} from '@/app/activity/page';
import SignInPage from '@/app/sign-in/page';
import SignUpPage from '@/app/sign-up/page';
import {CommunityPage} from '@/app/community/page';
import {RepliesPage} from '@/app/community/replies/page';
import {ChatPage} from '@/app/chat/page';
import Bypass from '@/app/blocking-qr/bypass/page';
import UserPage from '@/app/user/[id]/page';
import DeeplinkPage from '@/app/redirect/[deeplink]/page';
import * as Notifications from '@/notifications';
import {NotFoundPage} from '@/app/not-found';
import {ProfilePage} from '@/app/profile/page';
import {RootLayout} from '@/app/layout';
import {createBrowserRouter, RouterProvider} from 'react-router';
import FeedPage from '@/app/feed/page';
import RouteErrorScreen from '@/route-errorscreen';
import IntlProvider from '@/components/intl-provider';

void Notifications.nudge();

const router = createBrowserRouter([
    {
        path: '/',
        element: <RootLayout />,
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
                path: '/blocking-qr',
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
                path: 'sign-in',
                Component: SignInPage,
            },
            {
                path: 'sign-up',
                Component: SignUpPage,
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
            {
                path: '*',
                Component: NotFoundPage,
            },
        ],
    },
]);

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <RouterProvider router={router} useTransitions />
    </StrictMode>,
);
