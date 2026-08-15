import {StyledDialogWrapper} from '@/components/styled-dialog-wrapper';
import {Button} from '@/components/ui/button';
import {X} from 'lucide-react';
import {Dialog} from 'radix-ui';
import {useTranslations} from 'use-intl';

interface LogoutDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    suggestBindEmail: boolean;
    onLogout: () => void;
    onBindEmail?: () => void;
}

export function LogoutDialog({
    open,
    onOpenChange,
    suggestBindEmail,
    onLogout,
    onBindEmail,
}: LogoutDialogProps) {
    const t = useTranslations('log_out_dialog');
    return (
        <StyledDialogWrapper
            open={open}
            onOpenChange={onOpenChange}
            contentClassName="-translate-y-1/2 w-10/11 sm:max-w-sm max-h-none rounded-2xl bg-popover shadow-lg"
        >
            <div>
                <div className="flex justify-end pt-2 pr-2">
                    <Dialog.Close asChild>
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            className="cursor-pointer"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </Dialog.Close>
                </div>
                <div className="px-4 pb-4">
                    <h2 className="text-center">
                        {suggestBindEmail ? t('title_no_email') : t('title')}
                    </h2>
                    <div className="w-full flex flex-row grow-1 gap-2 mt-4">
                        {suggestBindEmail && (
                            <Button
                                className="grow-1 cursor-pointer"
                                onClick={() => {
                                    if (onBindEmail !== undefined) {
                                        onBindEmail();
                                    }
                                }}
                            >
                                {t('bind_email')}
                            </Button>
                        )}
                        <Button
                            className="grow-1 cursor-pointer"
                            variant="destructive"
                            onClick={onLogout}
                        >
                            {t('yes')}
                        </Button>
                    </div>
                </div>
            </div>
        </StyledDialogWrapper>
    );
}
