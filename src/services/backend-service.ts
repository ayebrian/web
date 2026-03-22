import {getCookie, removeCookie, setCookie} from '@/lib/cookies';
import {
    FileDescriptor,
    FriendlyClient,
    NetworkDetailsResponse,
} from '@/network/friendly-client';

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

    clearAuthorization() {
        this.client.setAuthToken(null, null);
        removeCookie('token');
        removeCookie('userId');
    }

    async getUserDetails() {
        return await this.client.getUserDetails();
    }

    async generateAccount(
        nickname: string,
        description: string,
        interests: string[],
        avatar: FileDescriptor | null,
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

    async generateFriendInvitationToken(): Promise<string | null> {
        const result = await this.client.generateFriendInvitationToken();
        return result.token;
    }

    async getNetworkDetails(): Promise<NetworkDetailsResponse> {
        return this.client.getNetworkDetails();
    }

    async uploadFile(file: File): Promise<FileDescriptor> {
        return this.client.uploadFile(file);
    }
}
