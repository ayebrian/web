import {QueryClient} from '@tanstack/react-query';
import {createAsyncStoragePersister} from '@tanstack/query-async-storage-persister';
import {PersistQueryClientProvider} from '@tanstack/react-query-persist-client';
import {useEffect, useRef, useMemo} from 'react';
import {useSession} from '@/components/session-provider';

export function QueryProvider({children}: {children: React.ReactNode}) {
    const session = useSession();

    const sessionRef = useRef(session);

    useEffect(() => {
        sessionRef.current = session;
    }, [session]);

    const client = useMemo(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        retry: 3,
                        retryDelay: attempt =>
                            Math.min(1_000 * 2 ** attempt, 10_000),
                        refetchOnWindowFocus: true,
                        refetchOnReconnect: true,
                        staleTime: 1000 * 60,
                    },
                },
            }),
        [],
    );

    const persister = useMemo(
        () =>
            createAsyncStoragePersister({
                storage: window.localStorage,
            }),
        [],
    );

    return (
        <PersistQueryClientProvider
            client={client}
            persistOptions={{persister}}
        >
            {children}
        </PersistQueryClientProvider>
    );
}
