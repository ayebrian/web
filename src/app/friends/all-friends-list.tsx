import {UserDetails} from '@/types/user-details';
import {useMemo} from 'react';
import {useTranslations} from 'use-intl';
import {Button} from '@/components/ui/button';
import {X} from 'lucide-react';
import {AvatarImage, AvatarFallback, Avatar} from '@/components/ui/avatar';
import {createFileLink} from '@/lib/utils';
import {Dialog} from 'radix-ui';
import {useUserAccessHashes} from '@/components/useraccesshashes-provider';

type AllFriendsListType = {
    friends: UserDetails[];
    open: boolean;
    setOpen: (open: boolean) => void;
};

function FriendListItem({
    id,
    friend,
    onClick,
}: {
    id: string;
    friend: UserDetails;
    onClick: () => void;
}) {
    const avatarUrl = useMemo(
        () => (friend.avatar ? createFileLink(friend.avatar) : ''),
        [friend],
    );

    return (
        <button
            id={id}
            onClick={onClick}
            className="p-4 grow-1 flex flex-row items-center gap-4 rounded-xl cursor-pointer hover:bg-zinc-200/30 hover:dark:bg-zinc-200/50"
        >
            <Avatar className="w-16 h-16">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback>
                    {friend?.nickname.toString().slice(0, 2)}
                </AvatarFallback>
            </Avatar>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {friend?.nickname}
            </p>
        </button>
    );
}

export function AllFriendsList({friends, open, setOpen}: AllFriendsListType) {
    const t = useTranslations('profile');
    const userAccessHashes = useUserAccessHashes();

    const openFriendPage = async (friend: UserDetails) => {
        await userAccessHashes.service.save({
            id: friend.id,
            accessHash: friend.accessHash,
        });
        document.location.href = `/user/${friend.id}`;
    };

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
                <Dialog.Content
                    className="
                    fixed left-1/2 top-1/2
                    -translate-x-1/2 -translate-y-1/2

                    w-full max-w-lg p-5
                    max-h-dvh overflow-y-scroll
                    "
                >
                    <div
                        className="
                            rounded-xl bg-white dark:bg-zinc-900
                            shadow-xl
                            "
                    >
                        <div className="p-0">
                            <div className="flex flex-col">
                                <div className="relative flex items-center mt-1 mx-1">
                                    <Dialog.Title className="w-full text-md font-semibold text-center pt-2">
                                        {t('friends.see_all')}
                                    </Dialog.Title>
                                    <Dialog.Close
                                        className="absolute right-0 top-0"
                                        asChild
                                    >
                                        <Button
                                            variant="ghost"
                                            className="cursor-pointer"
                                        >
                                            <X />
                                        </Button>
                                    </Dialog.Close>
                                </div>

                                <div className="flex flex-col gap-4">
                                    {friends.map(friend => (
                                        <FriendListItem
                                            id={friend.id.toString()}
                                            friend={friend}
                                            onClick={() =>
                                                void openFriendPage(friend)
                                            }
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
