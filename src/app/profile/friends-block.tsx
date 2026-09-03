import {FriendCard} from './friend-card';
import {useNavigationType, NavigationType} from 'react-router';
import {useVirtualizer, VirtualItem} from '@tanstack/react-virtual';
import {AllFriendsList} from './all-friends-list';
import {Link} from 'react-router';
import {useTranslations} from 'use-intl';
import {useState, ReactElement, useRef, useMemo} from 'react';
import {UserDetails} from '@/types/user-details';
import {Separator} from '@/components/ui/separator';

export function FriendsBlock({friends}: {friends: UserDetails[]}) {
    const t = useTranslations('profile');
    const [showAll, setShowAll] = useState(false);

    const items = friends.map(friend => ({
        key: friend.id.toString(),
        Component: <FriendCard friend={friend} />,
    }));

    return (
        <>
            <Separator className="my-4" />
            <div className="w-full flex flex-col gap-2">
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
                        {t('friends.see-all')}
                    </Link>
                </p>
                <List items={items} />
            </div>
            <AllFriendsList
                friends={friends}
                open={showAll}
                setOpen={setShowAll}
            />
        </>
    );
}

interface Item {
    key: string;
    Component: ReactElement;
}

interface ListProps {
    items: Item[];
}

interface ScrollState {
    initialOffset: number;
    initialMeasurementsCache: VirtualItem[];
}

function List({items}: ListProps) {
    const parentRef = useRef(null);

    const navigationType = useNavigationType();
    const saved = useMemo(() => {
        if (navigationType !== NavigationType.Pop) {
            return null;
        }
        return JSON.parse(
            sessionStorage.getItem('activity.scroll') ?? 'null',
        ) as ScrollState;
    }, [navigationType]);

    const virtualizer = useVirtualizer({
        count: items.length,
        horizontal: true,
        getItemKey: index => items[index].key,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 1000,
        overscan: 0,
        initialOffset: saved?.initialOffset,
        initialMeasurementsCache: saved?.initialMeasurementsCache,
        onChange: virtualizer => {
            sessionStorage.setItem(
                'activity.scroll',
                JSON.stringify({
                    initialOffset: virtualizer.scrollOffset,
                    initialMeasurementsCache: virtualizer.measurementsCache,
                }),
            );
        },
    });

    return (
        <div
            ref={parentRef}
            className="w-full pb-4 overflow-x-auto scrollbar-none"
        >
            <div
                style={{
                    width: `${virtualizer.getTotalSize()}px`,
                    position: 'relative',
                }}
            >
                {virtualizer.getVirtualItems().map(item => (
                    <div
                        key={item.key}
                        ref={virtualizer.measureElement}
                        data-index={item.index}
                        className="me-2"
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            transform: `translateX(${item.start}px)`,
                        }}
                    >
                        {items[item.index].Component}
                    </div>
                ))}
            </div>
        </div>
    );
}
