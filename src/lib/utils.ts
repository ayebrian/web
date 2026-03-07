import {FileDescriptor} from '@/network/friendly-client';
import {clsx, type ClassValue} from 'clsx';
import {twMerge} from 'tailwind-merge';

// TODO: Rework links generation, get backend url from single config
const DOWNLOAD_FILE_LINK_BEGINING = 'https://api.getfriend.ly/files/download';
const OPEN_REFERENCE_LINK_BEGINING =
    'https://friendly-social.github.io/landing/#/%23?reference=';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function createFriendInviteLink(userId: number, token: string) {
    return `${OPEN_REFERENCE_LINK_BEGINING}/add/${userId}/${token}`;
}

export function createFileLink(descriptor: FileDescriptor): string {
    return `${DOWNLOAD_FILE_LINK_BEGINING}/${descriptor.id}/${descriptor.accessHash}`;
}
