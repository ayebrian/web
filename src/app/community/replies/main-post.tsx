import {Button} from '@/components/ui/button';
import {MainPostMenu} from '@/app/community/replies/main-post-menu';
import {Send, Loader2} from 'lucide-react';
import {cn} from '@/lib/utils';
import {users} from '@/services/users-service';
import {useAppContext} from '@/app.context';
import {Clock} from 'lucide-react';
import {useTranslations} from 'use-intl';
import {
    CommunityPostDetails,
    CommunityPostDetailsPlain,
} from '@/network/friendly-client';
import {StyledAvatar} from '@/components/styled-avatar';
import {createFileLink} from '@/lib/utils';
import {MarkdownArea} from '@/components/ui/markdown-area';
import {useNavigate} from 'react-router';
import {useFriendlyStorage} from '@/components/friendly-storage-provider';
import {RefObject, useEffect, useMemo} from 'react';

interface MainPostCardProps {
    post: CommunityPostDetails;
    inputRef: RefObject<HTMLTextAreaElement | null>;
    text: string;
    onTextChange: (text: string) => void;
    onSubmit: () => void;
    isSubmitting: boolean;
    onDelete: () => void;
    isDeleting: boolean;
}

export function MainPostCard({
    post,
    text,
    inputRef,
    onTextChange,
    onSubmit,
    isSubmitting,
    onDelete,
    isDeleting,
}: MainPostCardProps) {
    function onKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (isSubmitting) return;
        if (event.key === 'Enter' && !event.shiftKey && !isMobile()) {
            event.preventDefault();
            if (!event.currentTarget.value.trim()) return;
            void onSubmit();
        }
    }

    useEffect(() => {
        const reply = inputRef.current;
        if (reply) {
            reply.style.height = 'auto';
            reply.style.height = `${reply.scrollHeight}px`;
        }
    }, [text]);

    const t = useTranslations('replies');
    const app = useAppContext();
    const selfQuery = users.useSelf(app);
    const selfAvatarUrl = useMemo(
        () =>
            selfQuery.data?.user?.avatar
                ? createFileLink(selfQuery.data.user.avatar)
                : '',
        [selfQuery],
    );

    let card;
    if (isDeleting) {
        card = <MainPostCardLoading />;
    } else
        switch (post.type) {
            case 'plain':
                card = (
                    <MainPostCardPlain
                        post={post}
                        onDelete={onDelete}
                        isAuthor={selfQuery.data?.user?.id === post.owner.id}
                    />
                );
                break;
            case 'deleted':
                card = <MainPostCardDeleted />;
                break;
        }

    return (
        <div>
            {card}
            <div className="h-2" />
            <div className="flex bg-card rounded-xl border border-border flex-row gap-2 px-2 py-1">
                <StyledAvatar
                    avatarClassName="mt-1 w-8 h-8"
                    src={selfAvatarUrl}
                    nickname={selfQuery.data?.user?.nickname ?? ''}
                />
                <textarea
                    ref={inputRef}
                    className={cn(
                        'w-full content-center',
                        'text-sm outline-none resize-none',
                        'scroll-m-60',
                    )}
                    id="reply"
                    value={text}
                    onKeyDown={onKeyDown}
                    onChange={e => onTextChange(e.target.value)}
                    placeholder={t('reply-placeholder')}
                />
                <Button
                    className="mt-1 w-8 h-8"
                    onClick={() => void onSubmit()}
                    disabled={!text.trim() || isSubmitting}
                >
                    {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Send />
                    )}
                </Button>
            </div>
            <div className="h-4" />
        </div>
    );
}

function MainPostCardLoading() {
    return (
        <div className="bg-card rounded-xl border border-border p-4 cursor-pointer">
            <Loader2 className="m-auto animate-spin text-muted-foreground" />
        </div>
    );
}

export interface MainPostCardPlainProps {
    post: CommunityPostDetailsPlain;
    onDelete: () => void;
    isAuthor: boolean;
}

function MainPostCardPlain({post, onDelete, isAuthor}: MainPostCardPlainProps) {
    const t = useTranslations('post');
    const navigate = useNavigate();
    const storage = useFriendlyStorage();

    const avatarUrl = post.owner.avatar
        ? createFileLink(post.owner.avatar)
        : undefined;
    const postTime = new Date(post.instant);

    async function navigateProfile(event: React.MouseEvent) {
        event.stopPropagation();
        await storage.userAccessHashes.save({
            id: post.owner.id,
            accessHash: post.owner.accessHash,
        });
        await navigate(`/user/${post.owner.id}`);
    }

    return (
        <div className="bg-card rounded-xl border border-border p-4 cursor-pointer">
            <div className="flex gap-3">
                <StyledAvatar
                    avatarClassName="w-10 h-10 cursor-pointer"
                    onClick={event => void navigateProfile(event)}
                    src={avatarUrl}
                    nickname={post.owner.nickname}
                />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <p
                            className="font-semibold text-foreground truncate cursor-pointer"
                            onClick={event => void navigateProfile(event)}
                        >
                            {post.owner.nickname}
                        </p>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                            <Clock className="h-3 w-3" />
                            {formatTimeAgo(t, postTime)}
                        </span>
                        <div className="flex-1" />
                        <MainPostMenu
                            onDelete={onDelete}
                            showDelete={isAuthor}
                        />
                    </div>
                    <div className="text-foreground break-words">
                        <MarkdownArea text={post.text} />
                    </div>
                </div>
            </div>
        </div>
    );
}

// todo: when deleted if no replies, delete completely
function MainPostCardDeleted() {
    const t = useTranslations('post');
    return (
        <div className="bg-card rounded-xl border border-border p-4 cursor-pointer">
            <p className="italic text-foreground truncate cursor-pointer">
                {t('deleted')}
            </p>
        </div>
    );
}

function formatTimeAgo(
    t: ReturnType<typeof useTranslations<'post'>>,
    date: Date,
) {
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

function isMobile(): boolean {
    if (
        'userAgentData' in navigator &&
        typeof navigator.userAgentData === 'object' &&
        navigator.userAgentData !== null &&
        'mobile' in navigator.userAgentData
    ) {
        return !!navigator.userAgentData.mobile;
    }
    return false;
}
