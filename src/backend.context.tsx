"use client"

import {createContext, useContext, useMemo} from "react";
import {BackendService} from "@/services/backend-service";
import {FriendlyClient, FriendlyClientImpl} from "@/network/friendly-client";

const BackendContext = createContext<BackendService | null>(null)

export function BackendProvider({ children }: { children: React.ReactNode }) {
    const service = useMemo(() => {
        const client: FriendlyClient = new FriendlyClientImpl();
        return new BackendService(client);
    }, []);

    return (
        <BackendContext.Provider value={service}>
            {children}
        </BackendContext.Provider>
    )
}

export function useBackend() {
    const ctx = useContext(BackendContext);
    if (!ctx) throw new Error("useBackend must be used inside BackendProvider");
    return ctx;
}