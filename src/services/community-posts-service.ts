import {AppContext} from '@/app.context';
import {Resource} from '@/network/resource';
import {
    CommunityPostDescriptor,
    CommunityDetailsResponse,
} from '@/network/friendly-client';
import {forceUnwrap} from '@/network/result';
import {
    useQuery,
    queryOptions,
    infiniteQueryOptions,
} from '@tanstack/react-query';
import {CommunityPostId} from '@/network/friendly-client';
import {CommunityPostDetails} from '@/network/friendly-client';

function postOptions(id: CommunityPostId) {
    return queryOptions<CommunityPostDetails>({
        queryKey: ['post', id],
        queryFn: async () => {
            throw new Error('Post is cache-only');
        },
        enabled: false,
    });
}

function postDetailsOptions(app: AppContext, id: CommunityPostId) {
    return queryOptions({
        queryKey: ['postDetails', id],
        queryFn: async () => {
            const descriptor = await app.storage.communityPosts.get(id);
            const result = forceUnwrap(
                await app.backend.communityDetails(descriptor),
            );
            setPost(app, result.post);
            for (const reply of result.replies.data) {
                setPost(app, reply);
            }
            for (const upstream of result.upstream) {
                setPost(app, upstream);
            }
            return result;
        },
    });
}

function listOptions(app: AppContext) {
    return infiniteQueryOptions({
        queryKey: ['communityPosts'],
        queryFn: async ({pageParam}) => {
            const result = forceUnwrap(
                await app.backend.communityList({cursorId: pageParam}),
            );
            for (const post of result.data) {
                communityPosts.setPost(app, {
                    type: 'plain',
                    ...post,
                });
                void communityPosts.prefetchDetails(app, post.id, {
                    staleTime: Infinity,
                });
            }
            return result;
        },
        initialPageParam: null as string | null,
        getNextPageParam: lastPage => lastPage.nextId,
    });
}

function saveDescriptor(
    app: AppContext,
    descriptor: CommunityPostDescriptor,
): Promise<void> {
    return app.storage.communityPosts.save(descriptor);
}

function setDetails(app: AppContext, value: CommunityDetailsResponse) {
    app.queryClient.setQueryData(
        postDetailsOptions(app, value.post.id).queryKey,
        value,
    );
    setPost(app, value.post);
}

function setPost(app: AppContext, value: CommunityPostDetails) {
    void app.storage.communityPosts.save(value);
    app.queryClient.setQueryData(postOptions(value.id).queryKey, value);
}

function useDetails(
    app: AppContext,
    id: CommunityPostId,
): Resource<CommunityDetailsResponse> {
    const query = useQuery(postDetailsOptions(app, id));
    return Resource.ofUseQuery(query);
}

function usePost(id: CommunityPostId): Resource<CommunityPostDetails> {
    const query = useQuery(postOptions(id));
    return Resource.ofUseQuery(query);
}

function invalidateDetails(
    app: AppContext,
    id: CommunityPostId,
): Promise<void> {
    return app.queryClient.invalidateQueries(postDetailsOptions(app, id));
}

export interface PrefetchDetailsOptions {
    staleTime: number;
}

function prefetchDetails(
    app: AppContext,
    id: CommunityPostId,
    options?: PrefetchDetailsOptions,
): Promise<void> {
    return app.queryClient.prefetchQuery({
        ...postDetailsOptions(app, id),
        ...options,
    });
}

export interface PrefetchListOptions {
    staleTime: number;
}

function prefetchList(
    app: AppContext,
    options?: PrefetchListOptions,
): Promise<void> {
    return app.queryClient.prefetchInfiniteQuery({
        ...listOptions(app),
        ...options,
    });
}

export const communityPosts = {
    listOptions,
    saveDescriptor,
    setDetails,
    setPost,
    useDetails,
    usePost,
    invalidateDetails,
    prefetchDetails,
    prefetchList,
};
