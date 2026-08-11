import {UserAccessHashesService} from './useraccesshashes-service';
import {CommunityPostsService} from './community-posts-service';

export interface FriendlyStorage {
    userAccessHashes: UserAccessHashesService;
    communityPosts: CommunityPostsService;
}
