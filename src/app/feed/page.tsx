import {useAppContext} from '@/app.context';
import {FeedQueueResponse} from '@/network/friendly-client';
import {useQueryClient} from '@tanstack/react-query';
import {forceUnwrap} from '@/network/result';
import {users} from '@/services/users-service';
import {Button} from '@/components/ui/button';
import {useEmailBindingSuggestion} from '@/lib/email-binding-suggestion';
import {FeedItem} from '@/network/friendly-client';
import {Activity, BookUser, Loader2} from 'lucide-react';
import {useCallback, useState} from 'react';
import {useTranslations} from 'use-intl';
import {EditProfileDialog} from '@/app/edit/dialog';
import {SuggestEmailBindingDialog} from '@/app/suggest-email-binding-dialog';
import {FeedDialog} from '@/app/feed/feed-dialog';
import {useBackend} from '@/backend.context';
import {useQuery} from '@tanstack/react-query';
import {toast} from 'sonner';
import {cn} from '@/lib/utils';

export type SwipeDirection = 'left' | 'right';

function FeedEmptyState() {
    const t = useTranslations('profile.feed');

    return (
        <div className="h-full flex flex-col items-center justify-center gap-2 px-6 text-center">
            <BookUser className="w-12 h-12 text-muted-foreground" />
            <p className="text-base font-semibold text-foreground">
                {t('empty_title')}
            </p>
            <p className="max-w-xs text-sm text-muted-foreground">
                {t('empty_desc')}
            </p>
        </div>
    );
}

export default function FeedPage() {
    const t = useTranslations('profile.feed');

    const backend = useBackend();
    const queryClient = useQueryClient();

    const feedQuery = useQuery({
        queryKey: ['feedQueue'],
        queryFn: async () => forceUnwrap(await backend.getFeedQueue()),
    });
    const selectedCard = feedQuery.data?.entries?.[0];

    const [loading, setLoading] = useState(false);

    const app = useAppContext();
    const self = users.useSelf(app);

    const {
        status: emailSuggestionStatus,
        setStatus: setEmailSuggestionStatus,
        trackSwipe,
    } = useEmailBindingSuggestion();

    const onReview = useCallback(
        async (card: FeedItem, direction: SwipeDirection) => {
            const request = {
                userId: card.details.id,
                userAccessHash: card.details.accessHash,
            };

            const result =
                direction === 'right'
                    ? await backend.sendFriendRequest(request)
                    : await backend.declineFriendRequest(request);

            if (!result.ok) {
                toast.error(t('error-connection'));
            }
        },
        [backend],
    );

    const handleReview = async (direction: SwipeDirection) => {
        if (!selectedCard || loading) return;

        if (feedQuery.data === undefined) {
            throw new Error(
                'Selected card should not be true-ish without query data',
            );
        }

        setLoading(true);

        if (self.data) {
            trackSwipe(self.data.user.email);
        }

        try {
            await onReview(selectedCard, direction);
            await new Promise(resolve => setTimeout(resolve, 150));
            queryClient.setQueryData<FeedQueueResponse>(
                ['feedQueue'],
                response => {
                    if (response === undefined) {
                        throw new Error(
                            "Shouldn't be executing onReview without response",
                        );
                    }
                    return {
                        entries: response.entries.filter(
                            item => item.details.id !== selectedCard.details.id,
                        ),
                    };
                },
            );
        } finally {
            setLoading(false);
        }
    };

    const onRetry = () => {
        void feedQuery.refetch();
    };

    if (feedQuery.isPending) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (feedQuery.isError) {
        return (
            <div className="flex h-full flex-col items-center justify-center rounded-xl border border-destructive/30 bg-card px-6 text-center">
                <Activity className="h-8 w-8 text-destructive" />
                <p className="mt-4 text-sm text-foreground">
                    {t('error-connection')}
                </p>
                <Button className="mt-5 cursor-pointer" onClick={onRetry}>
                    {t('retry')}
                </Button>
            </div>
        );
    }

    if (selectedCard === undefined) {
        return <FeedEmptyState />;
    }

    return (
        <div className="w-full min-h-full sm:p-4 flex flex-col justify-center items-center">
            <div
                className={cn(
                    'min-h-full w-full shrink-0 sm:w-90 md:w-110',
                    'sm:rounded-2xl bg-card',
                    'transition-[width] duration-300 ease-in-out',
                )}
            >
                {selectedCard && (
                    <FeedDialog
                        selectedCard={selectedCard}
                        loading={loading}
                        handleReview={direction => void handleReview(direction)}
                    />
                )}
            </div>
            <SuggestEmailBindingDialog
                status={emailSuggestionStatus}
                setStatus={setEmailSuggestionStatus}
            />
            <EditProfileDialog
                open={emailSuggestionStatus === 'accepted'}
                setOpen={isOpen => {
                    if (!isOpen) setEmailSuggestionStatus('declined');
                }}
            />
        </div>
    );
}
