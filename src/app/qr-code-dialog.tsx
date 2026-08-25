import {useAppContext} from '@/app.context';
import {useBackend} from '@/backend.context';
import {Button} from '@/components/ui/button';
import {BaseDialog} from '@/components/base-dialog';
import {createFriendInviteLink} from '@/lib/utils';
import {useQuery} from '@tanstack/react-query';
import {Copy, Loader2} from 'lucide-react';
import QRCode from 'react-qr-code';
import {toast} from 'sonner';
import {useTranslations} from 'use-intl';
import {users} from '@/services/users-service';

export interface QrCodeDialogProps {
    open: boolean;
    setOpen: (value: boolean) => void;
}

export function QrCodeDialog({open, setOpen}: QrCodeDialogProps) {
    const t = useTranslations('profile');
    const backend = useBackend();
    const app = useAppContext();
    const user = users.useSelf(app).data!.user;

    const inviteQuery = useQuery({
        queryKey: ['inviteToken'],
        queryFn: () => backend.generateFriendInvitationToken(),
        enabled: open,
    });

    const url =
        user?.id && inviteQuery.data?.ok
            ? createFriendInviteLink(user.id, inviteQuery.data.data)
            : null;

    return (
        <BaseDialog
            isShow={open}
            onOpenChange={setOpen}
            title={t('qr.title')}
            subtitle={t('qr.desc')}
        >
            <div className="flex flex-col items-center gap-4">
                <div className="bg-white p-5 rounded-2xl border border-border w-full max-w-72">
                    {url ? (
                        <QRCode value={url} className="w-full aspect-square" />
                    ) : (
                        <div className="w-full aspect-square flex items-center justify-center">
                            <Loader2 className="size-10 animate-spin text-muted-foreground" />
                        </div>
                    )}
                </div>
                <div className="flex gap-3 w-full">
                    <Button
                        variant="default"
                        className="flex-1 cursor-pointer"
                        onClick={() => {
                            setOpen(false);
                            void navigator.clipboard.writeText(url ?? '');
                            toast.success(t('qr.copied'));
                        }}
                    >
                        <Copy className="size-4" />
                        {t('qr.copy')}
                    </Button>
                </div>
            </div>
        </BaseDialog>
    );
}
