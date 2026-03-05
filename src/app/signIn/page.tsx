'use client';

import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {
    Item,
    ItemContent,
    ItemDescription,
    ItemTitle,
} from '@/components/ui/item';
import {useRouter} from 'next/navigation';
import {useBackend} from '@/backend.context';
import {useSignUpStore} from '@/stores/signup.store';

export default function SignInPage() {
    const router = useRouter();
    const backend = useBackend();

    const {
        nickname,
        description,
        interests,
        socialLink,

        setNickname,
        setDescription,
        setInterests,
        setSocialLink,
    } = useSignUpStore();

    const registerAccount = async () => {
        const auth = await backend.generateAccount(
            nickname,
            description,
            interests.split(',').map(interest => interest.trim()),
            null, // Avatar
            socialLink.length > 0 ? socialLink : null,
        );
        console.log(auth);
        backend.storeAuthorization(auth.token, auth.id.toString());
        const details = await backend.getUserDetails();
        console.log(details);

        router.push('/');
    };

    return (
        <div className="p-8 md:p-64 flex flex-col gap-4">
            <Input
                type="text"
                placeholder="Nickname"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
            />
            <Input
                type="text"
                placeholder="Description"
                value={description}
                onChange={e => setDescription(e.target.value)}
            />
            <Input
                type="text"
                placeholder="Interests (separated by ,)"
                value={interests}
                onChange={e => setInterests(e.target.value)}
            />
            <Input
                type="text"
                placeholder="Social link (Optinal)"
                value={socialLink}
                onChange={e => setSocialLink(e.target.value)}
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
                    nickname.length < 3 ||
                    description.length < 3 ||
                    interests.length < 1
                }
            >
                Create account
            </Button>
        </div>
    );
}
