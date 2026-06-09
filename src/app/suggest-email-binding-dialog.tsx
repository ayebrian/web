import {EmailBindingSuggestionStatus} from '@/app/feed-review-deck';
import {StyledDialogWrapper} from '@/components/styled-dialog-wrapper';
import {Button} from '@/components/ui/button';
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
            contentClassName="-translate-y-1/2 w-fit max-w-sm max-h-none rounded-2xl p-6 bg-white dark:bg-zinc-950 shadow-lg"
        >
            <>
                <h2 className="text-center">
                    {t('email_binding.description')}
                </h2>
                <div className="w-full flex flex-row grow-1 gap-2 mt-4">
                    <Button
                        className="grow-1"
                        onClick={() => setStatus('declined')}
                    >
                        {t('email_binding.decline')}
                    </Button>
                    <Button
                        className="grow-2"
                        onClick={() => setStatus('accepted')}
                    >
                        {t('email_binding.confirm')}
                    </Button>
                </div>
            </>
        </StyledDialogWrapper>
    );
}
