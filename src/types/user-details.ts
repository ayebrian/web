import {FileDescriptor} from './file-descriptor';

export interface UserDetails {
    id: number;
    accessHash: string;
    nickname: string;
    email: string | null;
    description: string;
    interests: string[];
    avatar: FileDescriptor | null;
    socialLink: string | null;
    friendship: Friendship;
}

export type Friendship =
    | 'friends'
    | 'incomingRequest'
    | 'outgoingRequest'
    | 'outgoingDecline'
    | 'none';
