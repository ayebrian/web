import {FriendCard} from './friend-card';
import {AllFriendsList} from './all-friends-list';
import {Link} from 'react-router';
import {useTranslations} from 'use-intl';
import {useState} from 'react';
import {UserDetails} from '@/types/user-details';
import {Separator} from '@/components/ui/separator';

export function FriendsBlock({friends}: {friends: UserDetails[]}) {
    const t = useTranslations('profile.common-friends');
    const [showAll, setShowAll] = useState(false);

    return (
        <>
            <Separator className="my-4" />
            <div className="flex flex-col gap-2">
                <p className="flex flex-row gap-2 mb-2">
                    <span className="flex-1 text-sm font-semibold uppercase text-foreground">
                        {t('title')}
                    </span>
                    <Link
                        to="#"
                        className="text-sm text-muted-foreground font-normal hover:underline"
                        hidden={friends.length < 1}
                        onClick={() => setShowAll(true)}
                    >
                        {t('see-all')}
                    </Link>
                </p>
                <div className="flex gap-2 overflow-x-auto scrollbar-none pb-4">
                    {friends.map(friend => (
                        <FriendCard key={friend.id} friend={friend} />
                    ))}
                </div>
            </div>
            <AllFriendsList
                friends={friends}
                open={showAll}
                setOpen={setShowAll}
            />
        </>
    );
}
