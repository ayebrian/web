import * as Dialog from '@radix-ui/react-dialog';
import {UsersEditRequest, FileDescriptor} from '@/network/friendly-client';
import {createFileLink} from '@/lib/utils';
import {Textarea} from '@/components/ui/textarea';
import {toast} from 'sonner';
import {
    Save,
    X,
    User,
    Link,
    Heart,
    Pencil,
    Trash2,
    ImageIcon,
} from 'lucide-react';
import {useBackend} from '@/backend.context';
import {Spinner} from '@/components/ui/spinner';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from '@/components/ui/input-group';
import {Field, FieldError, FieldGroup, FieldLabel} from '@/components/ui/field';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {ReactNode, useState, useRef} from 'react';
import {UserDetailsResponse} from '@/network/friendly-client';
// import {createFileLink} from '@/lib/utils';
import {useTranslations} from 'next-intl';
import {Button} from '@/components/ui/button';

interface EditProfileProps {
    open: boolean;
    setOpen: (value: boolean) => void;
    userDetails: UserDetailsResponse;
}

// This regex is not meant to be a valid check for URL.
//
// URL check according to specification is not applicable in this case, because
// users will paste URLs like 'x.com/y9san9'.
//
// This check is meant to save from most typos made by users
const socialLinkRegex = /^(https?:\/\/)?\S+\.\S+$/;

// TODO:
// * Migrate all validation to another file, so it can be reused in signIn page
// * Add icons to fields
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
    const [avatarLoading, setAvatarLoading] = useState(false);

    const [nickname, setNickname] = useState(userDetails.nickname);
    const [nicknameError, setNicknameError] = useState<string | null>();

    const [description, setDescription] = useState(userDetails.description);
    const [descriptionError, setDescriptionError] = useState<string | null>();

    const [socialLink, setSocialLink] = useState(userDetails.socialLink ?? '');
    const [socialLinkError, setSocialLinkError] = useState<string | null>();

    const [interests, setInterests] = useState(
        userDetails.interests.join(', '),
    );
    const [interestsError, setInterestsError] = useState<string | null>();

    const [avatar, setAvatar] = useState(userDetails.avatar);

    const backend = useBackend();

    function validateNickname(): string | undefined {
        setNicknameError(null);
        const value = nickname.trim();
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

    function validateSocialLink(): [boolean, string | null] {
        setSocialLinkError(null);
        const value = socialLink.trim();
        if (value.length === 0) {
            return [true, null];
        }
        if (!socialLinkRegex.test(value)) {
            setSocialLinkError(t('social-link-invalid'));
            return [false, null];
        }
        if (value.length > 2048) {
            setSocialLinkError(t('social-link-too-long'));
            return [false, null];
        }
        return [true, value];
    }

    function validateInterests(): [boolean, string[]] {
        setInterestsError(null);
        if (interests.trim().length === 0) {
            return [true, []];
        }
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
        const [socialLinkValid, socialLink] = validateSocialLink();
        const [interestsValid, interests] = validateInterests();
        if (!nickname || !description || !interestsValid || !socialLinkValid) {
            return;
        }
        return {
            nickname: {value: nickname},
            description: {value: description},
            socialLink: {value: socialLink},
            interests: {value: interests},
            avatar: {value: avatar},
        };
    }

    async function onSave() {
        if (loading) return;
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
                        <Dialog.Title className="w-full text-md font-semibold text-center pt-2">
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
                        <AvatarContent
                            nickname={nickname}
                            loading={avatarLoading}
                            setLoading={setAvatarLoading}
                            avatar={userDetails.avatar}
                            setAvatar={setAvatar}
                        />
                        <FieldGroup className="gap-4">
                            <Field>
                                <FieldLabel htmlFor="nickname">
                                    {t('nickname')}
                                </FieldLabel>
                                <InputGroup>
                                    <InputGroupInput
                                        id="nickname"
                                        type="text"
                                        value={nickname}
                                        onChange={e =>
                                            setNickname(e.target.value)
                                        }
                                    />
                                    <InputGroupAddon>
                                        <User />
                                    </InputGroupAddon>
                                </InputGroup>
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
                                <FieldLabel htmlFor="socialLink">
                                    {t('social-link')}
                                </FieldLabel>
                                <InputGroup>
                                    <InputGroupInput
                                        id="socialLink"
                                        type="text"
                                        value={socialLink}
                                        placeholder="https://example.org"
                                        onChange={e =>
                                            setSocialLink(e.target.value)
                                        }
                                    />
                                    <InputGroupAddon>
                                        <Link />
                                    </InputGroupAddon>
                                </InputGroup>
                                <FieldError>{socialLinkError}</FieldError>
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="interests">
                                    {t('interests')}
                                </FieldLabel>
                                <InputGroup>
                                    <InputGroupInput
                                        id="interests"
                                        type="text"
                                        value={interests}
                                        placeholder={t('interests-placeholder')}
                                        onChange={e =>
                                            setInterests(e.target.value)
                                        }
                                    />
                                    <InputGroupAddon>
                                        <Heart />
                                    </InputGroupAddon>
                                </InputGroup>
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

interface AvatarContentProps {
    nickname: string;
    loading: boolean;
    setLoading: (value: boolean) => void;
    avatar: FileDescriptor | null;
    setAvatar: (value: FileDescriptor | null) => void;
}

function AvatarContent({
    nickname,
    loading,
    setLoading,
    avatar,
    setAvatar,
}: AvatarContentProps): ReactNode {
    const backend = useBackend();
    const t = useTranslations('edit_profile_dialog');

    const avatarInputRef = useRef<HTMLInputElement | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(
        avatar ? createFileLink(avatar) : null,
    );

    async function onSelected(file: File | null) {
        if (!file) {
            setAvatar(null);
            setAvatarUrl(null);
            return;
        }
        setAvatarUrl(URL.createObjectURL(file));
        setLoading(true);
        const result = await backend.uploadFile(file);
        setLoading(false);
        if (result.ok) {
            setAvatar(result.data);
        } else {
            toast.error(t('error-connection'));
        }
    }

    return (
        <div className="w-full flex justify-center">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <div className="relative cursor-pointer">
                        <Avatar className="w-22 h-22 border-2 border-white dark:border-zinc-800 shadow-sm">
                            <AvatarImage
                                className={
                                    loading ? 'blur-xs brightness-50' : ''
                                }
                                src={avatarUrl ?? undefined}
                            />
                            <AvatarFallback>
                                <span className="text-xl">
                                    {getAvatarFallbackForNickname(nickname)}
                                </span>
                            </AvatarFallback>
                        </Avatar>
                        <div className="size-6 absolute bottom-1 right-1 rounded-full bg-white border border-zinc-200 dark:bg-zinc-800 dark:border-zinc-600">
                            <Pencil className="size-full p-1" />
                        </div>
                        {loading && (
                            <Spinner className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
                        )}
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-40" align="start">
                    <DropdownMenuItem onClick={() => onSelected(null)}>
                        <Trash2 className="size-4" />
                        {t('remove-avatar')}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => avatarInputRef?.current?.click()}
                    >
                        <ImageIcon className="size-4" />
                        {t('select-avatar')}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <input
                className="hidden"
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                placeholder="Avatar"
                onChange={e => {
                    const files = e.target.files;
                    if (files) {
                        void onSelected(files[0]);
                    }
                }}
            />
        </div>
    );
}

function getAvatarFallbackForNickname(nickname: string): string {
    if (nickname.length === 0) return '';
    const words = nickname.toUpperCase().split(' ');
    return words
        .slice(0, 2)
        .map(word => word[0])
        .join('');
}
