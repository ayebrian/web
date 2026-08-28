import {UserAccessHashesService} from '@/services/useraccesshashes-service';
import {useAppContext} from '@/app.context';
import {CommunityPostsDB} from '@/services/community-posts-db';
import {FriendlyStorage} from '@/services/friendly-storage';
import {createContext, useContext, useMemo} from 'react';

const FriendlyStorageContext = createContext<FriendlyStorage | null>(null);

// We forcing this hook to skip initialization on server,
// to prevent hydration errors
export function FriendlyStorageProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const app = useAppContext();

    const value = useMemo<FriendlyStorage>(() => {
        const value = {
            userAccessHashes: new UserAccessHashesService(),
            communityPosts: new CommunityPostsDB(),
        };
        app.storage = value;
        return value;
    }, []);

    return (
        <FriendlyStorageContext.Provider value={value}>
            {children}
        </FriendlyStorageContext.Provider>
    );
}

export function useFriendlyStorage() {
    const ctx = useContext(FriendlyStorageContext);
    if (!ctx) {
        throw new Error(
            'useUserAccessHashes must be used inside UserAccessHashesProvider',
        );
    }
    return ctx;
}
