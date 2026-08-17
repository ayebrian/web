import {UserAccessHashesService} from './useraccesshashes-service';
import {CommunityPostsDB} from './community-posts-db';

export interface FriendlyStorage {
    userAccessHashes: UserAccessHashesService;
    communityPosts: CommunityPostsDB;
}
