'use client';

import {FriendlyClient, FriendlyClientImpl} from '@/network/friendly-client';
import {setCookie} from '@/lib/cookies';
import {Button} from '@/components/ui/button';
import {useState} from 'react';
import {Input} from '@/components/ui/input';
import {
    Item,
    ItemContent,
    ItemDescription,
    ItemTitle,
} from '@/components/ui/item';
import {useRouter} from 'next/navigation';

const client: FriendlyClient = new FriendlyClientImpl();

interface PageState {
    nickname: string;
    description: string;
    interests: string;
    socialLink: string;
}

export default function SignInPage() {
    const router = useRouter();

    const [state, setState] = useState<PageState>({
        nickname: '',
        description: '',
        interests: '',
        socialLink: '',
    });

    const registerAccount = async () => {
        const auth = await client.generateAccount({
            nickname: state.nickname,
            description: state.description,
            interests: state.interests
                .split(',')
                .map(interest => interest.trim()),
            avatar: null,
            socialLink: state.socialLink.length > 0 ? state.socialLink : null,
        });
        console.log(auth);
        client.setAuthToken(auth.token, auth.id.toString());
        const details = await client.getUserDetails();
        console.log(details);

        setCookie('userId', auth.id.toString());
        setCookie('token', auth.token);

        router.push('/');
    };

    return (
        <div className="p-8 md:p-64 flex flex-col gap-4">
            <Input
                type="text"
                placeholder="Nickname"
                value={state.nickname}
                onChange={e => setState({...state, nickname: e.target.value})}
            />
            <Input
                type="text"
                placeholder="Description"
                value={state.description}
                onChange={e =>
                    setState({...state, description: e.target.value})
                }
            />
            <Input
                type="text"
                placeholder="Interests (separated by ,)"
                value={state.interests}
                onChange={e => setState({...state, interests: e.target.value})}
            />
            <Input
                type="text"
                placeholder="Social link (Optinal)"
                value={state.socialLink}
                onChange={e => setState({...state, socialLink: e.target.value})}
            />
            <Item variant="outline">
                <ItemContent>
                    <ItemTitle>TODO</ItemTitle>
                    <ItemDescription>Avatar field is missing.</ItemDescription>
                </ItemContent>
            </Item>

            <Button
                className="cursor-pointer"
                onClick={() => {
                    void registerAccount();
                }}
                disabled={
                    state.nickname.length < 3 ||
                    state.description.length < 3 ||
                    state.interests.length < 1
                }
            >
                Create account
            </Button>
        </div>
    );
}
