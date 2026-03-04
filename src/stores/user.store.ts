import { create } from 'zustand'
import { UserDetailsResponse } from '@/network/friendly-client'
import { removeCookie } from '@/lib/cookies'

interface UserState {
    user: UserDetailsResponse | null
    loading: boolean
    load: (backend: any, onUnauthorized: () => void) => Promise<void>
    logout: (router: any) => void
}

export const useUserStore = create<UserState>((set) => ({
    user: null,
    loading: true,

    load: async (backend, onUnauthorized) => {
        const isAuthenticated = backend.restoreAuthorizationIsPossible()

        if (!isAuthenticated) {
            onUnauthorized()
            return
        }

        const details = await backend.getUserDetails()

        set({
            user: details,
            loading: false
        })
    },

    logout: (router) => {
        removeCookie('userId')
        removeCookie('token')
        set({ user: null })
        router.push('/signIn')
    }
}))