import {useBackend} from '@/backend.context';
import {cn} from '@/lib/utils';
import {Button} from '@/components/ui/button';
import {useQueryClient} from '@tanstack/react-query';
import {Copy, Loader2, QrCodeIcon, RotateCcw} from 'lucide-react';
import QRCode from 'react-qr-code';
import {toast} from 'sonner';
import {useTranslations} from 'use-intl';

export function QrCodeCard({url}: {url: string | null}) {
    const t = useTranslations('profile');
    const queryClient = useQueryClient();
    const backend = useBackend();

    async function forceRefresh() {
        await backend.friendsGenerateForce();
        void queryClient.invalidateQueries({
            queryKey: ['inviteToken'],
        });
    }

    return (
        <div
            className={cn(
                'flex flex-col items-center p-4 text-sm',
                'lg:w-1/4 lg:h-fit lg:mt-4 lg:mr-8 lg:items-start lg:rounded-xl',
                'lg:border lg:border-zinc-200 dark:lg:border-zinc-800',
                'lg:bg-white dark:lg:bg-zinc-900',
            )}
        >
            <div className="flex flex-col gap-2 pl-2 pt-2 pr-2">
                <div className="flex flex-row gap-2 items-center font-medium text-zinc-900 dark:text-zinc-100">
                    <QrCodeIcon className="w-4 h-4" /> {t('qr.title')}
                </div>
                <p className="text-neutral-700 dark:text-zinc-400">
                    {t('qr.desc')}
                </p>
            </div>
            <div className="h-6 lg:h-2" />
            <div className="w-full flex flex-col items-center">
                <div className="bg-white p-4 rounded-xl border border-zinc-200">
                    {url ? (
                        <QRCode value={url} className="w-32 h-32" />
                    ) : (
                        <Loader2 className="h-10 w-10 animate-spin text-zinc-400" />
                    )}
                </div>
                <div className="h-2" />
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        className="flex-1 dark:bg-zinc-950 dark:hover:bg-zinc-800 cursor-pointer"
                        onClick={() => {
                            void navigator.clipboard.writeText(url ?? '');
                            toast.success(t('qr.copied'));
                        }}
                    >
                        <Copy className="w-4 h-4 mr-2" /> {t('qr.copy')}
                    </Button>
                    <Button
                        variant="outline"
                        className="flex-1 dark:bg-zinc-950 dark:hover:bg-zinc-800 cursor-pointer"
                        onClick={() => void forceRefresh()}
                    >
                        <RotateCcw className="s-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
