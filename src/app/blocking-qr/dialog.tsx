import * as Dialog from '@radix-ui/react-dialog';
import {useEffect, useState, ReactNode} from 'react';
import {toast} from 'sonner';
import {Link, HatGlasses} from 'lucide-react';
import {useBackend} from '@/backend.context';
import {Spinner} from '@/components/ui/spinner';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from '@/components/ui/input-group';
import {Field, FieldError, FieldLabel} from '@/components/ui/field';
import {useTranslations} from 'use-intl';
import {Button} from '@/components/ui/button';
import {StyledDialogWrapper} from '@/components/styled-dialog-wrapper';

export interface BlockingQRController {
    shouldBlock: boolean;
    setShouldBlock: (value: boolean) => void;
}

export function useBlockingQR(): BlockingQRController {
    // Hi, Hacker Bro:
    //
    // 1) Yes, it's a client-side thing
    // 2) Yes, you can just fork this repo, write a browser extension or modify localStorage
    // 3) Yes, it's how it works on all platforms
    //
    // But the thing is that we don't care. To start gaining any benefit from
    // the app you must be a part of master network. It's very hard to start a
    // new network right away. You can do it, we encourage you to do that if
    // you want, but it's not a task for an average user.
    //
    // Also, it's not reset when you log out from the app, so it's for first-time users only.
    //
    // Note for developers:
    //
    // * We will need to migrate to cookies instead of localStorage for SSR
    const [shouldBlock, setShouldBlock] = useState(
        () => localStorage.getItem('blocking-qr-completed') !== 'true',
    );
    useEffect(() => {
        localStorage.setItem('blocking-qr-completed', `${!shouldBlock}`);
    }, [shouldBlock]);
    return {
        shouldBlock,
        setShouldBlock,
    };
}

export interface BlockingQRProps {
    controller: BlockingQRController;
}

export function BlockingQR({
    controller: {setShouldBlock},
}: BlockingQRProps): ReactNode {
    const t = useTranslations('blocking-qr');
    const [loading, setLoading] = useState(false);
    const [link, setLink] = useState('');
    const [linkError, setLinkError] = useState<string | null>();
    const backend = useBackend();

    async function onJoin() {
        setLinkError(null);
        setLoading(true);
        try {
            const parseLinkResult = parseLink({raw: link});
            if (!parseLinkResult.ok) {
                setLinkError(t('link-invalid'));
                return;
            }
            const {userId, token} = parseLinkResult.data;
            const result = await backend.addFriend({userId, token});
            if (!result.ok) {
                toast.error(t('error-connection'));
                return;
            }
            if (result.data.type === 'FriendTokenExpired') {
                toast.error(t('link-expired'));
                return;
            }
            setShouldBlock(false);
        } finally {
            setLoading(false);
        }
    }
    return (
        <StyledDialogWrapper
            open={true}
            preventDefault={true}
            contentClassName="-translate-y-1/2 p-4"
        >
            <>
                <div className="w-full flex justify-center mb-4">
                    <HatGlasses className="size-20 rounded-full bg-white dark:bg-zinc-900 p-4" />
                </div>
                <div
                    className="
                        rounded-xl bg-white dark:bg-zinc-900
                        shadow-xl
                        py-4 px-6 space-y-4
                        w-full flex flex-col items-center
                        mb-20
                        "
                >
                    <Dialog.Title className="w-full text-md font-semibold text-center">
                        {t('title')}
                    </Dialog.Title>
                    <Field>
                        <FieldLabel
                            htmlFor="link"
                            className="font-normal text-center"
                        >
                            {t('description')}
                        </FieldLabel>
                        <InputGroup>
                            <InputGroupInput
                                id="link"
                                placeholder={t('link-placeholder')}
                                type="text"
                                value={link}
                                onChange={e => setLink(e.target.value)}
                            />
                            <InputGroupAddon>
                                <Link />
                            </InputGroupAddon>
                        </InputGroup>
                        <FieldError>{linkError}</FieldError>
                    </Field>
                    <Button
                        className="cursor-pointer min-w-38"
                        variant="secondary"
                        onClick={() => void onJoin()}
                        disabled={loading}
                    >
                        {!loading && t('join')}
                        {loading && <Spinner />}
                    </Button>
                </div>
            </>
        </StyledDialogWrapper>
    );
}

type ParseLinkParams = {
    raw: string;
};

type ParseLinkResult =
    | {
          ok: true;
          data: {
              userId: number;
              token: string;
          };
      }
    | {
          ok: false;
          message: string;
      };

function parseLink({raw}: ParseLinkParams): ParseLinkResult {
    // https://getfriend.ly/#?reference=add/userId/token
    const parsed = URL.parse(raw);
    if (!parsed) {
        return {
            ok: false,
            message: 'URL.parse(raw)',
        };
    }
    const queryStart = parsed.hash.indexOf('?');
    if (queryStart === -1) {
        return {
            ok: false,
            message: 'indexOf() == -1',
        };
    }
    const hash = parsed.hash.substring(queryStart);
    const searchParams = new URLSearchParams(hash);
    const reference = searchParams.get('reference');
    if (!reference) {
        return {
            ok: false,
            message: '!reference',
        };
    }
    const segments = reference.split('/');
    if (segments.length !== 3) {
        return {
            ok: false,
            message: `segments.length (${segments.length}) != 3`,
        };
    }
    if (segments[0] !== 'add') {
        return {
            ok: false,
            message: `segments[0] (${segments[0]}) != 'add'`,
        };
    }
    const userId = Number(segments[1]);
    if (Number.isNaN(userId)) {
        return {
            ok: false,
            message: 'Number.isNan',
        };
    }
    const token = segments[2];
    return {
        ok: true,
        data: {userId, token},
    };
}
