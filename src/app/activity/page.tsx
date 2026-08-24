import {useBackend} from '@/backend.context';
import {useNavigate} from 'react-router';
import {MarkdownSpan} from '@/components/ui/markdown-span';
import {StyledAvatar} from '@/components/styled-avatar';
import {createFileLink} from '@/lib/utils';
import {forceUnwrap} from '@/network/result';
import {Button} from '@/components/ui/button';
import {useInfiniteQuery} from '@tanstack/react-query';
import {Loader2, AlertCircle, Inbox, Clock} from 'lucide-react';
import {useTranslations} from 'use-intl';
import {ActivityDetails, ActivityDetailsReply} from '@/network/friendly-client';

// todo: add instants + sticky headers
export function ActivityPage() {
    const t = useTranslations('activity');
    const backend = useBackend();

    const activityQuery = useInfiniteQuery({
        queryKey: ['activity'],
        queryFn: async ({pageParam}) => {
            const activity = await backend.activityList({cursorId: pageParam});
            return forceUnwrap(activity);
        },
        initialPageParam: null as string | null,
        getNextPageParam: lastPage => lastPage.nextId,
    });

    const loadMore = () => {
        if (activityQuery.hasNextPage && !activityQuery.isFetchingNextPage) {
            void activityQuery.fetchNextPage();
        }
    };

    let content;

    if (activityQuery.isPending) {
        content = (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
            </div>
        );
    } else if (activityQuery.isError) {
        content = (
            <div className="flex flex-col h-[50vh] gap-4 w-full items-center justify-center">
                <AlertCircle className="h-10 w-10 animate-pulse text-foreground/80" />
                <p className="text-center">
                    {activityQuery.error?.message ?? t('unknown-error')}
                </p>
                <Button
                    variant="outline"
                    className="mt-2"
                    onClick={() => void activityQuery.refetch()}
                >
                    {t('retry')}
                </Button>
            </div>
        );
    } else {
        const pages = activityQuery.data?.pages ?? [];
        const activity = pages.flatMap(p => p.data);

        if (activity.length === 0) {
            content = (
                <div className="flex flex-col h-full gap-2 w-full items-center justify-center px-6 text-center">
                    <Inbox className="w-12 h-12 text-muted-foreground" />
                    <p className="text-base font-semibold text-foreground">
                        {t('empty-title')}
                    </p>
                    <p className="max-w-xs text-sm text-muted-foreground">
                        {t('empty-desc')}
                    </p>
                </div>
            );
        } else {
            content = (
                <div className="w-full flex flex-col gap-4">
                    {activity.map(details => (
                        <ActivityCard key={details.id} details={details} />
                    ))}
                </div>
            );
        }
    }

    return (
        <div className="flex flex-col h-full items-center w-full max-w-2xl mx-auto p-4 gap-4">
            {content}
            <div hidden={!activityQuery.hasNextPage}>
                <Button
                    variant="ghost"
                    className="text-accent-foreground hover:cursor-pointer"
                    onClick={loadMore}
                    disabled={activityQuery.isFetchingNextPage}
                >
                    {activityQuery.isFetchingNextPage ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        'Load more'
                    )}
                </Button>
            </div>
        </div>
    );
}

interface ActivityCardProps {
    details: ActivityDetails;
}

function ActivityCard({details}: ActivityCardProps) {
    let content;

    switch (details.type) {
        case 'reply':
            content = <ReplyActivityCard details={details} />;
            break;
    }

    return (
        <div className="bg-card rounded-xl border border-border cursor-pointer">
            {content}
        </div>
    );
}

export interface ReplyActivityCardProps {
    details: ActivityDetailsReply;
}

function ReplyActivityCard({details}: ReplyActivityCardProps) {
    const t = useTranslations('activity');
    const navigate = useNavigate();
    const avatar = details.post.owner.avatar
        ? createFileLink(details.post.owner.avatar)
        : undefined;
    const text = t.rich('reply', {
        nickname: details.post.owner.nickname,
        b: text => <strong>{text}</strong>,
    });
    async function navigatePost() {
        await navigate(`/community/${details.post.id}/replies`);
    }
    return (
        <div
            className="flex gap-2 items-center m-4"
            onClick={() => void navigatePost()}
        >
            <StyledAvatar
                avatarClassName="w-10 h-10"
                nickname={details.post.owner.nickname}
                src={avatar}
            />
            <span className="line-clamp-2 text-foreground break-words">
                {text} "
                <MarkdownSpan text={details.post.text} />"
            </span>
            <div className="flex-1" />
            <span className="flex items-center gap-1 text-sm text-muted-foreground whitespace-nowrap">
                <Clock className="h-3 w-3" />
                {formatTimeAgo(t, details.instant)}
            </span>
        </div>
    );
}

function formatTimeAgo(
    t: ReturnType<typeof useTranslations<'activity'>>,
    iso8601: string,
) {
    const date = new Date(iso8601);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return t('just_now');
    if (diffMins < 60) return t('minutes_ago', {count: diffMins});
    if (diffHours < 24) return t('hours_ago', {count: diffHours});
    if (diffDays < 7) return t('days_ago', {count: diffDays});
    return date.toLocaleDateString();
}
