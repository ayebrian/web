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
                        retry: true,
                        retryDelay: 1_000,
                        refetchOnWindowFocus: true,
                        refetchOnReconnect: true,
                        staleTime: 1_000,
                        gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
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
