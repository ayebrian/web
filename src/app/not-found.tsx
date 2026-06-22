import {Button} from '@/components/ui/button';
import {useTranslations} from 'use-intl';

export function NotFoundPage() {
    const t = useTranslations('not-found');

    return (
        <div className="w-full h-full flex flex-col justify-center items-center text-center">
            <h1 className="text-8xl font-bold tracking-tighter text-zinc-900 dark:text-zinc-50">
                404
            </h1>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                {t('title')}
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {t('subtitle')}
            </p>
            <Button className="mt-2" variant="outline" asChild>
                <a href="/">{t('goback')}</a>
            </Button>
        </div>
    );
}
