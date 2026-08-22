import {QueryClient} from '@tanstack/react-query';
import {
    PersistQueryClientProvider,
    PersistedClient,
    Persister,
} from '@tanstack/react-query-persist-client';
import {useEffect, useRef, useMemo} from 'react';
import {useSession} from '@/components/session-provider';
import {get, set, del} from 'idb-keyval';

/**
 * Avoid local-storage limits.
 * @see https://github.com/TanStack/query/discussions/3198#discussion-3801221
 */
export function createIDBPersister(idbValidKey: IDBValidKey = 'reactQuery') {
    return {
        persistClient: async (client: PersistedClient) => {
            await set(idbValidKey, client);
        },
        restoreClient: async () => {
            return await get<PersistedClient>(idbValidKey);
        },
        removeClient: async () => {
            await del(idbValidKey);
        },
    } satisfies Persister;
}

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

    const persister = useMemo(() => createIDBPersister(), []);

    return (
        <PersistQueryClientProvider
            client={client}
            persistOptions={{persister}}
        >
            {children}
        </PersistQueryClientProvider>
    );
}
