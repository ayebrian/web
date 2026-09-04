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
            await setPosts(app, [result.post]);
            const cachedReplies = app.queryClient.getQueryData(
                repliesOptions(app, result.post).queryKey,
            );
            if (
                JSON.stringify(cachedReplies?.pages?.[0]?.data) !==
                JSON.stringify(result.replies.data)
            ) {
                app.queryClient.setQueryData(
                    repliesOptions(app, result.post).queryKey,
                    {
                        pages: [result.replies],
                        pageParams: [null],
                    },
                );
            }
            await setPosts(app, result.replies.data);
            await setPosts(app, result.upstream);
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
            await setPosts(
                app,
                result.data.map(post => ({
                    type: 'plain',
                    ...post,
                })),
            );
            return result;
        },
        initialPageParam: null as string | null,
        getNextPageParam: lastPage => lastPage.nextId,
    });
}

function repliesOptions(app: AppContext, descriptor: CommunityPostDescriptor) {
    return infiniteQueryOptions({
        queryKey: ['communityReplies', descriptor.id],
        queryFn: async ({pageParam}: {pageParam: string | null}) => {
            const result = forceUnwrap(
                await app.backend.communityReplies({
                    id: descriptor.id,
                    accessHash: descriptor.accessHash,
                    cursorId: pageParam,
                }),
            );
            await setPosts(app, result.data);
            return result;
        },
        initialPageParam: null,
        getNextPageParam: lastPage => lastPage.nextId,
    });
}

function saveDescriptors(
    app: AppContext,
    descriptors: CommunityPostDescriptor[],
): Promise<void> {
    return app.storage.communityPosts.save(descriptors);
}

async function setDetails(app: AppContext, values: CommunityDetailsResponse[]) {
    for (const value of values) {
        app.queryClient.setQueryData(
            postDetailsOptions(app, value.post.id).queryKey,
            value,
        );
    }
    await setPosts(
        app,
        values.map(value => value.post),
    );
}

async function setPosts(app: AppContext, values: CommunityPostDetails[]) {
    await app.storage.communityPosts.save(values);
    for (const value of values) {
        app.queryClient.setQueryData(postOptions(value.id).queryKey, value);
    }
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
    repliesOptions,
    saveDescriptors,
    setDetails,
    setPosts,
    useDetails,
    usePost,
    invalidateDetails,
    prefetchDetails,
    prefetchList,
};
