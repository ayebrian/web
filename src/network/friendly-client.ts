import axios, {AxiosError, AxiosInstance} from 'axios';
import {UnauthorizedError, UnknownError} from '@/network/errors';
import {backendConfig} from './backend-config';

export interface FriendlyClient {
    setAuthToken(token: string | null, userId: string | null): void;
    generateAccount(
        request: GenerateAccountRequest,
    ): Promise<GenerateAccountResponse>;
    getUserDetails(): Promise<UserDetailsResponse>;
    getUserDetailsById(
        id: number,
        accessHash: string,
    ): Promise<UserDetailsResponse>;
    uploadFile(file: File): Promise<FileDescriptor>;
    downloadFile(id: number, accessHash: string): Promise<Blob>;
    generateFriendInvitationToken(): Promise<GenerateFriendInvitationTokenResponse>;
    addFriend(request: AddFriendRequest): Promise<string>;
    sendFriendRequest(request: SendFriendRequest): Promise<void>;
    declineFriendRequest(request: DeclineFriendRequest): Promise<void>;
    getNetworkDetails(): Promise<NetworkDetailsResponse>;
    getFeedQueue(): Promise<FeedQueueResponse>;
}

export class FriendlyClientImpl implements FriendlyClient {
    private client: AxiosInstance;
    private baseUrl: string;
    private authToken: string | null = null;

    constructor(baseUrl: string = backendConfig.prod) {
        this.baseUrl = baseUrl;
        this.client = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'Content-Type': 'application/json',
            },
        });
        this.client.interceptors.response.use(
            response => response,
            (error: AxiosError) => {
                if (error.response) {
                    const status = error.response.status;

                    if (status === 401) {
                        return Promise.reject(new UnauthorizedError());
                    }

                    return Promise.reject(
                        new UnknownError(
                            `status = ${status}, data = ${error.response.data}`,
                        ),
                    );
                }

                // if (error.request) {
                //     return Promise.reject(new NetworkError());
                // }

                return Promise.reject(new UnknownError(error.message));
            },
        );
    }

    setAuthToken(token: string | null, userId: string | null) {
        this.authToken = token;
        if (token) {
            this.client.defaults.headers.common['X-User-Id'] = userId;
            this.client.defaults.headers.common['X-Token'] = token;
        } else {
            delete this.client.defaults.headers.common['X-User-Id'];
            delete this.client.defaults.headers.common['X-Token'];
        }
    }

    async generateAccount(
        request: GenerateAccountRequest,
    ): Promise<GenerateAccountResponse> {
        const response = await this.client.post<GenerateAccountResponse>(
            '/auth/generate',
            request,
        );
        return response.data;
    }

    async getUserDetails(): Promise<UserDetailsResponse> {
        if (!this.authToken) {
            throw new Error(
                'Authorization token is required for this endpoint.',
            );
        }
        const response =
            await this.client.get<UserDetailsResponse>('/users/details');
        return response.data;
    }

    async getUserDetailsById(
        id: number,
        accessHash: string,
    ): Promise<UserDetailsResponse> {
        const response = await this.client.get<UserDetailsResponse>(
            `/users/details/${id}/${accessHash}`,
        );
        return response.data;
    }

    async uploadFile(file: File): Promise<FileDescriptor> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await this.client.post<FileDescriptor>(
            '/files/upload',
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            },
        );
        return response.data;
    }

    async downloadFile(id: number, accessHash: string): Promise<Blob> {
        const response = await this.client.get<Blob>(
            `/files/download/${id}/${accessHash}`,
            {
                responseType: 'blob',
            },
        );
        return response.data;
    }

    async generateFriendInvitationToken(): Promise<GenerateFriendInvitationTokenResponse> {
        if (!this.authToken) {
            throw new Error(
                'Authorization token is required for this endpoint.',
            );
        }
        const response =
            await this.client.post<GenerateFriendInvitationTokenResponse>(
                '/friends/generate',
            );
        return response.data;
    }

    async addFriend(request: AddFriendRequest): Promise<string> {
        if (!this.authToken) {
            throw new Error(
                'Authorization token is required for this endpoint.',
            );
        }
        const response = await this.client.post<string>(
            '/friends/add',
            request,
        );
        return response.data;
    }

    async sendFriendRequest(request: SendFriendRequest): Promise<void> {
        if (!this.authToken) {
            throw new Error(
                'Authorization token is required for this endpoint.',
            );
        }
        await this.client.post('/friends/request', request);
    }

    async declineFriendRequest(request: DeclineFriendRequest): Promise<void> {
        if (!this.authToken) {
            throw new Error(
                'Authorization token is required for this endpoint.',
            );
        }
        await this.client.post('/friends/decline', request);
    }

    async getNetworkDetails(): Promise<NetworkDetailsResponse> {
        if (!this.authToken) {
            throw new Error(
                'Authorization token is required for this endpoint.',
            );
        }
        const response =
            await this.client.get<NetworkDetailsResponse>('/network/details');
        return response.data;
    }

    async getFeedQueue(): Promise<FeedQueueResponse> {
        if (!this.authToken) {
            throw new Error(
                'Authorization token is required for this endpoint.',
            );
        }
        const response =
            await this.client.get<FeedQueueResponse>('/feed/queue');
        return response.data;
    }
}

export interface GenerateAccountRequest {
    nickname: string;
    description: string;
    interests: string[];
    avatar: string | null;
    socialLink: string | null;
}

export interface GenerateAccountResponse {
    token: string;
    id: number;
    accessHash: string;
}

export interface UserDetailsResponse {
    id: number;
    accessHash: string;
    nickname: string;
    description: string;
    interests: string[];
    avatar: FileDescriptor | null;
    socialLink: string | null;
}

export interface FileDescriptor {
    id: number;
    accessHash: string;
}

export interface GenerateFriendInvitationTokenResponse {
    token: string;
}

export interface AddFriendRequest {
    token: string;
    userId: number;
}

export interface SendFriendRequest {
    userId: number;
    userAccessHash: string;
}

export interface DeclineFriendRequest {
    userId: number;
    userAccessHash: string;
}

export interface NetworkDetailsResponse {
    friends: UserDetailsResponse[];
}

export interface FeedItem {
    id: number;
    type: string;
    // content: Record<string, any>; // Content can be any JSON object
}

export interface FeedQueueResponse {
    items: FeedItem[];
}
