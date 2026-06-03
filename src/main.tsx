import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter, Route, Routes} from 'react-router';
import RootLayout from '@/app/layout';
import HomePage from '@/app/page';
import SignInPage from '@/app/sign-in/page';
import SignUpPage from '@/app/sign-up/page';
import Bypass from '@/app/blocking-qr/bypass/page';
import UserPage from '@/app/user/[id]/page';
import DeeplinkPage from '@/app/redirect/[deeplink]/page';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            <RootLayout>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/sign-in" element={<SignInPage />} />
                    <Route path="/sign-up" element={<SignUpPage />} />
                    <Route path="/blocking-qr/bypass" element={<Bypass />} />
                    <Route path="/user/:id" element={<UserPage />} />
                    <Route
                        path="/redirect/:deeplink"
                        element={<DeeplinkPage />} />
                </Routes>
            </RootLayout>
        </BrowserRouter>
    </StrictMode>,
);
