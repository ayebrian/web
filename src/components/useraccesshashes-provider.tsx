import {UserAccessHashesService} from '@/services/useraccesshashes-service';
import {createContext, useContext, useEffect, useMemo, useState} from 'react';

interface UserAccessHashesContextValue {
    service: UserAccessHashesService;
}

const UserAccessHashesContext =
    createContext<UserAccessHashesContextValue | null>(null);

// We forcing this hook to skip initialization on server,
// to prevent hydration errors
export function UserAccessHashesProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const value = useMemo<UserAccessHashesContextValue | null>(() => {
        if (!isMounted) return null;
        return {
            service: new UserAccessHashesService(),
        };
    }, [isMounted]);

    if (!isMounted || !value) return null;

    return (
        <UserAccessHashesContext.Provider value={value}>
            {children}
        </UserAccessHashesContext.Provider>
    );
}

export function useUserAccessHashes() {
    const ctx = useContext(UserAccessHashesContext);
    if (!ctx) {
        throw new Error(
            'useUserAccessHashes must be used inside UserAccessHashesProvider',
        );
    }
    return ctx;
}
