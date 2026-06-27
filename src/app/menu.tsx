import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {User, Newspaper, MessageCircle, BookUser} from 'lucide-react';
import {useTranslations} from 'use-intl';
import {cn} from '@/lib/utils';
import {Link, useLocation} from 'react-router';

export function MenuRail() {
    const t = useTranslations('menu');
    const {pathname} = useLocation();

    return (
        <div className="h-full p-1 flex flex-col gap-1.5 lg:p-4 lg:min-w-55">
            <Link to="/">
                <Button
                    variant="ghost"
                    className={cn(
                        'cursor-pointer justify-start w-full',
                        pathname === '/' &&
                            'bg-accent text-accent-foreground dark:bg-accent/50',
                    )}
                >
                    <User /> <p className="hidden lg:inline">{t('profile')}</p>
                </Button>
            </Link>
            <Link to="/feed">
                <Button
                    variant="ghost"
                    className={cn(
                        'cursor-pointer justify-start w-full',
                        pathname === '/feed' &&
                            'bg-accent text-accent-foreground dark:bg-accent/50',
                    )}
                >
                    <BookUser />{' '}
                    <p className="hidden lg:block">{t('feed')}</p>{' '}
                </Button>
            </Link>
            <Link to="/community">tailwind


                <Button
                    variant="ghost"
                    className={cn(
                        'cursor-pointer justify-start w-full',
                        pathname === '/community' &&
                            'bg-accent text-accent-foreground dark:bg-accent/50',
                    )}
                >
                    <Newspaper />{' '}
                    <p className="hidden lg:block">{t('community')}</p>{' '}
                    <Badge variant="secondary">Q3</Badge>
                </Button>
            </Link>
            <Link to="/chat">
                <Button
                    variant="ghost"
                    className={cn(
                        'cursor-pointer justify-start w-full',
                        pathname === '/chat' &&
                            'bg-accent text-accent-foreground dark:bg-accent/50',
                    )}
                >
                    <MessageCircle />{' '}
                    <p className="hidden lg:block">{t('chat')}</p>{' '}
                    <Badge variant="secondary">Q4</Badge>
                </Button>
            </Link>
        </div>
    );
}

export function MenuBar() {
    const t = useTranslations('menu');
    const {pathname} = useLocation();

    return (
        <div className="grid grid-cols-4 gap-2 p-4 w-full max-w-md mx-auto">
            <Link to="/community" className="min-w-0 w-full">
                <Button
                    variant="ghost"
                    className={cn(
                        'cursor-pointer w-full h-12 py-1 px-1 text-xs sm:text-sm',
                        pathname === '/community' &&
                            'bg-accent text-accent-foreground dark:bg-accent/50',
                    )}
                >
                    <div className="flex flex-col items-center justify-between h-full w-full min-w-0">
                        <div className="flex items-center justify-center h-5">
                            <Badge variant="secondary" className="scale-90 origin-center">Q3</Badge>
                        </div>
                        <span className="truncate w-full text-center leading-none mt-auto">{t('community')}</span>
                    </div>
                </Button>
            </Link>
            <Link to="/chat" className="min-w-0 w-full">
                <Button
                    variant="ghost"
                    className={cn(
                        'cursor-pointer w-full h-12 py-1 px-1 text-xs sm:text-sm',
                        pathname === '/chat' &&
                            'bg-accent text-accent-foreground dark:bg-accent/50',
                    )}
                >
                    <div className="flex flex-col items-center justify-between h-full w-full min-w-0">
                        <div className="flex items-center justify-center h-5">
                            <Badge variant="secondary" className="scale-90 origin-center">Q4</Badge>
                        </div>
                        <span className="truncate w-full text-center leading-none mt-auto">{t('chat')}</span>
                    </div>
                </Button>
            </Link>
            <Link to="/feed" className="min-w-0 w-full">
                <Button
                    variant="ghost"
                    className={cn(
                        'cursor-pointer w-full h-12 py-1 px-1 text-xs sm:text-sm',
                        pathname === '/feed' &&
                            'bg-accent text-accent-foreground dark:bg-accent/50',
                    )}
                >
                    <div className="flex flex-col items-center justify-between h-full w-full min-w-0">
                        <div className="flex items-center justify-center h-5">
                            <BookUser className="w-4 h-4" />
                        </div>
                        <span className="truncate w-full text-center leading-none mt-auto">{t('feed')}</span>
                    </div>
                </Button>
            </Link>
            <Link to="/" className="min-w-0 w-full">
                <Button
                    variant="ghost"
                    className={cn(
                        'cursor-pointer w-full h-12 py-1 px-1 text-xs sm:text-sm',
                        pathname === '/' &&
                            'bg-accent text-accent-foreground dark:bg-accent/50',
                    )}
                >
                    <div className="flex flex-col items-center justify-between h-full w-full min-w-0">
                        <div className="flex items-center justify-center h-5">
                            <User className="w-4 h-4" />
                        </div>
                        <span className="truncate w-full text-center leading-none mt-auto">{t('profile')}</span>
                    </div>
                </Button>
            </Link>
        </div>
    );
}
