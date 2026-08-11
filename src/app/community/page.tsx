import {useBackend} from '@/backend.context';
import {Button} from '@/components/ui/button';
import {cn} from '@/lib/utils';
import {
    useInfiniteQuery,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';
import {Loader2, MessageCircle, AlertCircle} from 'lucide-react';
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
    const [newPostText, setNewPostText] = useState('');

    const postsQuery = useInfiniteQuery({
        queryKey: ['communityPosts'],
        queryFn: ({pageParam}) => backend.communityList({cursorId: pageParam}),
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
        mutationFn: (text: string) => backend.communityPost({text}),
        onSuccess: () => {
            setNewPostText('');
            void queryClient.invalidateQueries({queryKey: ['communityPosts']});
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
                <div className="flex flex-col h-[50vh] gap-4 w-full items-center justify-center px-6 text-center">
                    <MessageCircle className="w-12 h-12 text-muted-foreground" />
                    <h3 className="text-base font-semibold text-foreground">
                        {t('empty_title')}
                    </h3>
                    <p className="max-w-xs text-sm text-muted-foreground">
                        {t('empty_desc')}
                    </p>
                </div>
            );
        } else {
            content = (
                <div className="w-full flex flex-col gap-4">
                    {posts.map(post => (
                        <CommunityPostCard key={post.id} post={post} />
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
        queryFn: () => backend.getUserDetails(),
    });

    const avatarUrl = useMemo(
        () =>
            userQuery.data?.ok && userQuery.data?.data?.avatar
                ? createFileLink(userQuery.data.data.avatar)
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
                            ? userQuery?.data?.data?.nickname
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
                        id="reply"
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
                                t('create_post')
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
