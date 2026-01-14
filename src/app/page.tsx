'use client';

import {
    FriendlyClient,
    FriendlyClientImpl,
    UserDetailsResponse,
} from '@/network/friendly-client';
import {useEffect, useState} from 'react';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {Badge} from '@/components/ui/badge';
import {Separator} from '@/components/ui/separator';
import QRCode from 'react-qr-code';
import {Copy, Loader2, Pencil, QrCodeIcon, Save} from 'lucide-react';
import {Button} from '@/components/ui/button';
import Link from 'next/link';

const client: FriendlyClient = new FriendlyClientImpl();

interface Friend {
    username: string;
    description: string;
    avatar: string | null;
}

const fakeFriends: Friend[] = [
    {
        username: 'Mark Zukeberg',
        description: 'CEO of Winux',
        avatar: null,
    },
    {
        username: 'dorivan',
        description: 'Python enjoyer, car master and just your friend.',
        avatar: null,
    },
    {
        username: 'nikita8888',
        description: 'i am so dumb',
        avatar: null,
    },
    {
        username: 'oclikk',
        description: 'Youtuber and programmer',
        avatar: null,
    },
    {
        username: 'y9san9',
        description: 'Founder of Friendly',
        avatar: null,
    },
];

function ProfileHeader({
    userDetails,
}: {
    userDetails: UserDetailsResponse | null;
}) {
    return (
        <div className="flex flex-row gap-6 w-full p-8">
            <Avatar className="w-24 h-24 border-2 border-white dark:border-zinc-800 shadow-sm">
                <AvatarImage
                    src={`https://github.com/${userDetails?.nickname}.png`}
                />
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
            <div className="ml-auto">
                <Button variant="default" asChild>
                    <Link href="#">
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit profile
                    </Link>
                </Button>
            </div>
        </div>
    );
}

function InterestsBlock({interests}: {interests: string[]}) {
    return (
        <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold uppercase mb-2 text-zinc-900 dark:text-zinc-100">
                Interests
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

function FriendCard({friend}: {friend: Friend}) {
    return (
        <div className="w-40 flex flex-col items-center gap-2 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm">
            <Avatar className="w-16 h-16">
                <AvatarImage
                    src={`https://github.com/${friend.username}.png`}
                />
                <AvatarFallback>
                    {friend?.username.toString().slice(0, 2)}
                </AvatarFallback>
            </Avatar>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {friend?.username}
            </p>
            <p className="text-sm text-neutral-500 dark:text-zinc-400 text-center">
                {friend?.description.substring(0, 16)}
                ...
            </p>
        </div>
    );
}

function FriendsBlock() {
    return (
        <div className="flex flex-col gap-2">
            <h3 className="flex flex-row gap-2 mb-2">
                <p className="flex-1 text-sm font-semibold uppercase text-zinc-900 dark:text-zinc-100">
                    Friends
                </p>
                <Link
                    href="#"
                    className="text-sm text-neutral-700 dark:text-zinc-400 font-normal hover:underline"
                >
                    All friends
                </Link>
            </h3>
            <div className="flex flex-row gap-2 flex-nowrap">
                {fakeFriends.slice(0, 3).map(friend => (
                    <FriendCard key={friend.username} friend={friend} />
                ))}
            </div>
        </div>
    );
}

function QrCodeCard() {
    return (
        <div className="md:w-1/4 md:h-fit md:mt-4 md:mr-8 flex flex-col items-center md:items-start gap-6 p-4 md:rounded-xl md:border md:border-zinc-200 dark:md:border-zinc-800 md:bg-white dark:md:bg-zinc-900 text-sm">
            <div className="flex flex-col gap-2 pl-2 pt-2 pr-2">
                <div className="flex flex-row gap-2 items-center font-medium text-zinc-900 dark:text-zinc-100">
                    <QrCodeIcon className="w-4 h-4" /> My QR Code
                </div>
                <p className="text-neutral-700 dark:text-zinc-400">
                    Share your profile to make connections.
                </p>
            </div>
            <div className="w-full flex flex-col items-center">
                <div className="bg-white p-4 rounded-xl border border-zinc-200">
                    <QRCode value="hey" className="w-32 h-32" />
                </div>
            </div>
            <div className="w-full flex flex-row gap-2">
                <Button
                    variant="outline"
                    className="flex-1 dark:bg-zinc-950 dark:hover:bg-zinc-800"
                >
                    <Copy className="w-4 h-4 mr-2" /> Copy
                </Button>
                <Button
                    variant="outline"
                    className="flex-1 dark:bg-zinc-950 dark:hover:bg-zinc-800"
                >
                    <Save className="w-4 h-4 mr-2" /> Save
                </Button>
            </div>
        </div>
    );
}

export default function Home() {
    const [userDetails, setUserDetails] = useState<UserDetailsResponse | null>(
        null,
    );

    const loadData = async () => {
        const auth = await client.generateAccount({
            nickname: 'kotleni',
            description:
                '23 y.o. dude, programmer, linux user, engineer and sometimes - human.',
            interests: ['typescript', 'kotlin', 'linux', 'cats', 'catgirls'],
            avatar: null,
            socialLink: null,
        });
        console.log(auth);
        client.setAuthToken(auth.token, auth.id.toString());
        const details = await client.getUserDetails();
        console.log(details);

        setUserDetails(details);
    };

    useEffect(() => {
        void loadData();
    }, []);

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black">
            <div className="mx-auto md:p-8 md:pt-8 max-w-5xl">
                <div className="bg-white dark:bg-zinc-950 md:rounded-xl md:border md:border-zinc-200 dark:md:border-zinc-800 min-h-[calc(100vh-64px)] md:min-h-0 overflow-hidden transition-colors">
                    {!userDetails ? (
                        <div className="flex h-[50vh] w-full items-center justify-center">
                            <Loader2 className="h-10 w-10 animate-spin text-zinc-400" />
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2 pb-12">
                            <ProfileHeader userDetails={userDetails} />
                            <Separator className="dark:bg-zinc-800" />

                            <div className="flex flex-col md:flex-row gap-2">
                                <div className="w-full flex flex-col gap-2 p-8">
                                    <InterestsBlock
                                        interests={userDetails?.interests ?? []}
                                    />
                                    <Separator className="my-4 dark:bg-zinc-800" />
                                    <FriendsBlock />
                                </div>
                                <QrCodeCard />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
