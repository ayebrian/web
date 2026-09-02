import {UserDetails} from '@/types/user-details';
import {useTranslations} from 'use-intl';
import {Link} from 'react-router';
import {useState} from 'react';
import {FriendCard} from './friend-card';
import {AllFriendsList} from '@/app/profile/all-friends-list';

export function FriendsBlock({friends}: {friends: UserDetails[]}) {
    const t = useTranslations('profile');
    const [showAll, setShowAll] = useState(false);

    return (
        <>
            <div className="flex flex-col gap-2">
                <p className="flex flex-row gap-2 mb-2">
                    <span className="flex-1 text-sm font-semibold uppercase text-foreground">
                        {t('friends.title')}
                    </span>
                    <Link
                        to="#"
                        className="text-sm text-muted-foreground font-normal hover:underline"
                        hidden={friends.length < 1}
                        onClick={() => setShowAll(true)}
                    >
                        {t('friends.see_all')}
                    </Link>
                </p>
                <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-none">
                    {friends.map(friend => (
                        <FriendCard key={friend.id} friend={friend} />
                    ))}
                    <p hidden={friends.length > 0}>{t('friends.no_friends')}</p>
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
