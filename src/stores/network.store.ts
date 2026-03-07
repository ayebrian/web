import {UserDetailsResponse} from '@/network/friendly-client';
import {BackendService} from '@/services/backend-service';
import {create} from 'zustand';

interface NetworkState {
    friends: UserDetailsResponse[];
    loading: boolean;
    load: (backend: BackendService) => Promise<void>;
}

export const useNetworkStore = create<NetworkState>(set => ({
    friends: [],
    loading: true,

    load: async backend => {
        const isAuthenticated = backend.restoreAuthorizationIsPossible();

        if (!isAuthenticated) return;

        const networkDetails = await backend.getNetworkDetails();
        console.log(networkDetails);
        set({
            friends: networkDetails.friends,
            loading: false,
        });
    },
}));
