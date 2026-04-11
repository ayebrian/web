'use client';

import {UserDetailsResponse} from '@/network/friendly-client';
import {useEffect, useMemo, useState, useCallback} from 'react';
import {toast} from 'sonner';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {Badge} from '@/components/ui/badge';
import {Separator} from '@/components/ui/separator';
import QRCode from 'react-qr-code';
import {
    Activity,
    Copy,
    Loader2,
    LogOut,
    Pencil,
    QrCodeIcon,
    Save,
} from 'lucide-react';
import {Button} from '@/components/ui/button';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {useBackend} from '@/backend.context';
import {formatNetworkError} from '@/services/backend-service';
import {createFileLink, createFriendInviteLink} from '@/lib/utils';
import {useQuery} from '@tanstack/react-query';
import {useSession} from '@/components/session-provider';
import {useTranslations} from 'next-intl';
import {EditProfileDialog} from '@/app/edit/dialog';

function ProfileHeader({
    userDetails,
    logOut,
}: {
    userDetails: UserDetailsResponse | null;
    logOut: () => void;
}) {
    const t = useTranslations('profile');

    const avatarUrl = useMemo(
        () => (userDetails?.avatar ? createFileLink(userDetails.avatar) : ''),
        [userDetails],
    );

    const [openEdit, setOpenEdit] = useState(false);
    const onEditClick = useCallback(() => setOpenEdit(true), [setOpenEdit]);

    return (
        <div className="flex flex-row gap-6 w-full p-8">
            {userDetails && (
                <EditProfileDialog
                    open={openEdit}
                    setOpen={setOpenEdit}
                    userDetails={userDetails}
                />
            )}
            <Avatar className="w-24 h-24 border-2 border-white dark:border-zinc-800 shadow-sm">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback>
                    {userDetails?.nickname.toString().slice(0, 2)}
                </AvatarFallback>
            </Avatar>
            <div className="flex flex-1 flex-col gap-2">
                <p className="font-bold text-2xl dark:text-zinc-100">
                    {userDetails?.nickname}
                </p>
                <p className="text-neutral-700 dark:text-zinc-400">
                    {userDetails?.description}
                </p>
            </div>
            <div className="ml-auto flex flex-col gap-2">
                <Button
                    className="cursor-pointer"
                    variant="secondary"
                    onClick={onEditClick}
                >
                    <Pencil className="w-4 h-4" />
                    <p className="hidden sm:block">{t('edit_profile')}</p>
                </Button>
                <Button
                    className="cursor-pointer"
                    variant="secondary"
                    onClick={logOut}
                >
                    <LogOut className="w-4 h-4" />
                    <p className="hidden sm:block">{t('log_out')}</p>
                </Button>
            </div>
        </div>
    );
}

function InterestsBlock({interests}: {interests: string[]}) {
    const t = useTranslations('profile');

    return (
        <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold uppercase mb-2 text-zinc-900 dark:text-zinc-100">
                {t('interests')}
            </h3>
            <div className="flex flex-row gap-2 flex-wrap">
                {interests.map(interest => (
                    <Badge
                        key={interest}
                        variant="secondary"
                        className="dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                    >
                        {interest}
                    </Badge>
                ))}
            </div>
        </div>
    );
}

function FriendCard({friend}: {friend: UserDetailsResponse}) {
    const avatarUrl = useMemo(
        () => (friend.avatar ? createFileLink(friend.avatar) : ''),
        [friend],
    );

    return (
        <div className="w-40 flex flex-col items-center gap-2 bg-white dark:bg-zinc-900 hover:bg-zinc-200 hover:dark:bg-zinc-700 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-2xs cursor-pointer">
            <Avatar className="w-16 h-16">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback>
                    {friend?.nickname.toString().slice(0, 2)}
                </AvatarFallback>
            </Avatar>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {friend?.nickname}
            </p>
            <p className="text-sm text-neutral-500 dark:text-zinc-400 text-center">
                {friend?.description.substring(0, 16)}
                ...
            </p>
        </div>
    );
}

function FriendsBlock({friends}: {friends: UserDetailsResponse[]}) {
    const t = useTranslations('profile');

    return (
        <div className="flex flex-col gap-2">
            <h3 className="flex flex-row gap-2 mb-2">
                <p className="flex-1 text-sm font-semibold uppercase text-zinc-900 dark:text-zinc-100">
                    {t('friends.title')}
                </p>
                <Link
                    href="#"
                    className="text-sm text-neutral-700 dark:text-zinc-400 font-normal hover:underline"
                    hidden={friends.length < 1}
                >
                    {t('friends.see_all')}
                </Link>
            </h3>
            <div className="flex flex-row gap-2 flex-nowrap">
                {friends.slice(0, 3).map(friend => (
                    <FriendCard key={friend.id} friend={friend} />
                ))}
                <p hidden={friends.length > 0}>{t('friends.no_friends')}</p>
            </div>
        </div>
    );
}

function QrCodeCard({url}: {url: string | null}) {
    const t = useTranslations('profile');

    return (
        <div className="md:w-1/4 md:h-fit md:mt-4 md:mr-8 flex flex-col items-center md:items-start gap-6 p-4 md:rounded-xl md:border md:border-zinc-200 dark:md:border-zinc-800 md:bg-white dark:md:bg-zinc-900 text-sm">
            <div className="flex flex-col gap-2 pl-2 pt-2 pr-2">
                <div className="flex flex-row gap-2 items-center font-medium text-zinc-900 dark:text-zinc-100">
                    <QrCodeIcon className="w-4 h-4" /> {t('qr.title')}
                </div>
                <p className="text-neutral-700 dark:text-zinc-400">
                    {t('qr.desc')}
                </p>
            </div>
            <div className="w-full flex flex-col items-center">
                <div className="bg-white p-4 rounded-xl border border-zinc-200">
                    {url ? (
                        <QRCode value={url} className="w-32 h-32" />
                    ) : (
                        <Loader2 className="h-10 w-10 animate-spin text-zinc-400" />
                    )}
                </div>
            </div>
            <div className="w-full flex flex-row gap-2">
                <Button
                    variant="outline"
                    className="flex-1 dark:bg-zinc-950 dark:hover:bg-zinc-800 cursor-pointer"
                    onClick={() => {
                        void navigator.clipboard.writeText(url ?? '');
                        toast.success(t('qr.copied'));
                    }}
                >
                    <Copy className="w-4 h-4 mr-2" /> {t('qr.copy')}
                </Button>
                {/* TODO: Impl saving QR as file (Do we really need this?) */}
                <Button
                    hidden={true}
                    variant="outline"
                    className="flex-1 dark:bg-zinc-950 dark:hover:bg-zinc-800 cursor-pointer"
                >
                    <Save className="w-4 h-4 mr-2" /> {t('qr.save')}
                </Button>
            </div>
        </div>
    );
}

export default function Home() {
    const t = useTranslations('profile');

    const router = useRouter();
    const backend = useBackend();
    const session = useSession();

    useEffect(() => {
        if (session.status === 'guest') router.push('/signIn');
    }, [session.status, router]);

    const logOut = () => {
        session.logOut();
        router.push('/signIn');
    };

    const userQuery = useQuery({
        queryKey: ['userDetails'],
        queryFn: () => backend.getUserDetails(),
        enabled: session.status === 'authed',
    });

    const inviteQuery = useQuery({
        queryKey: ['inviteToken'],
        queryFn: () => backend.generateFriendInvitationToken(),
        enabled: session.status === 'authed',
    });

    const networkQuery = useQuery({
        queryKey: ['networkDetails'],
        queryFn: () => backend.getNetworkDetails(),
        enabled: session.status === 'authed',
    });

    const userResult = userQuery.data ?? null;
    const inviteResult = inviteQuery.data ?? null;
    const networkResult = networkQuery.data ?? null;

    const hasResultError =
        (userResult && !userResult.ok) ||
        (inviteResult && !inviteResult.ok) ||
        (networkResult && !networkResult.ok);

    const errorMessage =
        userResult && !userResult.ok
            ? formatNetworkError(userResult.error)
            : inviteResult && !inviteResult.ok
              ? formatNetworkError(inviteResult.error)
              : networkResult && !networkResult.ok
                ? formatNetworkError(networkResult.error)
                : null;

    const isLoading =
        session.status === 'loading' ||
        userQuery.isLoading ||
        inviteQuery.isLoading;
    const isError = userQuery.isError || inviteQuery.isError || hasResultError;

    const user = userResult?.ok ? userResult.data : null;
    const inviteToken = inviteResult?.ok ? inviteResult.data : null;
    const friends = networkResult?.ok ? networkResult.data.friends : [];

    const qrCodeUrl = useMemo(
        () =>
            user?.id && inviteToken
                ? createFriendInviteLink(user.id, inviteToken)
                : null,
        [inviteToken, user?.id],
    );

    let content;

    if (session.status === 'guest') {
        content = null;
    } else if (isLoading) {
        content = (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-zinc-400" />
            </div>
        );
    } else if (isError) {
        content = (
            <div className="flex flex-col h-[50vh] gap-4 w-full items-center justify-center">
                <Activity className="h-10 w-10 animate-pulse text-foreground/80" />
                <h3>{errorMessage ?? t('unknown_error')}</h3>
            </div>
        );
    } else {
        content = (
            <div className="flex flex-col gap-2 pb-12">
                <ProfileHeader userDetails={user} logOut={logOut} />
                <Separator className="dark:bg-zinc-800" />

                <div className="flex flex-col md:flex-row gap-2">
                    <div className="w-full flex flex-col gap-2 p-8">
                        <InterestsBlock interests={user?.interests ?? []} />
                        <Separator className="my-4 dark:bg-zinc-800" />
                        <FriendsBlock friends={friends} />
                    </div>
                    <QrCodeCard url={qrCodeUrl} />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black">
            <div className="mx-auto md:p-8 md:pt-8 max-w-5xl">
                <div className="bg-white dark:bg-zinc-950 md:rounded-xl md:border md:border-zinc-200 dark:md:border-zinc-800 min-h-[calc(100vh-64px)] md:min-h-0 overflow-hidden transition-colors">
                    {content}
                </div>
            </div>
        </div>
    );
}
