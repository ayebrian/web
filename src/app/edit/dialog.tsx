import * as Dialog from '@radix-ui/react-dialog';
import {UsersEditRequest} from '@/network/friendly-client';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
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

// TODO:
// * Refresh underlying page once edit is successful
// * Support avatar and social link
// * use https://github.com/arvind-iyer-2001/zepto-chip/tree/master/src/components for interests
export function EditProfileDialog({
    open,
    setOpen,
    userDetails,
}: EditProfileProps): ReactNode {
    const t = useTranslations('edit_profile_dialog');

    const [loading, setLoading] = useState(false);

    const [nickname, setNickname] = useState(userDetails.nickname);
    const [nicknameError, setNicknameError] = useState<string | null>();

    const [description, setDescription] = useState(userDetails.description);
    const [descriptionError, setDescriptionError] = useState<string | null>();

    const [interests, setInterests] = useState(
        userDetails.interests.join(', '),
    );
    const [interestsError, setInterestsError] = useState<string | null>();

    const backend = useBackend();

    function validateNickname(): string | undefined {
        setNicknameError(null);
        const value = nickname?.trim();
        if (!value) {
            setNicknameError(t('nickname-empty'));
            return;
        }
        if (value.length > 256) {
            setNicknameError(t('nickname-long'));
            return;
        }
        return value;
    }

    function validateDescription(): string | undefined {
        setDescriptionError(null);
        const value = description.trim();
        if (value.length === 0) {
            setDescriptionError(t('description-empty'));
            return;
        }
        if (value.length > 1024) {
            setDescriptionError(t('description-long'));
            return;
        }
        return value;
    }

    function validateInterests(): [boolean, string[]] {
        setInterestsError(null);
        const value = interests.trim().split(',');
        if (value.length > 100) {
            setInterestsError(t('interests-too-many'));
            return [false, []];
        }
        const validated: string[] = [];
        for (let interest of value) {
            interest = interest.trim();
            if (interest.length === 0) {
                setInterestsError(t('interest-empty'));
                return [false, []];
            }
            if (interest.length > 64) {
                setInterestsError(t('interest-too-long'));
                return [false, []];
            }
            if (validated.includes(interest)) {
                setInterestsError(t('interest-duplicate', {interest}));
                return [false, []];
            }
            validated.push(interest);
        }
        console.log(validated);
        return [true, validated];
    }

    function validate(): UsersEditRequest | undefined {
        const nickname = validateNickname();
        const description = validateDescription();
        const [interestsValid, interests] = validateInterests();
        if (!nickname || !description || !interestsValid) return;
        return {
            nickname: {value: nickname},
            description: {value: description},
            interests: {value: interests},
        };
    }

    async function onSave() {
        const validated = validate();
        if (!validated) return;
        setLoading(true);
        const result = await backend.usersEdit(validated);
        setLoading(false);
        if (result.ok) {
            setOpen(false);
        } else {
            toast.error(t('error-connection'));
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
                    <div className="p-4 space-y-4">
                        <FieldGroup className="gap-4">
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
                            <Field>
                                <FieldLabel htmlFor="description">
                                    {t('description')}
                                </FieldLabel>
                                <Textarea
                                    id="description"
                                    value={description}
                                    onChange={e =>
                                        setDescription(e.target.value)
                                    }
                                />
                                <FieldError>{descriptionError}</FieldError>
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="interests">
                                    {t('interests')}
                                </FieldLabel>
                                <Input
                                    id="interests"
                                    type="text"
                                    value={interests}
                                    onChange={e => setInterests(e.target.value)}
                                />
                                <FieldError>{interestsError}</FieldError>
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
