import React from 'react';
import {Button} from '@/components/ui/button';
import {MessageCircle, Clock} from 'lucide-react';
import {useTranslations} from 'use-intl';
import {CommunityPost} from '@/network/friendly-client';
import {StyledAvatar} from '@/components/styled-avatar';
import {createFileLink} from '@/lib/utils';
import {MarkdownArea} from '@/components/ui/markdown-area';
import {useNavigate} from 'react-router';
import {useFriendlyStorage} from '@/components/friendly-storage-provider';

export interface CommunityPostCardProps {
    post: CommunityPost;
}

export function CommunityPostCard({post}: CommunityPostCardProps) {
    const t = useTranslations('post');
    const navigate = useNavigate();
    const storage = useFriendlyStorage();

    const avatarUrl = post.owner.avatar
        ? createFileLink(post.owner.avatar)
        : undefined;
    const postTime = new Date(post.instant);

    async function navigateReplies() {
        await storage.communityPosts.save(post);
        await navigate(`/community/${post.id}/replies`);
    }

    async function navigateProfile(event: React.MouseEvent) {
        event.stopPropagation();
        await storage.userAccessHashes.save({
            id: post.owner.id,
            accessHash: post.owner.accessHash,
        });
        await navigate(`/user/${post.owner.id}`);
    }

    return (
        <div
            className="bg-card rounded-xl border border-border p-4 cursor-pointer"
            onClick={() => void navigateReplies()}
        >
            <div className="flex gap-3">
                <StyledAvatar
                    avatarClassName="w-10 h-10 cursor-pointer"
                    onClick={event => void navigateProfile(event)}
                    src={avatarUrl}
                    nickname={post.owner.nickname}
                />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <p
                            className="font-semibold text-foreground truncate cursor-pointer"
                            onClick={event => void navigateProfile(event)}
                        >
                            {post.owner.nickname}
                        </p>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                            <Clock className="h-3 w-3" />
                            {formatTimeAgo(t, postTime)}
                        </span>
                    </div>
                    <div className="mt-1 text-foreground whitespace-pre-wrap break-words">
                        <MarkdownArea text={post.text} />
                    </div>

                    <div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground hover:bg-accent ml-auto"
                        >
                            <MessageCircle className="h-4 w-4" />
                            {t('reply')}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function formatTimeAgo(
    t: ReturnType<typeof useTranslations<'post'>>,
    date: Date,
) {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return t('just_now');
    if (diffMins < 60) return t('minutes_ago', {count: diffMins});
    if (diffHours < 24) return t('hours_ago', {count: diffHours});
    if (diffDays < 7) return t('days_ago', {count: diffDays});
    return date.toLocaleDateString();
}
