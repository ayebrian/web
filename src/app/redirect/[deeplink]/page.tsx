import {useBackend} from '@/backend.context';
import {Link2Off} from 'lucide-react';
import {useTranslations} from 'use-intl';
import * as Dialog from '@radix-ui/react-dialog';
import {useNavigate} from 'react-router';
import {useParams} from 'react-router';
import {Spinner} from '@/components/ui/spinner';
import {useEffect, useState, ReactNode} from 'react';
import {useSession} from '@/components/session-provider';
import {useBlockingQR} from '@/app/blocking-qr/dialog';

type State = 'loading' | 'friend-token-expired';

export default function DeeplinkPage(): ReactNode {
    const navigate = useNavigate();
    const session = useSession();
    const blockingQR = useBlockingQR();
    const backend = useBackend();

    const [handling, setHandling] = useState(false);
    const [state, setState] = useState<State>('loading');
    const {deeplink} = useParams();

    async function addFriend(userId: number, token: string) {
        console.log(userId, token);
        setHandling(true);
        if (session.status === 'guest') {
            void navigate('/sign-up');
            return;
        }
        while (true) {
            const result = await backend.addFriend({userId, token});
            console.log(result);
            if (!result.ok) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                continue;
            }
            switch (result.data.type) {
                case 'Success':
                    blockingQR.setShouldBlock(false);
                    void navigate('/');
                    break;
                case 'FriendTokenExpired':
                    setState('friend-token-expired');
                    break;
            }
            break;
        }
    }

    useEffect(() => {
        if (handling) return;
        if (session.status === 'loading') return;
        if (!deeplink) return;

        if (deeplink.startsWith('add/')) {
            const [userId, token] = deeplink.slice(4).split('/');
            return void addFriend(Number(userId), token);
        }

        throw Error(
            'Invalid deeplink, but we are too lazy to create a backup screen',
        );
    }, [deeplink, session.status]);

    switch (state) {
        case 'loading':
            return (
                <div className="w-dvw h-dvh flex items-center justify-center">
                    <Spinner className="h-12 w-12" />
                </div>
            );
        case 'friend-token-expired':
            return <FriendTokenExpired />;
    }
}

function FriendTokenExpired() {
    const t = useTranslations('redirect.friend-token-expired');
    return (
        <Dialog.Root open={true}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
                <Dialog.Content
                    className="
                fixed left-1/2 top-1/2
                -translate-x-1/2 -translate-y-1/2

                w-full max-w-lg p-4
                max-h-dvh overflow-y-scroll
                "
                    onInteractOutside={e => e.preventDefault()}
                >
                    <div className="w-full flex justify-center mb-4">
                        <div className="rounded-full bg-white dark:bg-zinc-900 p-3">
                            <Link2Off className="size-5" />
                        </div>
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
                        <p className="text-md text-center">
                            {t('description')}
                        </p>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
