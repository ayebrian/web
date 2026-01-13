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
import {Copy, Pencil, QrCodeIcon, Save} from 'lucide-react';
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
        <div className="min-h-screen">
            <div className="mx-auto md:p-8 md:pt-8 max-w-5xl">
                <div className="bg-white md:rounded-xl md:border md:border-zinc-200 min-h-[calc(100vh-64px)] md:min-h-0 overflow-hidden pb-12">
                    <div
                        className="flex flex-col gap-2"
                        hidden={userDetails === null}
                    >
                        <div className="flex flex-row gap-6 w-full p-8">
                            <Avatar className="w-24 h-24">
                                <AvatarImage
                                    src={`https://github.com/${userDetails?.nickname}.png`}
                                />
                                <AvatarFallback>
                                    {userDetails?.nickname
                                        .toString()
                                        .slice(0, 2)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-1 flex-col gap-2">
                                <p className="font-bold text-2xl">
                                    {userDetails?.nickname}
                                </p>
                                <p className="text-neutral-700">
                                    {userDetails?.description}
                                </p>
                            </div>
                            <div className="ml-auto">
                                <Button variant="default" asChild>
                                    <Link href="#">
                                        <Pencil />
                                        Edit profile
                                    </Link>
                                </Button>
                            </div>
                        </div>
                        <Separator />
                        <div className="flex flex-row gap-2">
                            <div className="w-full flex flex-col gap-2 p-8">
                                <div className="flex flex-col gap-2">
                                    <h3 className="text-sm font-semibold uppercase mb-2">
                                        Interests
                                    </h3>
                                    <div className="flex flex-row gap-2">
                                        {userDetails?.interests.map(
                                            interest => (
                                                <Badge
                                                    key={interest}
                                                    variant="secondary"
                                                >
                                                    {interest}
                                                </Badge>
                                            ),
                                        )}
                                    </div>
                                </div>
                                <Separator className="my-4" />
                                <div className="flex flex-col gap-2">
                                    <h3 className="text-sm font-semibold uppercase mb-2">
                                        Friends
                                    </h3>
                                    <div className="flex flex-row gap-2">
                                        {fakeFriends.slice(0, 3).map(friend => (
                                            <div
                                                key={friend.username}
                                                className="w-40 flex flex-col items-center gap-2 bg-white rounded-xl border md:border-zinc-200  p-4"
                                            >
                                                <Avatar className="w-16 h-16">
                                                    <AvatarImage src="https://github.com/torvalds.png" />
                                                    <AvatarFallback>
                                                        {friend?.username
                                                            .toString()
                                                            .slice(0, 2)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <p className="text-sm font-semibold">
                                                    {friend?.username}
                                                </p>
                                                <p className="text-sm">
                                                    {friend?.description.substring(
                                                        0,
                                                        16,
                                                    )}
                                                    ...
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="w-1/4 h-fit mt-4 mr-8 flex flex-col gap-2 p-8 rounded-xl  border border-zinc-200 bg-white text-sm">
                                <div className="flex flex-row gap-2 items-center">
                                    <QrCodeIcon /> My QR Code
                                </div>
                                <p className="text-neutral-700">
                                    Share your profile to make connections.
                                </p>
                                <div className="w-full flex flex-col items-center mt-6">
                                    <QRCode value="hey" className="w-36 h-36" />
                                </div>
                                <div className="w-full flex flex-row justify-evenly mt-6">
                                    <Button variant="outline" className="w-fit">
                                        <Copy /> Copy
                                    </Button>
                                    <Button variant="outline">
                                        <Save /> Save
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
