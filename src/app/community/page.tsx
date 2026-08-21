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
import {Loader2, AlertCircle, SquarePen, Newspaper} from 'lucide-react';
import {useTranslations} from 'use-intl';
import {useState, useCallback, useMemo, useRef, useEffect} from 'react';
import {toast} from 'sonner';
import {StyledAvatar} from '@/components/styled-avatar';
import {createFileLink} from '@/lib/utils';
import {CommunityPostCard} from './post';

export function CommunityPage() {
    const t = useTranslations('community');
    const backend = useBackend();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const app = useAppContext();

    const [newPostText, setNewPostText] = useState('');

    const postsQuery = useInfiniteQuery({
        queryKey: ['communityPosts'],
        queryFn: async ({pageParam}) => {
            const result = forceUnwrap(
                await backend.communityList({cursorId: pageParam}),
            );
            for (const post of result.data) {
                communityPosts.setPost(app, {
                    type: 'plain',
                    ...post,
                });
            }
            return result;
        },
        initialPageParam: null as string | null,
        getNextPageParam: lastPage => lastPage.nextId,
    });

    const loadMore = () => {
        if (postsQuery.hasNextPage && !postsQuery.isFetchingNextPage) {
            void postsQuery.fetchNextPage();
        }
    };

    const createPostMutation = useMutation({
        mutationFn: async (text: string) => {
            const result = await backend.communityPost({text});
            return {
                type: 'plain' as const,
                ...forceUnwrap(result),
                text,
                owner: (await users.ensureSelf(app)).user,
                instant: new Date().toISOString(),
            };
        },
        onSuccess: details => {
            void (async () => {
                await communityPosts.saveDescriptor(app, details);
                communityPosts.setDetails(app, {
                    post: details,
                    replies: {
                        data: [],
                        nextId: null,
                    },
                    upstream: [],
                });
                await navigate(`/community/${details.id}/replies`);
                await new Promise(resolve => setTimeout(resolve, 300));
                setNewPostText('');
                void queryClient.invalidateQueries({
                    queryKey: ['communityPosts'],
                });
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
                            minimize={false}
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
                        'Load more'
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
        queryFn: () => backend.getUserDetails2(),
    });

    const avatarUrl = useMemo(
        () =>
            userQuery.data?.ok && userQuery.data?.data?.user?.avatar
                ? createFileLink(userQuery.data.data.user.avatar)
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
                    nickname={
                        userQuery?.data?.ok
                            ? userQuery?.data?.data?.user?.nickname
                            : ''
                    }
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
                    <div className="w-full flex items-center justify-end">
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
