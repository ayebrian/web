import {useBackend} from '@/backend.context';
import {Button} from '@/components/ui/button';
import {cn} from '@/lib/utils';
import {
    useInfiniteQuery,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';
import {
    Loader2,
    MessageCircle,
    AlertCircle,
    Clock,
    Send,
    ChevronLeft,
} from 'lucide-react';
import {useTranslations} from 'use-intl';
import React, {useRef, useState, useCallback, useMemo, useEffect} from 'react';
import {CommunityPost} from '@/network/friendly-client';
import {toast} from 'sonner';
import {StyledAvatar} from '@/components/styled-avatar';
import {createFileLink} from '@/lib/utils';
import {MarkdownArea} from '@/components/ui/markdown-area';
import {useNavigate, useParams} from 'react-router';
import {CommunityPostCard} from '../post';
import {useFriendlyStorage} from '@/components/friendly-storage-provider';

export function RepliesPage() {
    const t = useTranslations('replies');
    const backend = useBackend();
    const queryClient = useQueryClient();
    const storage = useFriendlyStorage();
    const navigate = useNavigate();

    const {id} = useParams();
    const idInt = id ? Number(id) : null;
    useEffect(() => {
        if (idInt === null || Number.isNaN(idInt)) {
            void navigate('/not-found');
        }
    }, [idInt]);
    if (!idInt) return;

    const replyTo = useQuery({
        queryKey: ['replyTo', idInt],
        queryFn: () => storage.communityPosts.get(idInt),
    });

    const [newPostText, setNewPostText] = useState('');

    const postsQuery = useInfiniteQuery({
        queryKey: ['communityReplies', idInt],
        queryFn: async ({pageParam}) => {
            return await backend.communityReplies({
                id: idInt,
                accessHash: replyTo.data!.accessHash,
                cursorId: pageParam,
            });
        },
        enabled: !!replyTo.data,
        initialPageParam: null as string | null,
        getNextPageParam: lastPage =>
            lastPage.ok && lastPage.data.nextId !== null
                ? lastPage.data.nextId
                : undefined,
    });

    const loadMore = () => {
        if (postsQuery.hasNextPage && !postsQuery.isFetchingNextPage) {
            void postsQuery.fetchNextPage();
        }
    };

    const createPostMutation = useMutation({
        mutationFn: async (text: string) => {
            if (replyTo.isPending) {
                await queryClient.ensureQueryData({
                    queryKey: ['replyTo', idInt],
                    queryFn: () => storage.communityPosts.get(idInt),
                });
            }
            return await backend.communityPost({
                replyTo: {
                    id: idInt,
                    accessHash: replyTo.data!.accessHash,
                },
                text,
            });
        },
        onSuccess: () => {
            setNewPostText('');
            void queryClient.invalidateQueries({
                queryKey: ['communityReplies', idInt],
            });
        },
        onError: error => {
            toast.error(error.message ?? t('post_create_error'));
        },
    });

    const handleCreatePost = useCallback(async () => {
        if (!newPostText.trim()) return;
        await createPostMutation.mutateAsync(newPostText);
    }, [newPostText, createPostMutation]);

    let content;

    if (postsQuery.isLoading) {
        content = (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
            </div>
        );
    } else if (postsQuery.isError) {
        content = (
            <div className="flex flex-col h-[50vh] gap-4 w-full items-center justify-center">
                <AlertCircle className="h-10 w-10 animate-pulse text-foreground/80" />
                <h3 className="text-center">
                    {postsQuery.error?.message ?? t('unknown_error')}
                </h3>
                <Button
                    variant="outline"
                    className="mt-2"
                    onClick={() => void postsQuery.refetch()}
                >
                    {t('retry')}
                </Button>
            </div>
        );
    } else {
        const pages = postsQuery.data?.pages ?? [];
        const posts = pages.flatMap(p => (p.ok ? p.data.data : []));

        if (posts.length === 0 && pages.length > 0 && !pages[0].ok) {
            content = (
                <div className="flex flex-col h-[50vh] gap-4 w-full items-center justify-center">
                    <AlertCircle className="h-10 w-10 animate-pulse text-foreground/80" />
                    <h3 className="text-center">{t('unknown_error')}</h3>
                    <Button
                        variant="outline"
                        className="mt-2"
                        onClick={() => void postsQuery.refetch()}
                    >
                        {t('retry')}
                    </Button>
                </div>
            );
        } else if (posts.length === 0) {
            content = (
                <div className="flex flex-col h-[50vh] gap-2 w-full items-center justify-center px-6 text-center">
                    <MessageCircle className="w-12 h-12 text-muted-foreground" />
                    <h3 className="text-base font-semibold text-foreground">
                        {t('no-replies')}
                    </h3>
                    <p className="max-w-xs text-sm text-muted-foreground">
                        {t('no-replies-desc')}
                    </p>
                </div>
            );
        } else {
            content = (
                <div className="w-full flex flex-col gap-4">
                    <p className="text-sm font-semibold uppercase text-foreground">
                        {t('replies')}
                    </p>
                    {posts.map(post => (
                        <CommunityPostCard key={post.id} post={post} />
                    ))}
                </div>
            );
        }
    }

    return (
        <div className="flex flex-col w-full max-w-2xl mx-auto px-4 py-4">
            <a
                className="w-full text-muted-foreground text-sm"
                onClick={() => history.back()}
            >
                <span className="flex items-center cursor-pointer hover:underline">
                    <ChevronLeft className="inline h-4 w-4" />
                    {t('go-back')}
                </span>
            </a>
            <div className="h-4" />
            {replyTo.data && (
                <MainPostCard
                    text={newPostText}
                    onTextChange={setNewPostText}
                    onSubmit={handleCreatePost}
                    isSubmitting={createPostMutation.isPending}
                    post={replyTo.data}
                />
            )}
            {content}
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
    post: CommunityPost;
    text: string;
    onTextChange: (text: string) => void;
    onSubmit: () => Promise<void>;
    isSubmitting: boolean;
}

function MainPostCard({
    post,
    text,
    onTextChange,
    onSubmit,
    isSubmitting,
}: MainPostCardProps) {
    const replyRef = useRef<HTMLTextAreaElement>(null);

    function onKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            if (!event.currentTarget.value.trim()) return;
            void onSubmit();
        }
    }

    useEffect(() => {
        const reply = replyRef.current;
        if (reply) {
            reply.style.height = 'auto';
            reply.style.height = `${reply.scrollHeight}px`;
        }
    }, [text]);

    const t = useTranslations('replies');
    const backend = useBackend();
    const storage = useFriendlyStorage();
    const navigate = useNavigate();

    const avatarUrl = post.owner.avatar
        ? createFileLink(post.owner.avatar)
        : undefined;

    const postTime = new Date(post.instant);

    const selfQuery = useQuery({
        queryKey: ['userDetails'],
        queryFn: () => backend.getUserDetails(),
    });

    const selfAvatarUrl = useMemo(
        () =>
            selfQuery.data?.ok && selfQuery.data?.data?.avatar
                ? createFileLink(selfQuery.data.data.avatar)
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
                <div className="flex gap-3">
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
                                {formatTimeAgo(t, postTime)}
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
                    ref={replyRef}
                    className={cn(
                        'w-full content-center',
                        'text-sm outline-none resize-none',
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
