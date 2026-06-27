import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import SignInPage from '@/app/sign-in/page';
import SignUpPage from '@/app/sign-up/page';
import {CommunityPage} from '@/app/community/page';
import {ChatPage} from '@/app/chat/page';
import Bypass from '@/app/blocking-qr/bypass/page';
import UserPage from '@/app/user/[id]/page';
import DeeplinkPage from '@/app/redirect/[deeplink]/page';
import * as Notifications from '@/notifications';
import {NotFoundPage} from '@/app/not-found';
import Home from '@/app/page';
import RootLayout from '@/app/layout';
import {createBrowserRouter, RouterProvider} from 'react-router';
import FeedPage from '@/app/feed/page';

void Notifications.nudge();

const router = createBrowserRouter([
    {
        path: '/',
        element: <RootLayout />,
        children: [
            {
                path: '/',
                Component: Home,
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
        <RouterProvider router={router} />
    </StrictMode>,
);
