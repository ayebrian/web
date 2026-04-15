'use client';

import {FeedItem, UserDetailsResponse} from '@/network/friendly-client';
import {useEffect, useMemo, useState, useCallback} from 'react';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {Badge} from '@/components/ui/badge';
import {Separator} from '@/components/ui/separator';
import QRCode from 'react-qr-code';
import {
    Activity,
    Check,
    Copy,
    Heart,
    Loader2,
    LogOut,
    Pencil,
    QrCodeIcon,
    Save,
    X,
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
import {toast} from 'sonner';

type SwipeDirection = 'left' | 'right';

function getFeedItemKey(item: FeedItem) {
    return `${item.details.id}-${item.isRequest ? 'request' : 'suggested'}`;
}

function FeedEmptyState() {
    const t = useTranslations('profile.feed');

    return (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-6 text-center dark:border-zinc-800 dark:bg-zinc-900/40">
            <h3 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">
                {t('empty_title')}
            </h3>
            <p className="mt-2 max-w-xs text-sm text-zinc-600 dark:text-zinc-400">
                {t('empty_desc')}
            </p>
        </div>
    );
}

function FeedReviewDeck({
    cards,
    isLoading,
    isRefetching,
    isError,
    errorMessage,
    onRetry,
    onReview,
}: {
    cards: FeedItem[];
    isLoading: boolean;
    isRefetching: boolean;
    isError: boolean;
    errorMessage: string | null;
    onRetry: () => void;
    onReview: (card: FeedItem, direction: SwipeDirection) => Promise<void>;
}) {
    const t = useTranslations('profile.feed');
    const [dragX, setDragX] = useState(0);
    const [activePointerId, setActivePointerId] = useState<number | null>(null);
    const [pendingCardId, setPendingCardId] = useState<string | null>(null);
    const [dragStart, setDragStart] = useState<{x: number; y: number} | null>(
        null,
    );
    const [isDraggingCard, setIsDraggingCard] = useState(false);

    const topCard = cards[0] ?? null;
    const previewCards = cards.slice(0, 3);
    const isBusy = pendingCardId !== null;

    useEffect(() => {
        setDragX(0);
        setActivePointerId(null);
        setDragStart(null);
        setIsDraggingCard(false);
    }, [topCard ? getFeedItemKey(topCard) : null]);

    const commitReview = useCallback(
        async (direction: SwipeDirection) => {
            if (!topCard || isBusy) {
                return;
            }

            setPendingCardId(getFeedItemKey(topCard));
            setDragX(direction === 'right' ? 220 : -220);

            try {
                await onReview(topCard, direction);
            } finally {
                setPendingCardId(null);
                setDragX(0);
                setDragStart(null);
                setIsDraggingCard(false);
            }
        },
        [isBusy, onReview, topCard],
    );

    if (isLoading) {
        return (
            <div className="flex min-h-80 items-center justify-center rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex min-h-80 flex-col items-center justify-center rounded-xl border border-red-200 bg-white px-6 text-center dark:border-red-900/60 dark:bg-zinc-950">
                <Activity className="h-8 w-8 text-red-500" />
                <p className="mt-4 text-sm text-zinc-700 dark:text-zinc-300">
                    {errorMessage ?? t('queue_error')}
                </p>
                <Button className="mt-5 cursor-pointer" onClick={onRetry}>
                    {t('retry')}
                </Button>
            </div>
        );
    }

    if (!topCard) {
        return <FeedEmptyState />;
    }

    const acceptLabel = topCard.isRequest ? t('accept') : t('connect');
    const leftOpacity = Math.min(Math.abs(Math.min(dragX, 0)) / 140, 1);
    const rightOpacity = Math.min(Math.max(dragX, 0) / 140, 1);

    return (
        <div className="flex flex-col gap-3">
            <div className="relative min-h-80 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/40">
                {previewCards
                    .slice()
                    .reverse()
                    .map((card, reverseIndex) => {
                        const index = previewCards.length - 1 - reverseIndex;
                        const isTopCard = index === 0;
                        const scale = 1 - index * 0.02;
                        const translateY = index * 8;
                        const opacity = 1 - index * 0.1;
                        const badgeLabel = card.isRequest
                            ? t('requests_badge')
                            : t('suggested_badge');
                        const hint = card.isRequest
                            ? t('request_hint')
                            : t('suggested_hint');
                        const avatarUrl = card.details.avatar
                            ? createFileLink(card.details.avatar)
                            : '';
                        const meta = [];

                        if (card.isExtendedNetwork) {
                            meta.push(t('extended_network'));
                        }

                        if (card.commonFriends.length > 0) {
                            meta.push(
                                t('common_friends', {
                                    count: card.commonFriends.length,
                                }),
                            );
                        }

                        return (
                            <div
                                key={getFeedItemKey(card)}
                                className="absolute inset-x-3 top-3 bottom-3"
                                style={{
                                    transform: isTopCard
                                        ? `translateX(${dragX}px) rotate(${dragX / 20}deg)`
                                        : `translateY(${translateY}px) scale(${scale})`,
                                    opacity,
                                    zIndex: 10 - index,
                                    transition:
                                        isDraggingCard && isTopCard
                                            ? 'none'
                                            : 'transform 200ms ease, opacity 200ms ease',
                                    touchAction: isTopCard ? 'pan-y' : 'auto',
                                }}
                                onPointerDown={
                                    isTopCard
                                        ? event => {
                                              if (isBusy) {
                                                  return;
                                              }

                                              setActivePointerId(
                                                  event.pointerId,
                                              );
                                              setDragStart({
                                                  x: event.clientX,
                                                  y: event.clientY,
                                              });
                                              setIsDraggingCard(false);
                                          }
                                        : undefined
                                }
                                onPointerMove={
                                    isTopCard
                                        ? event => {
                                              if (
                                                  activePointerId !==
                                                  event.pointerId
                                              ) {
                                                  return;
                                              }

                                              if (!dragStart) {
                                                  return;
                                              }

                                              const deltaX =
                                                  event.clientX - dragStart.x;
                                              const deltaY =
                                                  event.clientY - dragStart.y;

                                              if (!isDraggingCard) {
                                                  if (
                                                      Math.abs(deltaX) < 12 ||
                                                      Math.abs(deltaX) <=
                                                          Math.abs(deltaY)
                                                  ) {
                                                      return;
                                                  }

                                                  event.currentTarget.setPointerCapture(
                                                      event.pointerId,
                                                  );
                                                  setIsDraggingCard(true);
                                              }

                                              event.preventDefault();
                                              setDragX(deltaX);
                                          }
                                        : undefined
                                }
                                onPointerUp={
                                    isTopCard
                                        ? event => {
                                              if (
                                                  activePointerId !==
                                                  event.pointerId
                                              ) {
                                                  return;
                                              }

                                              setActivePointerId(null);
                                              setDragStart(null);

                                              if (!isDraggingCard) {
                                                  setDragX(0);
                                                  return;
                                              }

                                              setIsDraggingCard(false);

                                              if (dragX > 96) {
                                                  void commitReview('right');
                                                  return;
                                              }

                                              if (dragX < -96) {
                                                  void commitReview('left');
                                                  return;
                                              }

                                              setDragX(0);
                                          }
                                        : undefined
                                }
                                onPointerCancel={
                                    isTopCard
                                        ? () => {
                                              setActivePointerId(null);
                                              setDragStart(null);
                                              setIsDraggingCard(false);
                                              setDragX(0);
                                          }
                                        : undefined
                                }
                            >
                                <div className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                                    {isTopCard && (
                                        <>
                                            <div
                                                className="absolute left-4 top-4 rounded-md border border-red-200 bg-white px-2 py-1 text-[10px] font-medium uppercase text-red-500 transition-opacity dark:border-red-900/60 dark:bg-zinc-950"
                                                style={{opacity: leftOpacity}}
                                            >
                                                {t('skip')}
                                            </div>
                                            <div
                                                className="absolute right-4 top-4 rounded-md border border-emerald-200 bg-white px-2 py-1 text-[10px] font-medium uppercase text-emerald-600 transition-opacity dark:border-emerald-900/60 dark:bg-zinc-950"
                                                style={{opacity: rightOpacity}}
                                            >
                                                {acceptLabel}
                                            </div>
                                        </>
                                    )}

                                    <div className="flex items-start justify-between gap-4">
                                        <Badge
                                            variant="secondary"
                                            className="rounded-md text-xs"
                                        >
                                            {badgeLabel}
                                        </Badge>
                                    </div>

                                    <div className="mt-4 flex min-h-0 flex-1 flex-col overflow-y-auto pr-1">
                                        <div className="flex items-start gap-3">
                                            <Avatar className="h-14 w-14 border border-zinc-200 dark:border-zinc-800">
                                                <AvatarImage src={avatarUrl} />
                                                <AvatarFallback className="text-sm font-semibold">
                                                    {card.details.nickname
                                                        .slice(0, 2)
                                                        .toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>

                                            <div className="min-w-0 flex-1">
                                                <h3 className="truncate text-lg font-semibold text-zinc-950 dark:text-zinc-50">
                                                    {card.details.nickname}
                                                </h3>
                                                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                                                    {hint}
                                                </p>
                                                {meta.length > 0 ? (
                                                    <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                                                        {meta.join(' • ')}
                                                    </p>
                                                ) : null}
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <p className="text-sm leading-6 text-zinc-700 dark:text-zinc-300">
                                                {card.details.description ||
                                                    t('no_description')}
                                            </p>
                                        </div>

                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {card.details.interests
                                                .slice(0, 4)
                                                .map(interest => (
                                                    <Badge
                                                        key={`${card.details.id}-${interest}`}
                                                        variant="secondary"
                                                        className="rounded-md text-xs"
                                                    >
                                                        {interest}
                                                    </Badge>
                                                ))}
                                        </div>
                                    </div>

                                    <div className="mt-4 grid shrink-0 grid-cols-2 gap-2">
                                        <Button
                                            variant="outline"
                                            className="h-9 cursor-pointer"
                                            disabled={isBusy}
                                            onPointerDown={event => {
                                                event.stopPropagation();
                                            }}
                                            onClick={() => {
                                                void commitReview('left');
                                            }}
                                        >
                                            <X className="h-4 w-4" />
                                            {t('skip')}
                                        </Button>
                                        <Button
                                            className="h-9 cursor-pointer"
                                            disabled={isBusy}
                                            onPointerDown={event => {
                                                event.stopPropagation();
                                            }}
                                            onClick={() => {
                                                void commitReview('right');
                                            }}
                                        >
                                            {topCard.isRequest ? (
                                                <Check className="h-4 w-4" />
                                            ) : (
                                                <Heart className="h-4 w-4" />
                                            )}
                                            {acceptLabel}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
            </div>

            <div className="flex items-center justify-between px-1 text-xs text-zinc-500 dark:text-zinc-400">
                <span>{cards.length} cards</span>
                <span>
                    {isRefetching ? t('retry') : topCard.details.nickname}
                </span>
            </div>
        </div>
    );
}

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

function DiscoveryFeedBlock() {
    const t = useTranslations('profile.feed');
    const backend = useBackend();

    const feedQuery = useQuery({
        queryKey: ['feedQueue'],
        queryFn: () => backend.getFeedQueue(),
    });

    const [cards, setCards] = useState<FeedItem[]>([]);

    useEffect(() => {
        if (!feedQuery.data?.ok) {
            return;
        }

        setCards(feedQuery.data.data.entries);
    }, [feedQuery.data]);

    const feedErrorMessage =
        feedQuery.data && !feedQuery.data.ok
            ? formatNetworkError(feedQuery.data.error)
            : null;

    const onReview = useCallback(
        async (card: FeedItem, direction: SwipeDirection) => {
            const request = {
                userId: card.details.id,
                userAccessHash: card.details.accessHash,
            };

            const result =
                direction === 'right'
                    ? await backend.sendFriendRequest(request)
                    : await backend.declineFriendRequest(request);

            if (!result.ok) {
                toast.error(formatNetworkError(result.error));
                throw new Error(formatNetworkError(result.error));
            }

            setCards(current =>
                current.filter(
                    item =>
                        item.details.id !== card.details.id ||
                        item.isRequest !== card.isRequest,
                ),
            );

            toast.success(
                direction === 'right'
                    ? card.isRequest
                        ? t('request_success')
                        : t('accept_success')
                    : t('skip_success'),
            );
        },
        [backend, t],
    );

    return (
        <section className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-secondary p-2 text-secondary-foreground">
                        <Heart className="h-4 w-4" />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">
                            {t('title')}
                        </h2>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            {t('desc')}
                        </p>
                    </div>
                </div>
            </div>

            <FeedReviewDeck
                cards={cards}
                isLoading={feedQuery.isLoading}
                isRefetching={feedQuery.isRefetching}
                isError={feedQuery.isError || Boolean(feedErrorMessage)}
                errorMessage={feedErrorMessage}
                onRetry={() => {
                    void feedQuery.refetch();
                }}
                onReview={onReview}
            />
        </section>
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
                        // TODO: Show toast about successful copying
                        void navigator.clipboard.writeText(url ?? '');
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
                    <div className="w-full flex flex-col gap-8 p-8">
                        <InterestsBlock interests={user?.interests ?? []} />
                        <Separator className="my-4 dark:bg-zinc-800" />
                        <FriendsBlock friends={friends} />
                        <Separator className="dark:bg-zinc-800" />
                        <DiscoveryFeedBlock />
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
