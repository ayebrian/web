'use client';

import {
    MutationCache,
    QueryCache,
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query';
import {useEffect, useRef, useState} from 'react';
import {useSession} from '@/components/session-provider';
import {useRouter} from 'next/navigation';

export function QueryProvider({children}: {children: React.ReactNode}) {
    const session = useSession();
    const router = useRouter();

    const sessionRef = useRef(session);
    const routerRef = useRef(router);

    useEffect(() => {
        sessionRef.current = session;
    }, [session]);

    useEffect(() => {
        routerRef.current = router;
    }, [router]);

    const [client] = useState(
        () =>
            new QueryClient({
                queryCache: new QueryCache({
                    // onError: error => {
                    //     if (error instanceof UnauthorizedError) {
                    //         sessionRef.current.logOut();
                    //         routerRef.current.push('/signIn');
                    //     }
                    // },
                }),
                mutationCache: new MutationCache({
                    // onError: error => {
                    // if (error instanceof UnauthorizedError) {
                    // sessionRef.current.logOut();
                    // routerRef.current.push('/signIn');
                    // }
                    // },
                }),
            }),
    );
    return (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
}
