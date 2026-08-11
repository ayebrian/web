import {UserAccessHashesService} from '@/services/useraccesshashes-service';
import {CommunityPostsService} from '@/services/community-posts-service';
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
    const value = useMemo<FriendlyStorage>(() => {
        return {
            userAccessHashes: new UserAccessHashesService(),
            communityPosts: new CommunityPostsService(),
        };
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
