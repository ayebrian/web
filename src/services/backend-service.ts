import {getCookie, setCookie} from '@/lib/cookies';
import {FriendlyClient} from '@/network/friendly-client';

export class BackendService {
    constructor(private client: FriendlyClient) {}

    /**
     * Try to restore auth from cookies if possible.
     *
     * @returns true if auth restored successfully.
     */
    restoreAuthorizationIsPossible(): boolean {
        const userId = getCookie<string>('userId');
        const authToken = getCookie<string>('token');

        if (userId === null || authToken === null) {
            return false;
        }

        this.client.setAuthToken(authToken, userId);
        return true;
    }

    storeAuthorization(token: string, userId: string) {
        this.client.setAuthToken(token, userId);

        setCookie('token', token);
        setCookie('userId', userId);
    }

    async getUserDetails() {
        return await this.client.getUserDetails();
    }

    async generateAccount(
        nickname: string,
        description: string,
        interests: string[],
        avatar: string | null,
        socialLink: string | null,
    ) {
        return this.client.generateAccount({
            nickname,
            description,
            interests,
            avatar,
            socialLink,
        });
    }
}
