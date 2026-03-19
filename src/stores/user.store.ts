import {create} from 'zustand';
import {UserDetailsResponse} from '@/network/friendly-client';
import {removeCookie} from '@/lib/cookies';
import {BackendService} from '@/services/backend-service';
import {AppRouterInstance} from 'next/dist/shared/lib/app-router-context.shared-runtime';

interface UserState {
    user: UserDetailsResponse | null;
    inviteToken: string | null;
    status: 'idle' | 'loading' | 'error';
    load: (
        backend: BackendService,
        onUnauthorized: () => void,
    ) => Promise<void>;
    logout: (router: AppRouterInstance) => void;
}

export const useUserStore = create<UserState>(set => ({
    user: null,
    inviteToken: null,
    status: 'loading',

    load: async (backend, onUnauthorized) => {
        const isAuthenticated = backend.restoreAuthorizationIsPossible();

        if (!isAuthenticated) {
            onUnauthorized();
            return;
        }

        try {
            const details = await backend.getUserDetails();
            const inviteToken = await backend.generateFriendInvitationToken();

            set({
                user: details,
                inviteToken: inviteToken,
                status: 'idle',
            });
        } catch (error) {
            console.error(error);
            set({
                status: 'error',
            });
        }
    },

    logout: router => {
        removeCookie('userId');
        removeCookie('token');
        set({user: null});
        router.push('/signIn');
    },
}));
