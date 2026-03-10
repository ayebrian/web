import {backendConfig} from '@/network/backend-config';
import {FileDescriptor} from '@/network/friendly-client';
import {clsx, type ClassValue} from 'clsx';
import {twMerge} from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function createFriendInviteLink(userId: number, token: string) {
    return `${backendConfig.landing}/landing/add/${userId}/${token}`;
}

export function createFileLink(descriptor: FileDescriptor): string {
    return `${backendConfig.prod}/files/download/${descriptor.id}/${descriptor.accessHash}`;
}
