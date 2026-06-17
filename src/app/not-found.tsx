import {TopBar} from '@/app/top-bar';
import {Button} from '@/components/ui/button';
import {useTranslations} from 'use-intl';

export function NotFoundPage() {
    const t = useTranslations('not-found');

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black">
            <TopBar />
            <div className="h-16" />
            <div className="flex flex-col gap-4 items-center justify-center h-[calc(100vh-8rem)] px-4 text-center">
                <h1 className="text-8xl font-bold tracking-tighter text-zinc-900 dark:text-zinc-50">
                    404
                </h1>
                <div>
                    <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                        {t('title')}
                    </h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {t('subtitle')}
                    </p>
                </div>
                <Button variant="outline" asChild>
                    <a href="/">{t('goback')}</a>
                </Button>
            </div>
        </div>
    );
}
