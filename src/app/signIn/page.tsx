'use client';

import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {useRouter} from 'next/navigation';
import {useBackend} from '@/backend.context';
import {useSignUpStore} from '@/stores/signup.store';
import {FileDescriptor} from '@/network/friendly-client';
import {Avatar, AvatarImage} from '@/components/ui/avatar';
import {useMemo, useRef} from 'react';
import {UploadIcon} from 'lucide-react';
import {cn} from '@/lib/utils';

export default function SignInPage() {
    const router = useRouter();
    const backend = useBackend();

    const {
        nickname,
        description,
        interests,
        socialLink,
        avatarFile,

        setNickname,
        setDescription,
        setInterests,
        setSocialLink,
        setAvatarFile,
    } = useSignUpStore();

    const avatarInputRef = useRef<HTMLInputElement | null>(null);

    const avatarBlobUrl = useMemo(() => {
        // eslint-disable-next-line n/no-unsupported-features/node-builtins
        return avatarFile ? URL.createObjectURL(avatarFile) : null;
    }, [avatarFile]);

    const registerAccount = async () => {
        let avatarFileDescriptor: FileDescriptor | null = null;

        if (avatarFile) {
            console.log('Uploading file:', avatarFile.name);
            avatarFileDescriptor = await backend.uploadFile(avatarFile);

            if (avatarFileDescriptor)
                console.log(
                    'Avatar file uploaded. id =',
                    avatarFileDescriptor.id,
                );
            else console.warn('Avatar file not uploaded. Why?');
        }

        const auth = await backend.generateAccount(
            nickname,
            description,
            interests.split(',').map(interest => interest.trim()),
            avatarFileDescriptor,
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
            <div className="w-full flex justify-center">
                <button
                    className="relative cursor-pointer group"
                    onClick={() => avatarInputRef?.current?.click()}
                >
                    <Avatar
                        className={cn(
                            'w-24 h-24 border-2 border-white dark:border-zinc-800 shadow-sm',
                            avatarBlobUrl
                                ? 'group-hover:opacity-40'
                                : 'group-hover:shadow-md',
                        )}
                    >
                        <AvatarImage src={avatarBlobUrl ?? undefined} />
                    </Avatar>
                    <UploadIcon
                        className={cn(
                            'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
                            avatarBlobUrl ? 'hidden group-hover:block' : '',
                        )}
                    />
                </button>

                <input
                    className="hidden"
                    ref={avatarInputRef}
                    type="file"
                    placeholder="Avatar"
                    onChange={e => {
                        const files = e.target.files;
                        if (files) {
                            console.log('Avatar file selected:', files[0].name);

                            setAvatarFile(files[0]);
                        }
                    }}
                />
            </div>
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
            {/* <Item variant="outline"> */}
            {/* <ItemContent> */}
            {/* <ItemTitle>TODO</ItemTitle> */}
            {/* <ItemDescription>Avatar field is missing.</ItemDescription> */}
            {/* </ItemContent> */}
            {/* </Item> */}

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
