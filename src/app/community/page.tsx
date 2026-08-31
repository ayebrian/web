import {useBackend} from '@/backend.context';
import {users} from '@/services/users-service';
import {useAppContext} from '@/app.context';
import {communityPosts} from '@/services/community-posts-service';
import {useNavigate} from 'react-router';
import {forceUnwrap} from '@/network/result';
import {Button} from '@/components/ui/button';
import {cn} from '@/lib/utils';
import {
    useInfiniteQuery,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';
import {Loader2, AlertCircle, SquarePen, Newspaper, Trash} from 'lucide-react';
import {useTranslations} from 'use-intl';
import {useCallback, useMemo, useRef, useEffect} from 'react';
import {toast} from 'sonner';
import {newPost} from '@/services/new-post-service';
import {StyledAvatar} from '@/components/styled-avatar';
import {createFileLink} from '@/lib/utils';
import {CommunityPostCard} from './post';

export function CommunityPage() {
    const t = useTranslations('community');
    const backend = useBackend();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const app = useAppContext();

    const [newPostText, setNewPostText] = newPost.useText();

    const postsQuery = useInfiniteQuery({
        queryKey: ['communityPosts'],
        queryFn: async ({pageParam}) => {
            const result = forceUnwrap(
                await backend.communityList({cursorId: pageParam}),
            );
            await Promise.all(
                result.data.map(post =>
                    communityPosts.setPost(app, {
                        type: 'plain',
                        ...post,
                    }),
                ),
            );
            return result;
        },
        initialPageParam: null as string | null,
        getNextPageParam: lastPage => lastPage.nextId,
    });

    useEffect(() => {
        if (!postsQuery.data) return;
        let shouldBreak = false;
        void (async () => {
            for (const page of postsQuery.data.pages) {
                for (const post of page.data) {
                    if (shouldBreak) break;
                    await communityPosts.prefetchDetails(app, post.id, {
                        staleTime: Infinity,
                    });
                }
            }
        })();
        return () => {
            shouldBreak = true;
        };
    }, [postsQuery.data]);

    const loadMore = () => {
        if (postsQuery.hasNextPage && !postsQuery.isFetchingNextPage) {
            void postsQuery.fetchNextPage();
        }
    };

    const createPostMutation = useMutation({
        mutationFn: async (text: string) => {
            const result = await backend.communityPost({text});
            const details = {
                type: 'plain' as const,
                ...forceUnwrap(result),
                text,
                owner: (await users.ensureSelf(app)).user,
                instant: new Date().toISOString(),
                replyPreviews: [],
            };
            await communityPosts.setDetails(app, {
                post: details,
                replies: {
                    data: [],
                    nextId: null,
                },
                upstream: [],
            });
            return details;
        },
        onSuccess: details => {
            void (async () => {
                setNewPostText('');
                void queryClient.invalidateQueries({
                    queryKey: ['communityPosts'],
                });
                void navigate(`/community/${details.id}/replies`);
            })();
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

    if (postsQuery.isPending) {
        content = (
            <div className="flex h-full w-full items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
            </div>
        );
    } else if (postsQuery.isError) {
        content = (
            <div className="flex flex-col h-[50vh] gap-4 w-full items-center justify-center">
                <AlertCircle className="h-10 w-10 animate-pulse text-foreground/80" />
                <p className="text-center">
                    {postsQuery.error?.message ?? t('unknown_error')}
                </p>
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
        const posts = pages.flatMap(p => p.data);

        if (posts.length === 0) {
            content = (
                <div className="flex flex-col h-[50vh] gap-4 w-full items-center justify-center px-6 text-center">
                    <Newspaper className="w-12 h-12 text-muted-foreground" />
                    <p className="text-base font-semibold text-foreground">
                        {t('empty_title')}
                    </p>
                    <p className="max-w-xs text-sm text-muted-foreground">
                        {t('empty_desc')}
                    </p>
                </div>
            );
        } else {
            content = (
                <div className="w-full flex flex-col gap-4">
                    {posts.map(post => (
                        <CommunityPostCard
                            key={post.id}
                            postId={post.id}
                            minimizeToolbar={false}
                            minimizeText={true}
                        />
                    ))}
                </div>
            );
        }
    }

    return (
        <div className="flex flex-col items-center w-full max-w-2xl mx-auto px-4 py-4 gap-4">
            <CreatePostCard
                text={newPostText}
                onTextChange={setNewPostText}
                onSubmit={handleCreatePost}
                isSubmitting={createPostMutation.isPending}
            />
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

interface CreatePostCardProps {
    text: string;
    onTextChange: (text: string) => void;
    onSubmit: () => Promise<void>;
    isSubmitting: boolean;
}

function CreatePostCard({
    text,
    onTextChange,
    onSubmit,
    isSubmitting,
}: CreatePostCardProps) {
    const t = useTranslations('community');
    const postRef = useRef<HTMLTextAreaElement>(null);
    const backend = useBackend();
    const userQuery = useQuery({
        queryKey: ['userDetails'],
        queryFn: async () => forceUnwrap(await backend.getUserDetails2()),
    });

    const avatarUrl = useMemo(
        () =>
            userQuery.data?.user?.avatar
                ? createFileLink(userQuery.data.user.avatar)
                : '',
        [userQuery],
    );

    useEffect(() => {
        const post = postRef.current;
        if (post) {
            post.style.height = 'auto';
            post.style.height = `${post.scrollHeight}px`;
        }
    }, [text]);

    return (
        <div className="w-full bg-card rounded-xl border border-border p-4">
            <div className="w-full flex gap-3">
                <StyledAvatar
                    avatarClassName="w-10 h-10"
                    src={avatarUrl}
                    nickname={userQuery?.data?.user?.nickname ?? ''}
                />
                <div className="w-full flex-1 flex flex-col min-w-0">
                    <textarea
                        ref={postRef}
                        className={cn(
                            'w-full mt-2',
                            'outline-none resize-none',
                        )}
                        value={text}
                        onChange={e => onTextChange(e.target.value)}
                        placeholder={t('placeholder')}
                    />
                    <div className="w-full flex items-center justify-end gap-1">
                        {text.length > 0 && (
                            <Button
                                onClick={() => onTextChange('')}
                                variant="ghost"
                            >
                                <div className="flex items-center gap-1.5">
                                    <Trash />
                                    {t('clear-draft')}
                                </div>
                            </Button>
                        )}
                        <Button
                            onClick={() => void onSubmit()}
                            disabled={!text.trim() || isSubmitting}
                        >
                            {isSubmitting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <div className="flex items-center gap-1.5">
                                    <SquarePen />
                                    {t('create_post')}
                                </div>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
