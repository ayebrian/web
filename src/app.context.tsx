import {FriendlyStorage} from '@/services/friendly-storage';
import {useFriendlyStorage} from '@/components/friendly-storage-provider';
import {users} from '@/services/users-service';
import {useQueryClient, QueryClient} from '@tanstack/react-query';
import {BackendService} from '@/services/backend-service';
import {useBackend} from '@/backend.context';
import {
    ReactElement,
    useEffect,
    createContext,
    useContext,
    RefObject,
    useRef,
} from 'react';

const AppContextDescriptor = createContext<AppContext | null>(null);

export interface AppContextProviderProps {
    children: ReactElement;
}

/**
 * Reactive object used to update references to mutated entities like profile
 * edits. In the future you will register used entities here, and websocket will
 * notify you if something changed, so you can do stuff like this:
 *
 * `const user: UserDetails = useUser(user)`
 *
 * That will automatically notify you if observed user was mutated.
 */
export interface AppContext {
    backend: BackendService;
    queryClient: QueryClient;
    storage: FriendlyStorage;
}

export function useAppContextRef(): RefObject<AppContext> {
    const appContext = useAppContext();
    const ref = useRef<AppContext>(appContext);
    useEffect(() => {
        ref.current = appContext;
    }, [appContext]);
    return ref;
}

export function useAppContext() {
    const appContext = useContext(AppContextDescriptor);
    if (!appContext) {
        throw new Error(
            'AppContext should be only used inside AppContextProvider',
        );
    }
    return appContext;
}

export function AppContextProvider({
    children,
}: AppContextProviderProps): ReactElement {
    const backend = useBackend();
    const queryClient = useQueryClient();
    const storage = useFriendlyStorage();

    const value: AppContext = {
        backend,
        queryClient,
        storage,
    };

    useEffect(() => {
        backend.restoreAuthorizationIfPossible();
        users.start(value);
    }, []);

    return (
        <AppContextDescriptor.Provider value={value}>
            {children}
        </AppContextDescriptor.Provider>
    );
}
