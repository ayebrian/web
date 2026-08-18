import {useBackend} from '@/backend.context';
import {communityPosts} from '@/services/community-posts-service';
import {CommunityPostId} from '@/network/friendly-client';
import {users} from '@/services/users-service';
import {
    CommunityDetailsResponse,
    CommunityPostDescriptor,
    CommunityPostDetails,
} from '@/network/friendly-client';
import {Button} from '@/components/ui/button';
import {forceUnwrap} from '@/network/result';
import {cn} from '@/lib/utils';
import {
    useInfiniteQuery,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';
import {Loader2, MessageCircle, AlertCircle, Clock, Send} from 'lucide-react';
import {useTranslations} from 'use-intl';
import React, {
    useRef,
    useState,
    useCallback,
    useMemo,
    useEffect,
    RefObject,
} from 'react';
import {toast} from 'sonner';
import {StyledAvatar} from '@/components/styled-avatar';
import {createFileLink} from '@/lib/utils';
import {MarkdownArea} from '@/components/ui/markdown-area';
import {useNavigate, useParams} from 'react-router';
import {CommunityPostCard} from '../post';
import {useFriendlyStorage} from '@/components/friendly-storage-provider';
import {useAppContext} from '@/app.context';

export function RepliesPage() {
    const t = useTranslations('replies');
    const navigate = useNavigate();
    const app = useAppContext();

    const {id} = useParams();
    const idInt = id ? (Number(id) as CommunityPostId) : null;
    useEffect(() => {
        if (idInt === null || Number.isNaN(idInt)) {
            void navigate('/not-found');
        }
    }, [idInt]);
    if (!idInt) return;

    const replyTo = communityPosts.useDetails(app, idInt);

    let content;

    if (replyTo.fetch === 'loading') {
        content = (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
            </div>
        );
    } else if (replyTo.cache !== 'ok') {
        content = (
            <div className="flex flex-col h-[50vh] gap-4 w-full items-center justify-center">
                <AlertCircle className="h-10 w-10 animate-pulse text-foreground/80" />
                <p className="text-center">{t('unknown_error')}</p>
                <Button
                    variant="outline"
                    className="mt-2"
                    onClick={() => void communityPosts.refetch(app, idInt)}
                >
                    {t('retry')}
                </Button>
            </div>
        );
    } else {
        content = <ReplyContent id={idInt} replyTo={replyTo.data!} />;
    }

    return (
        <div className="flex flex-col w-full max-w-2xl mx-auto px-4 py-4">
            {content}
        </div>
    );
}

interface ReplyContentProps {
    id: CommunityPostId;
    replyTo: CommunityDetailsResponse;
}

function ReplyContent({id, replyTo}: ReplyContentProps) {
    const backend = useBackend();
    const app = useAppContext();
    const queryClient = useQueryClient();
    const storage = useFriendlyStorage();
    const navigate = useNavigate();
    const t = useTranslations('replies');

    const upstreamRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const upstream = upstreamRef.current;
        if (upstream && replyTo.replies.data.length > 0) {
            upstream.scrollIntoView({
                behavior: 'instant',
                block: 'start',
                inline: 'nearest',
            });
        }
        const input = inputRef.current;
        if (input && replyTo.replies.data.length === 0) {
            input.scrollIntoView({
                behavior: 'instant',
                block: 'end',
                inline: 'nearest',
            });
        }
    }, [id]);

    const [newPostText, setNewPostText] = useState('');

    const postsQuery = useInfiniteQuery({
        queryKey: ['communityReplies', id],
        queryFn: async ({pageParam}: {pageParam: string | null}) => {
            const result = await backend.communityReplies({
                id: id,
                accessHash: replyTo.post.accessHash,
                cursorId: pageParam,
            });
            return forceUnwrap(result);
        },
        initialData: {
            pages: [replyTo.replies],
            pageParams: [null],
        },
        initialPageParam: null,
        getNextPageParam: lastPage => lastPage.nextId,
    });

    const pages = postsQuery.data?.pages ?? [];
    const posts = pages.flatMap(p => p.data);

    const loadMore = () => {
        if (postsQuery.hasNextPage && !postsQuery.isFetchingNextPage) {
            void postsQuery.fetchNextPage();
        }
    };

    const createPostMutation = useMutation({
        mutationFn: async (text: string) => {
            const post = {
                replyTo: {
                    id: id,
                    accessHash: replyTo.post.accessHash,
                },
                text,
            };
            const result = await backend.communityPost(post);
            return {
                post: {
                    ...post,
                    ...forceUnwrap(result),
                    instant: new Date().toISOString(),
                    owner: (await users.ensureSelf(app)).user,
                },
                replies: {data: [], nextId: null},
                upstream: [...replyTo.upstream, replyTo.post],
            } satisfies CommunityDetailsResponse;
        },
        onSuccess: async details => {
            void queryClient.invalidateQueries({
                queryKey: ['communityReplies', id],
            });
            communityPosts.setDetails(app, details);
            setNewPostText('');
            await navigateReplies(details.post);
        },
        onError: error => {
            toast.error(error.message ?? t('post_create_error'));
        },
    });

    async function navigateReplies(descriptor: CommunityPostDescriptor) {
        await storage.communityPosts.save({
            id: descriptor.id,
            accessHash: descriptor.accessHash,
        });
        await navigate(`/community/${descriptor.id}/replies`, {
            replace: true,
        });
    }

    const handleCreatePost = useCallback(async () => {
        if (!newPostText.trim()) return;
        await createPostMutation.mutateAsync(newPostText);
    }, [newPostText, createPostMutation]);

    let upstream;

    if (replyTo.upstream.length > 0) {
        upstream = (
            <>
                <div className="flex flex-col gap-2">
                    {replyTo.upstream.map(post => (
                        <CommunityPostCard
                            key={post.id}
                            post={post}
                            minimize={true}
                            replyReplace={true}
                        />
                    ))}
                    <div
                        ref={upstreamRef}
                        className="text-sm font-semibold uppercase text-foreground scroll-m-10"
                    />
                </div>
            </>
        );
    } else {
        upstream = null;
    }

    let replies;

    if (posts.length === 0) {
        replies = (
            <div className="flex flex-col gap-2 mt-6 w-full items-center justify-center px-6 text-center">
                <MessageCircle className="w-12 h-12 text-muted-foreground" />
                <p className="text-base font-semibold text-foreground">
                    {t('no-replies')}
                </p>
                <p className="max-w-xs text-sm text-muted-foreground">
                    {t('no-replies-desc')}
                </p>
                <div className="h-[50dvh] w-full" />
            </div>
        );
    } else {
        replies = (
            <div className="w-full min-h-[70dvh] flex flex-col gap-4">
                <p className="text-sm font-semibold uppercase text-foreground">
                    {t('replies')}
                </p>
                {posts.map(post => (
                    <CommunityPostCard
                        key={post.id}
                        post={post}
                        minimize={false}
                        replyReplace={true}
                    />
                ))}
            </div>
        );
    }

    return (
        <div>
            {upstream}
            <MainPostCard
                text={newPostText}
                inputRef={inputRef}
                onTextChange={setNewPostText}
                onSubmit={handleCreatePost}
                isSubmitting={createPostMutation.isPending}
                post={replyTo.post}
            />
            {replies}
            <div hidden={!postsQuery.hasNextPage}>
                <Button
                    variant="ghost"
                    className="text-accent-foreground hover:cursor-pointer"
                    onClick={loadMore}
                    disabled={postsQuery.isFetchingNextPage}
                >
                    {postsQuery.isFetchingNextPage ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        t('load-more')
                    )}
                </Button>
            </div>
        </div>
    );
}

interface MainPostCardProps {
    post: CommunityPostDetails;
    inputRef: RefObject<HTMLTextAreaElement | null>;
    text: string;
    onTextChange: (text: string) => void;
    onSubmit: () => Promise<void>;
    isSubmitting: boolean;
}

function MainPostCard({
    post,
    text,
    inputRef,
    onTextChange,
    onSubmit,
    isSubmitting,
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
    const postT = useTranslations('post');
    const backend = useBackend();
    const storage = useFriendlyStorage();
    const navigate = useNavigate();

    const avatarUrl = post.owner.avatar
        ? createFileLink(post.owner.avatar)
        : undefined;

    const postTime = new Date(post.instant);

    const selfQuery = useQuery({
        queryKey: ['userDetails'],
        queryFn: () => backend.getUserDetails2(),
    });

    const selfAvatarUrl = useMemo(
        () =>
            selfQuery.data?.ok && selfQuery.data?.data?.user?.avatar
                ? createFileLink(selfQuery.data.data.user.avatar)
                : '',
        [selfQuery],
    );

    async function navigateProfile() {
        await storage.userAccessHashes.save({
            id: post.owner.id,
            accessHash: post.owner.accessHash,
        });
        await navigate(`/user/${post.owner.id}`);
    }

    return (
        <div className="flex flex-col">
            <div className="bg-card rounded-xl border border-border p-4">
                <div className="flex gap-4">
                    <StyledAvatar
                        avatarClassName="cursor-pointer w-10 h-10"
                        onClick={() => void navigateProfile()}
                        src={avatarUrl}
                        nickname={post.owner.nickname}
                    />
                    <div className="flex-1 flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                            <p
                                onClick={() => void navigateProfile()}
                                className="cursor-pointer font-semibold text-foreground truncate"
                            >
                                {post.owner.nickname}
                            </p>
                            <span className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                                <Clock className="h-3 w-3" />
                                {formatTimeAgo(postT, postTime)}
                            </span>
                        </div>
                        <div className="text-foreground whitespace-pre-wrap break-words">
                            <MarkdownArea text={post.text} />
                        </div>
                    </div>
                </div>
            </div>
            <div className="h-2" />
            <div className="flex bg-card rounded-xl border border-border flex-row gap-2 px-2 py-1">
                <StyledAvatar
                    avatarClassName="mt-1 w-8 h-8"
                    src={selfAvatarUrl}
                    nickname={post.owner.nickname}
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
