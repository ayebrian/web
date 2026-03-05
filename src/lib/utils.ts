import {clsx, type ClassValue} from 'clsx';
import {twMerge} from 'tailwind-merge';

const OPEN_REFERENCE_LINK_BEGINING =
    'https://friendly-social.github.io/landing/#/%23?reference=';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function createFriendInviteLink(userId: number, token: string) {
    return `${OPEN_REFERENCE_LINK_BEGINING}/add/${userId}/${token}`;
}
