import * as Dialog from '@radix-ui/react-dialog';
import {AvatarContent} from './avatar';
import {UsersEditRequest} from '@/network/friendly-client';
import {Textarea} from '@/components/ui/textarea';
import {toast} from 'sonner';
import {Save, X, User, Link, Heart} from 'lucide-react';
import {useBackend} from '@/backend.context';
import {Spinner} from '@/components/ui/spinner';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from '@/components/ui/input-group';
import {Field, FieldError, FieldGroup, FieldLabel} from '@/components/ui/field';
import {ReactNode, useState} from 'react';
import {UserDetailsResponse} from '@/network/friendly-client';
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
// * Refresh underlying page once edit is successful
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

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
                <Dialog.Content
                    className="
                    fixed left-1/2 top-1/2
                    -translate-x-1/2 -translate-y-1/2

                    w-full max-w-lg p-5
                    "
                >
                    <div
                        className="
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
                                <Button
                                    variant="ghost"
                                    className="cursor-pointer"
                                >
                                    <X />
                                </Button>
                            </Dialog.Close>
                        </div>
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
                                            placeholder={t(
                                                'interests-placeholder',
                                            )}
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
                                    disabled={loading || avatarLoading}
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
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
