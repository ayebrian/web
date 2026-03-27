import {getCookie, removeCookie, setCookie} from '@/lib/cookies';
import {
    FileDescriptor,
    FriendlyClient,
    GenerateAccountResponse,
    NetworkDetailsResponse,
    UserDetailsResponse,
} from '@/network/friendly-client';
import {NetworkError} from '@/network/errors';
import {err, ok, Result} from '@/network/result';

export function formatNetworkError(error: NetworkError): string {
    switch (error.type) {
        case 'unauthorized':
            return `Unauthorized (status ${error.status})`;
        case 'network':
            return `Network error: ${error.message}`;
        case 'parse':
            return `Parse error: ${error.message}`;
        case 'unknown':
        default:
            return `Unknown error: ${error.message}`;
    }
}

export function mapResult<T, U>(
    result: Result<T, NetworkError>,
    map: (value: T) => U,
): Result<U, NetworkError> {
    return result.ok ? ok(map(result.data)) : err(result.error);
}

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

    async getUserDetails(): Promise<Result<UserDetailsResponse, NetworkError>> {
        return await this.client.getUserDetails();
    }

    async generateAccount(
        nickname: string,
        description: string,
        interests: string[],
        avatar: FileDescriptor | null,
        socialLink: string | null,
    ): Promise<Result<GenerateAccountResponse, NetworkError>> {
        return this.client.generateAccount({
            nickname,
            description,
            interests,
            avatar,
            socialLink,
        });
    }

    async generateFriendInvitationToken(): Promise<
        Result<string, NetworkError>
    > {
        const result = await this.client.generateFriendInvitationToken();
        return mapResult(result, data => data.token);
    }

    async getNetworkDetails(): Promise<
        Result<NetworkDetailsResponse, NetworkError>
    > {
        return await this.client.getNetworkDetails();
    }

    async uploadFile(
        file: File,
    ): Promise<Result<FileDescriptor, NetworkError>> {
        return await this.client.uploadFile(file);
    }
}
