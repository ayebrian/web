import {useBackend} from '@/backend.context';
import {MainPostCard} from '@/app/community/replies/main-post';
import {communityPosts} from '@/services/community-posts-service';
import {CommunityPostId, CommunityPostDetails} from '@/network/friendly-client';
import {users} from '@/services/users-service';
import {
    CommunityDetailsResponse,
    CommunityPostDescriptor,
} from '@/network/friendly-client';
import {Button} from '@/components/ui/button';
import {forceUnwrap} from '@/network/result';
import {
    useInfiniteQuery,
    useMutation,
    useQueryClient,
    infiniteQueryOptions,
} from '@tanstack/react-query';
import {Loader2, MessageCircle, AlertCircle} from 'lucide-react';
import {useTranslations} from 'use-intl';
import React, {useRef, useState, useCallback, useEffect} from 'react';
import {toast} from 'sonner';
import {useNavigate, useParams} from 'react-router';
import {CommunityPostCard} from '../post';
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

    if (replyTo.cache === 'empty') {
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
                    onClick={() =>
                        void communityPosts.invalidateDetails(app, idInt)
                    }
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
    const navigate = useNavigate();
    const t = useTranslations('replies');
    const replyPost = communityPosts.usePost(replyTo.post.id).data!;

    const upstreamRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        let shouldBreak = false;
        void (async () => {
            for (const reply of replyTo.replies.data) {
                if (shouldBreak) break;
                await communityPosts.prefetchDetails(app, reply.id, {
                    staleTime: Infinity,
                });
            }
        })();
        void (async () => {
            for (const upstream of replyTo.upstream) {
                if (shouldBreak) break;
                await communityPosts.prefetchDetails(app, upstream.id, {
                    staleTime: Infinity,
                });
            }
        })();
        return () => {
            shouldBreak = true;
        };
    }, [replyTo]);

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

    function postsOptions(
        descriptor: CommunityPostDescriptor,
        initialData?: {data: CommunityPostDetails[]; nextId: string | null},
    ) {
        return infiniteQueryOptions({
            queryKey: ['communityReplies', descriptor.id],
            queryFn: async ({pageParam}: {pageParam: string | null}) => {
                const result = forceUnwrap(
                    await backend.communityReplies({
                        id: descriptor.id,
                        accessHash: descriptor.accessHash,
                        cursorId: pageParam,
                    }),
                );
                await Promise.all(
                    result.data.map(post => communityPosts.setPost(app, post)),
                );
                return result;
            },
            initialData: initialData
                ? {
                      pages: [initialData],
                      pageParams: [null],
                  }
                : undefined,
            initialPageParam: null,
            getNextPageParam: lastPage => lastPage.nextId,
        });
    }

    const postsQuery = useInfiniteQuery(
        postsOptions(replyTo.post, replyTo.replies),
    );

    const pages = postsQuery.data?.pages ?? [];
    const posts = pages.flatMap(p => p.data);

    const loadMore = () => {
        if (postsQuery.hasNextPage && !postsQuery.isFetchingNextPage) {
            void postsQuery.fetchNextPage();
        }
    };

    const createPostMutation = useMutation({
        mutationFn: async (props: {text: string; redirect?: boolean}) => {
            const post = {
                replyTo: {
                    id: id,
                    accessHash: replyPost.accessHash,
                },
                text: props.text,
            };
            const result = await backend.communityPost(post);
            const response = {
                post: {
                    type: 'plain',
                    ...post,
                    ...forceUnwrap(result),
                    replyPreviews: [],
                    instant: new Date().toISOString(),
                    owner: (await users.ensureSelf(app)).user,
                },
                replies: {data: [], nextId: null},
                upstream: [...replyTo.upstream, replyPost],
            } satisfies CommunityDetailsResponse;
            await communityPosts.setDetails(app, response);
            if (props.redirect) {
                void queryClient.invalidateQueries({
                    queryKey: ['communityReplies', id],
                });
                await navigateReplies(response.post);
                setNewPostText('');
            } else {
                await queryClient.prefetchQuery({
                    queryKey: ['communityReplies', id],
                });
            }
        },
        onError: error => {
            toast.error(error.message ?? t('post_create_error'));
        },
    });

    const deletePostMutation = useMutation({
        mutationKey: ['communityDelete', replyTo.post.id],
        mutationFn: async () => {
            const result = await backend.communityDelete({
                id: replyPost.id,
            });
            forceUnwrap(result);
            if (replyTo.replies.data.length === 0) {
                if (replyTo.upstream.length === 0) {
                    await communityPosts.prefetchList(app, {staleTime: 0});
                    await navigate('/community');
                } else {
                    const lastUpstream =
                        replyTo.upstream[replyTo.upstream.length - 1];
                    await queryClient.prefetchInfiniteQuery({
                        ...postsOptions(lastUpstream),
                        staleTime: 0,
                    });
                    await navigateReplies({...lastUpstream});
                }
            } else {
                await communityPosts.setPost(app, {
                    type: 'deleted',
                    id: replyPost.id,
                    accessHash: replyPost.accessHash,
                    instant: replyPost.instant,
                    replyPreviews: replyPost.replyPreviews,
                });
            }
        },
        onError: error => {
            toast.error(error.message ?? t('post_create_error'));
        },
    });

    async function navigateReplies(descriptor: CommunityPostDescriptor) {
        await navigate(`/community/${descriptor.id}/replies`);
    }

    const handleCreatePost = useCallback(() => {
        if (!newPostText.trim()) return;
        createPostMutation.mutate({text: newPostText, redirect: true});
    }, [newPostText, createPostMutation]);

    let upstream;

    if (replyTo.upstream.length > 0) {
        upstream = (
            <>
                <div className="flex flex-col gap-2">
                    {replyTo.upstream.map(post => (
                        <CommunityPostCard
                            key={post.id}
                            postId={post.id}
                            minimizeToolbar={true}
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
                        postId={post.id}
                        minimizeToolbar={false}
                        minimizeText={true}
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
                onEmoji={emoji => createPostMutation.mutate({text: emoji})}
                onSubmit={handleCreatePost}
                isSubmitting={createPostMutation.isPending}
                onDelete={() => deletePostMutation.mutate()}
                isDeleting={deletePostMutation.isPending}
                post={replyPost}
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
