import {useEffect, useState} from 'react';
import {useNavigate, useLocation} from 'react-router';
import {Outlet} from 'react-router';
import {useSession} from '@/components/session-provider';
import {useBlockingQR} from '@/app/blocking-qr/page';
import {Loader2} from 'lucide-react';

export function AppPage() {
    const [loading, setLoading] = useState(true);
    const [loadingLong, setLoadingLong] = useState(false);

    const navigate = useNavigate();
    const session = useSession();
    const location = useLocation();

    useEffect(() => {
        if (location.pathname === '/') {
            void navigate('/community');
        }
    }, []);

    useEffect(() => {
        const timeout = setTimeout(() => setLoadingLong(true), 500);
        return () => clearTimeout(timeout);
    }, []);

    useEffect(() => {
        if (session.status === 'loading') return;
        setLoading(false);
    }, [session.status]);

    if (loading && loadingLong) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return <Outlet />;
}

export function AuthorizedGuard() {
    const navigate = useNavigate();
    const session = useSession();
    const blockingQR = useBlockingQR();
    useEffect(() => {
        if (session.status === 'loading') return;
        if (session.status === 'guest') {
            void navigate('/sign-up');
        } else if (blockingQR.shouldBlock) {
            void navigate('/blocking-qr');
        }
    }, [session.status, navigate]);
    return <Outlet />;
}

export function UnauthorizedGuard() {
    const navigate = useNavigate();
    const session = useSession();
    useEffect(() => {
        if (session.status === 'loading') return;
        if (session.status === 'authed') {
            return void navigate('/');
        }
    }, [session.status, navigate]);
    return <Outlet />;
}
