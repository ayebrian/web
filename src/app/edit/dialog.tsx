import * as Dialog from '@radix-ui/react-dialog';
import {Input} from '@/components/ui/input';
import {toast} from 'sonner';
import {Save, X} from 'lucide-react';
import {useBackend} from '@/backend.context';
import {Spinner} from '@/components/ui/spinner';
import {
    Field,
    // FieldContent,
    // FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
    // FieldLegend,
    // FieldSeparator,
    // FieldSet,
    // FieldTitle,
} from '@/components/ui/field';
// import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {ReactNode, useState} from 'react';
import {UserDetailsResponse} from '@/network/friendly-client';
// import {createFileLink} from '@/lib/utils';
import {useTranslations} from 'next-intl';
import {Button} from '@/components/ui/button';

interface EditProfileProps {
    open: boolean;
    setOpen: (value: boolean) => void;
    userDetails: UserDetailsResponse;
}

export function EditProfileDialog({
    open,
    setOpen,
    userDetails,
}: EditProfileProps): ReactNode {
    const t = useTranslations('edit_profile_dialog');

    const [loading, setLoading] = useState(false);

    const [nickname, setNickname] = useState(userDetails.nickname);
    const [nicknameError, setNicknameError] = useState<string | null>();

    const backend = useBackend();

    function validateNickname(): boolean {
        const value = nickname?.trim();
        setNicknameError(null);
        if (!value) {
            setNicknameError(t('nickname-empty'));
            return false;
        }
        if (value.length > 1024) {
            setNicknameError(t('nickname-long'));
            return false;
        }
        return true;
    }

    function validate(): boolean {
        let valid = true;
        valid = valid && validateNickname();
        return valid;
    }

    async function onSave() {
        if (!validate()) return;
        setLoading(true);
        const result = await backend.usersEdit({
            nickname: {value: nickname},
        });
        setLoading(false);
        if (!result.ok) {
            toast.error('Hi');
        }
    }

    // const avatarUrl = useMemo(
    //     () => (userDetails?.avatar ? createFileLink(userDetails.avatar) : ''),
    //     [userDetails],
    // );

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
                <Dialog.Content
                    className="
                    fixed left-1/2 top-1/2
                    -translate-x-1/2 -translate-y-1/2

                    w-full max-w-md

                    rounded-xl bg-white dark:bg-zinc-900
                    shadow-xl
                    "
                >
                    <div className="relative flex items-center mt-1 mx-1">
                        <Dialog.Title className="w-full text-lg font-semibold text-center pt-2">
                            {t('title')}
                        </Dialog.Title>

                        <Dialog.Close
                            className="absolute right-0 top-0"
                            asChild
                        >
                            <Button variant="ghost">
                                <X />
                            </Button>
                        </Dialog.Close>
                    </div>
                    {/* <div className="mt-4 space-y-3">  todo */}
                    {/* <Avatar className="w-24 h-24 border-2 border-white dark:border-zinc-800 shadow-sm"> */}
                    {/*     <AvatarImage src={avatarUrl} /> */}
                    {/*     <AvatarFallback> */}
                    {/*         {userDetails?.nickname.toString().slice(0, 2)} */}
                    {/*     </AvatarFallback> */}
                    {/* </Avatar> */}
                    {/* <div className="flex flex-1 flex-col gap-2"> */}
                    {/*     <p className="font-bold text-2xl dark:text-zinc-100"> */}
                    {/*         {userDetails?.nickname} */}
                    {/*     </p> */}
                    {/*     <p className="text-neutral-700 dark:text-zinc-400"> */}
                    {/*         {userDetails?.description} */}
                    {/*     </p> */}
                    {/* </div> */}
                    <div className="p-4 space-y-4">
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="nickname">
                                    {t('nickname')}
                                </FieldLabel>
                                <Input
                                    id="nickname"
                                    type="text"
                                    value={nickname}
                                    onChange={e => setNickname(e.target.value)}
                                />
                                <FieldError>{nicknameError}</FieldError>
                            </Field>
                        </FieldGroup>
                        <div className="ml-auto flex flex-col gap-2">
                            <Button
                                className="cursor-pointer"
                                variant="secondary"
                                onClick={onSave}
                            >
                                {!loading && (
                                    <>
                                        <Save className="w-4 h-4" />
                                        <p className="hidden sm:block">
                                            {t('save')}
                                        </p>
                                    </>
                                )}
                                {loading && <Spinner />}
                            </Button>
                        </div>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
