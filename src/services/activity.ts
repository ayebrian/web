import {AppContext} from '@/app.context';
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
            await Promise.all(
                result.data.map(activity => setDetails(app, activity)),
            );
            await Promise.all(
                result.data
                    .filter(activity => activity.type === 'reply')
                    .map(activity =>
                        communityPosts.setPost(app, {
                            type: 'plain',
                            ...activity.post,
                        }),
                    ),
            );
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

async function setDetails(app: AppContext, value: ActivityDetails) {
    switch (value.type) {
        case 'reply':
            await communityPosts.setPost(app, {
                type: 'plain',
                ...value.post,
            });
            break;
        default:
            value satisfies never;
    }
    app.queryClient.setQueryData(detailsOptions(value.id).queryKey, value);
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
