import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {User, Newspaper, MessageCircle, BookUser} from 'lucide-react';
import {useTranslations} from 'use-intl';

export function MenuRail() {
    const t = useTranslations('menu');

    return (
        <div className="h-full p-1 flex flex-col lg:p-4 lg:min-w-55">
            <a href="/">
                <Button
                    variant="ghost"
                    className="cursor-pointer justify-start w-full"
                >
                    <User /> <p className="hidden lg:inline">{t('profile')}</p>
                </Button>
            </a>
            <a href="/feed">
                <Button
                    variant="ghost"
                    className="cursor-pointer justify-start w-full"
                >
                    <BookUser />{' '}
                    <p className="hidden lg:block">{t('feed')}</p>{' '}
                </Button>
            </a>
            <a href="/community">
                <Button
                    variant="ghost"
                    className="cursor-pointer justify-start w-full"
                >
                    <Newspaper />{' '}
                    <p className="hidden lg:block">{t('community')}</p>{' '}
                    <Badge variant="secondary">Q3</Badge>
                </Button>
            </a>
            <a href="/chat">
                <Button
                    variant="ghost"
                    className="cursor-pointer justify-start w-full"
                >
                    <MessageCircle />{' '}
                    <p className="hidden lg:block">{t('chat')}</p>{' '}
                    <Badge variant="secondary">Q4</Badge>
                </Button>
            </a>
        </div>
    );
}

export function MenuBar() {
    const t = useTranslations('menu');

    return (
        <div className="flex items-center justify-center p-4">
            <a href="/community">
                <Button variant="ghost" className="cursor-pointer w-30">
                    <div className="flex flex-col items-center">
                        <Badge variant="secondary">Q3</Badge>
                        {t('community')}
                    </div>
                </Button>
            </a>
            <a href="/chat">
                <Button variant="ghost" className="cursor-pointer w-30">
                    <div className="flex flex-col items-center">
                        <Badge variant="secondary">Q4</Badge>
                        {t('chat')}
                    </div>
                </Button>
            </a>

            <a href="/chat">
                <Button variant="ghost" className="cursor-pointer w-30">
                    <div className="flex flex-col items-center">
                        <Badge variant="secondary">Q4</Badge>
                        {t('chat')}
                    </div>
                </Button>
            </a>
            <a href="/">
                <Button variant="ghost" className="cursor-pointer w-30">
                    <div className="flex flex-col items-center">
                        <User />
                        {t('profile')}
                    </div>
                </Button>
            </a>
        </div>
    );
}
