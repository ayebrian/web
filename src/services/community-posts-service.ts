import {AppContext} from '@/app.context';
import {Resource} from '@/network/resource';
import {
    CommunityPostDescriptor,
    CommunityDetailsResponse,
} from '@/network/friendly-client';
import {forceUnwrap} from '@/network/result';
import {useQuery, queryOptions} from '@tanstack/react-query';
import {CommunityPostId} from '@/network/friendly-client';

function postOptions(app: AppContext, id: CommunityPostId) {
    return queryOptions({
        queryKey: ['post', id],
        queryFn: async () => {
            const descriptor = await app.storage.communityPosts.get(id);
            const result = await app.backend.communityDetails(descriptor);
            return forceUnwrap(result);
        },
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
        postOptions(app, value.post.id).queryKey,
        value,
    );
}

function useDetails(
    app: AppContext,
    id: CommunityPostId,
): Resource<CommunityDetailsResponse> {
    const query = useQuery(postOptions(app, id));
    return Resource.ofUseQuery(query);
}

function refetch(app: AppContext, id: CommunityPostId): Promise<void> {
    return app.queryClient.refetchQueries(postOptions(app, id));
}

export const communityPosts = {
    saveDescriptor,
    setDetails,
    useDetails,
    refetch,
};
