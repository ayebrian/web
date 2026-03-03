import {getCookie} from '@/lib/cookies';
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

    async getUserDetails() {
        return await this.client.getUserDetails();
    }
}
