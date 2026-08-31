import {EmailBindingSuggestionStatus} from '@/lib/email-binding-suggestion';
import {StyledDialogWrapper} from '@/components/styled-dialog-wrapper';
import {Button} from '@/components/ui/button';
import {X} from 'lucide-react';
import {Dialog} from 'radix-ui';
import {useTranslations} from 'use-intl';

interface SuggestEmailBindingDialogProps {
    status: EmailBindingSuggestionStatus;
    setStatus: (value: EmailBindingSuggestionStatus) => void;
}

export function SuggestEmailBindingDialog({
    status,
    setStatus,
}: SuggestEmailBindingDialogProps) {
    const t = useTranslations('profile.feed');
    return (
        <StyledDialogWrapper
            open={status === 'suggested'}
            onOpenChange={() => setStatus('pending')}
            contentClassName="-translate-y-1/2 w-fit max-w-sm max-h-none rounded-2xl bg-popover shadow-lg"
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
                <div className="px-6 pb-6">
                    <Dialog.Title className="text-center font-normal">
                        {t('email_binding.description')}
                    </Dialog.Title>
                    <div className="w-full flex flex-row grow-1 gap-2 mt-4">
                        <Button
                            className="cursor-pointer"
                            variant="ghost"
                            onClick={() => setStatus('declined')}
                        >
                            {t('email_binding.decline')}
                        </Button>
                        <div className="flex-1" />
                        <Button
                            className="cursor-pointer"
                            onClick={() => setStatus('accepted')}
                        >
                            {t('email_binding.confirm')}
                        </Button>
                    </div>
                </div>
            </div>
        </StyledDialogWrapper>
    );
}
