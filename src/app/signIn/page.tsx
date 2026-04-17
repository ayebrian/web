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
import {err} from '@/network/result';
import {formatNetworkError} from '@/services/backend-service';
import {useTranslations} from 'next-intl';

export default function SignInPage() {
    const t = useTranslations('sign_in');

    const router = useRouter();
    const backend = useBackend();
    const session = useSession();

    const [nickname, setNickname] = useState('');
    const [description, setDescription] = useState('');
    const [interests, setInterests] = useState('');
    const [socialLink, setSocialLink] = useState('');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [formError, setFormError] = useState<string | null>(null);

    const avatarInputRef = useRef<HTMLInputElement | null>(null);

    const [avatarBlobUrl, setAvatarBlobUrl] = useState<string | null>(null);
    useEffect(() => {
        if (avatarFile) setAvatarBlobUrl(URL.createObjectURL(avatarFile));
        return () => {
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

            if (
                avatarFile &&
                avatarFileDescriptor &&
                !avatarFileDescriptor.ok
            ) {
                return err(avatarFileDescriptor.error);
            }

            return backend.generateAccount(
                nickname,
                description,
                interests.split(',').map(interest => interest.trim()),
                avatarFileDescriptor && avatarFileDescriptor.ok
                    ? avatarFileDescriptor.data
                    : null,
                socialLink.length > 0 ? socialLink : null,
            );
        },
        onMutate: () => setFormError(null),
        onSuccess: auth => {
            if (!auth.ok) {
                setFormError(formatNetworkError(auth.error));
                return;
            }
            backend.storeAuthorization(
                auth.data.token,
                auth.data.id.toString(),
            );
            session.setAuthed();
            router.push('/');
        },
    });

    return (
        <div className="p-8 md:p-64 flex flex-col gap-4">
            {formError ? (
                <div className="text-sm text-red-500">{formError}</div>
            ) : null}
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
                    accept="image/*"
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
                placeholder={t('nickname')}
                value={nickname}
                onChange={e => setNickname(e.target.value)}
            />
            <Input
                type="text"
                placeholder={t('description')}
                value={description}
                onChange={e => setDescription(e.target.value)}
            />
            <Input
                type="text"
                placeholder={t('interests')}
                value={interests}
                onChange={e => setInterests(e.target.value)}
            />
            <Input
                type="text"
                placeholder={t('social_link')}
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
                    ? t('loading')
                    : t('create_account')}
            </Button>
        </div>
    );
}
