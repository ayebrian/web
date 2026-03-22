'use client';

import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {useRouter} from 'next/navigation';
import {useBackend} from '@/backend.context';
import {Avatar, AvatarImage} from '@/components/ui/avatar';
import {useEffect, useRef, useState} from 'react';
import {UploadIcon} from 'lucide-react';
import {cn} from '@/lib/utils';
import {useMutation} from '@tanstack/react-query';
import {useSession} from '@/components/session-provider';

export default function SignInPage() {
    const router = useRouter();
    const backend = useBackend();
    const session = useSession();

    const [nickname, setNickname] = useState('');
    const [description, setDescription] = useState('');
    const [interests, setInterests] = useState('');
    const [socialLink, setSocialLink] = useState('');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);

    const avatarInputRef = useRef<HTMLInputElement | null>(null);

    const [avatarBlobUrl, setAvatarBlobUrl] = useState<string | null>(null);
    useEffect(() => {
        // eslint-disable-next-line n/no-unsupported-features/node-builtins
        if (avatarFile) setAvatarBlobUrl(URL.createObjectURL(avatarFile));
        return () => {
            // eslint-disable-next-line n/no-unsupported-features/node-builtins
            if (avatarBlobUrl) URL.revokeObjectURL(avatarBlobUrl);
        };
    }, [avatarFile]);

    const uploadMutation = useMutation({
        mutationFn: (file: File) => backend.uploadFile(file),
    });

    const createAccountMutation = useMutation({
        mutationFn: async () => {
            const avatarFileDescriptor = avatarFile
                ? await uploadMutation.mutateAsync(avatarFile)
                : null;

            return backend.generateAccount(
                nickname,
                description,
                interests.split(',').map(interest => interest.trim()),
                avatarFileDescriptor,
                socialLink.length > 0 ? socialLink : null,
            );
        },
        onSuccess: auth => {
            backend.storeAuthorization(auth.token, auth.id.toString());
            session.setAuthed();
            router.push('/');
        },
    });

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
            <Button
                className="cursor-pointer"
                onClick={() => createAccountMutation.mutate()}
                disabled={
                    createAccountMutation.isPending ||
                    nickname.length < 3 ||
                    description.length < 3 ||
                    interests.length < 1
                }
            >
                {createAccountMutation.isPending
                    ? 'Loading...'
                    : 'Create account'}
            </Button>
        </div>
    );
}
