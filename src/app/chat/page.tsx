import {Button} from '@/components/ui/button';
import {useTranslations} from 'use-intl';
import {Construction} from 'lucide-react';

export function ChatPage() {
    const t = useTranslations('chat');

    return (
        <div className="h-full w-full gap-2 flex flex-col items-center justify-center text-center">
            <Construction className="h-16 w-16 text-muted-foreground" />
            <p className="text-xl font-semibold text-foreground">
                {t('title')}
            </p>
            <p className="text-sm text-muted-foreground max-w-md mx-8">
                {t('subtitle')}
            </p>
            <Button variant="outline" asChild>
                <a href="/">{t('goback')}</a>
            </Button>
        </div>
    );
}
