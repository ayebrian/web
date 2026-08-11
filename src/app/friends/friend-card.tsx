import {UserDetails} from '@/types/user-details';
import {useFriendlyStorage} from '@/components/friendly-storage-provider';
import {useMemo} from 'react';
import {createFileLink} from '@/lib/utils';
import {useNavigate} from 'react-router';
import {StyledAvatar} from '@/components/styled-avatar';
import {useTranslations} from 'use-intl';
import {MarkdownArea} from '@/components/ui/markdown-area';

export function FriendCard({friend}: {friend: UserDetails}) {
    const t = useTranslations('profile.friends');
    const storage = useFriendlyStorage();
    const navigate = useNavigate();

    const avatarUrl = useMemo(
        () => (friend.avatar ? createFileLink(friend.avatar) : ''),
        [friend],
    );

    const openFriendPage = async () => {
        await storage.userAccessHashes.save({
            id: friend.id,
            accessHash: friend.accessHash,
        });
        await navigate(`/user/${friend.id}`);
    };

    return (
        <div
            key={friend.id}
            className="shrink-0 w-45 cursor-pointer"
            onClick={() => void openFriendPage()}
        >
            <div className="flex flex-col items-center gap-3 bg-card hover:bg-accent rounded-xl border border-border p-4 shadow-sm transition-colors h-58">
                <StyledAvatar
                    avatarClassName="w-16 h-16"
                    src={avatarUrl}
                    nickname={friend.nickname}
                />
                <div className="flex flex-col flex-1 items-center min-w-0 w-full min-h-0">
                    <h3 className="truncate text-sm font-semibold text-foreground max-w-full">
                        {friend.nickname}
                    </h3>
                    <p className="text-center mt-2 w-full text-xs text-muted-foreground wrap-anywhere line-clamp-3">
                        <MarkdownArea
                            text={friend.description ?? t('no_description')}
                        />
                    </p>
                </div>
            </div>
        </div>
    );
}
