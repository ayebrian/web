'use client';

import {FriendlyClient, FriendlyClientImpl} from '@/network/friendly-client';
import {setCookie} from '@/lib/cookies';
import {Button} from '@/components/ui/button';

const client: FriendlyClient = new FriendlyClientImpl();

export default function SignInPage() {
    const registerAccount = async () => {
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

        setCookie('userId', auth.id.toString());
        setCookie('token', auth.token);

        document.location.href = '/';
    };

    return (
        <div className="p-8 flex flex-col">
            <Button
                className="cursor-pointer"
                onClick={() => {
                    void registerAccount();
                }}
            >
                Create demo account
            </Button>
        </div>
    );
}
