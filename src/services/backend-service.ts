import {FileDescriptor} from '@/types/file-descriptor';
import {
    DeclineFriendRequest,
    FeedQueueResponse,
    FriendlyClient,
    GenerateAccountResponse,
    UserDetailsResponse,
    CommunityPostRequest,
    CommunityListRequest,
    CommunityListResponse,
    CommunityRepliesRequest,
    CommunityRepliesResponse,
    CommunityDetailsRequest,
    CommunityDetailsResponse,
    ActivityListRequest,
    ActivityListResponse,
    NetworkDetailsResponse,
    SendFriendRequest,
    CommunityPostDescriptor,
} from '@/network/friendly-client';
import {NetworkError} from '@/network/errors';
import {err, ok, Result} from '@/network/result';

// FIXME: this is not localized
export function formatNetworkError(error: NetworkError): string {
    switch (error.type) {
        case 'unauthorized':
            return `Unauthorized (status ${error.status})`;
        case 'network':
            return `Network error: ${error.message}`;
        case 'parse':
            return `Parse error: ${error.message}`;
        case 'status':
            return `Status: ${error.status}`;
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
    restoreAuthorizationIfPossible(): boolean {
        const userId = localStorage.getItem('userId');
        const authToken = localStorage.getItem('token');

        if (userId === null || authToken === null) {
            return false;
        }

        this.client.setAuthToken(authToken, userId);
        return true;
    }

    storeAuthorization(token: string, userId: string) {
        this.client.setAuthToken(token, userId);

        localStorage.setItem('userId', userId);
        localStorage.setItem('token', token);
    }

    clearAuthorization() {
        this.client.setAuthToken(null, null);
        localStorage.removeItem('userId');
        localStorage.removeItem('token');
    }

    async getUserDetails2(): Promise<
        Result<UserDetailsResponse, NetworkError>
    > {
        return await this.client.getUserDetails2();
    }

    async getUserDetailsById2(
        id: number,
        accessHash: string,
    ): Promise<Result<UserDetailsResponse, NetworkError>> {
        return this.client.getUserDetailsById2(id, accessHash);
    }

    usersEdit: typeof this.client.usersEdit = (...args) => {
        return this.client.usersEdit(...args);
    };

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

    friendsGenerateForce: typeof this.client.friendsGenerateForce = (
        ...args
    ) => {
        return this.client.friendsGenerateForce(...args);
    };

    async getNetworkDetails(): Promise<
        Result<NetworkDetailsResponse, NetworkError>
    > {
        return await this.client.getNetworkDetails();
    }

    async getFeedQueue(): Promise<Result<FeedQueueResponse, NetworkError>> {
        return await this.client.getFeedQueue();
    }

    emailLink: typeof this.client.emailLink = (...args) => {
        return this.client.emailLink(...args);
    };

    emailConfirm: typeof this.client.emailConfirm = (...args) => {
        return this.client.emailConfirm(...args);
    };

    emailUnlink: typeof this.client.emailUnlink = (...args) => {
        return this.client.emailUnlink(...args);
    };

    authEmail: typeof this.client.authEmail = (...args) => {
        return this.client.authEmail(...args);
    };

    authLogin: typeof this.client.authLogin = (...args) => {
        return this.client.authLogin(...args);
    };

    authFirebase: typeof this.client.authFirebase = (...args) => {
        return this.client.authFirebase(...args);
    };

    addFriend: typeof this.client.addFriend = (...args) => {
        return this.client.addFriend(...args);
    };

    async sendFriendRequest(
        request: SendFriendRequest,
    ): Promise<Result<void, NetworkError>> {
        return await this.client.sendFriendRequest(request);
    }

    async declineFriendRequest(
        request: DeclineFriendRequest,
    ): Promise<Result<void, NetworkError>> {
        return await this.client.declineFriendRequest(request);
    }

    async uploadFile(
        file: File,
    ): Promise<Result<FileDescriptor, NetworkError>> {
        return await this.client.uploadFile(file);
    }

    async communityPost(
        request: CommunityPostRequest,
    ): Promise<Result<CommunityPostDescriptor, NetworkError>> {
        return this.client.communityPost(request);
    }

    async communityList(
        request: CommunityListRequest,
    ): Promise<Result<CommunityListResponse, NetworkError>> {
        return this.client.communityList(request);
    }

    async communityDetails(
        request: CommunityDetailsRequest,
    ): Promise<Result<CommunityDetailsResponse, NetworkError>> {
        return this.client.communityDetails(request);
    }

    async communityReplies(
        request: CommunityRepliesRequest,
    ): Promise<Result<CommunityRepliesResponse, NetworkError>> {
        return this.client.communityReplies(request);
    }

    async activityList(
        request: ActivityListRequest,
    ): Promise<Result<ActivityListResponse, NetworkError>> {
        return this.client.activityList(request);
    }
}
