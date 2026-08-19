import {useCallback, useState} from 'react';

const STORAGE_KEY = 'feed-swipes';
const THRESHOLD = 20;

export type EmailBindingSuggestionStatus =
    | 'pending'
    | 'suggested'
    | 'declined'
    | 'accepted';

export interface EmailBindingSuggestion {
    status: EmailBindingSuggestionStatus;
    setStatus: (value: EmailBindingSuggestionStatus) => void;
    trackSwipe: (userEmail: string | null) => void;
}

export function useEmailBindingSuggestion(): EmailBindingSuggestion {
    const [status, setStatus] =
        useState<EmailBindingSuggestionStatus>('pending');

    const trackSwipe = useCallback((userEmail: string | null) => {
        const prev = parseInt(localStorage.getItem(STORAGE_KEY) ?? '0', 10);
        const next = prev + 1;
        localStorage.setItem(STORAGE_KEY, next.toString());
        if (!userEmail && prev < THRESHOLD && next >= THRESHOLD) {
            setStatus('suggested');
        }
    }, []);

    return {status, setStatus, trackSwipe};
}
