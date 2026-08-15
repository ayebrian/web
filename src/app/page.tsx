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
    const blockingQR = useBlockingQR();

    useEffect(() => {
        const timeout = setTimeout(() => setLoadingLong(true), 500);
        return () => clearTimeout(timeout);
    }, []);

    useEffect(() => {
        if (session.status === 'loading') return;
        setLoading(false);

        if (session.status === 'guest') {
            void navigate('/sign-up');
        } else if (session.status === 'authed') {
            if (blockingQR.shouldBlock) {
                void navigate('/blocking-qr');
            } else {
                if (location.pathname === '/') {
                    void navigate('/community');
                }
            }
        }
    }, [session.status, blockingQR.shouldBlock, navigate]);

    if (loading && loadingLong) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return <Outlet />;
}
