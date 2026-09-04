import {AppContext} from '@/app.context';
import {CommunityPostDetails} from '@/network/friendly-client';
import {Resource} from '@/network/resource';
import {forceUnwrap} from '@/network/result';
import {
    useQuery,
    queryOptions,
    infiniteQueryOptions,
} from '@tanstack/react-query';
import {ActivityId} from '@/network/friendly-client';
import {ActivityDetails} from '@/network/friendly-client';
import {communityPosts} from '@/services/community-posts-service';

function listOptions(app: AppContext) {
    return infiniteQueryOptions({
        queryKey: ['activity'],
        queryFn: async ({pageParam}) => {
            const result = forceUnwrap(
                await app.backend.activityList({cursorId: pageParam}),
            );
            const start = performance.now();
            await setDetails(app, result.data);
            console.log(`Saved activity list in ${performance.now() - start}`);
            return result;
        },
        initialPageParam: null as string | null,
        getNextPageParam: lastPage => lastPage.nextId,
    });
}

function detailsOptions(id: ActivityId) {
    return queryOptions<ActivityDetails>({
        queryKey: ['activityDetails', id],
        queryFn: async () => {
            throw new Error('Activity is cache-only');
        },
        enabled: false,
    });
}

async function setDetails(app: AppContext, values: ActivityDetails[]) {
    const replies = values
        .filter(value => value.type === 'reply')
        .map(
            value =>
                ({type: 'plain', ...value.post}) satisfies CommunityPostDetails,
        );
    await communityPosts.setPosts(app, replies);
    for (const value of values) {
        app.queryClient.setQueryData(detailsOptions(value.id).queryKey, value);
    }
}

function useDetails(id: ActivityId): Resource<ActivityDetails> {
    const query = useQuery(detailsOptions(id));
    return Resource.ofUseQuery(query);
}

export const activity = {
    listOptions,
    detailsOptions,
    setDetails,
    useDetails,
};
