import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {User, Newspaper, MessageCircle, BookUser} from 'lucide-react';
import {useTranslations} from 'use-intl';
import {cn} from '@/lib/utils';
import {Link, useLocation} from 'react-router';
import {ReactNode} from 'react';

interface MenuItem {
    path: string;
    title: string;
    icon: ReactNode;
    releaseTag?: string;
}

const MENURAIL_ITEMS: MenuItem[] = [
    {path: '/', title: 'profile', icon: <User />},
    {path: '/feed', title: 'feed', icon: <BookUser />},
    {
        path: '/community',
        title: 'community',
        icon: <Newspaper />,
    },
    {path: '/chat', title: 'chat', icon: <MessageCircle />, releaseTag: 'Q4'},
];
const MENUBAR_ITEMS: MenuItem[] = MENURAIL_ITEMS.toReversed();

export function MenuRail() {
    const t = useTranslations('menu');
    const {pathname} = useLocation();

    return (
        <div className="h-full p-1 flex flex-col gap-1.5 lg:p-4 lg:min-w-55">
            {MENURAIL_ITEMS.map(item => (
                <Link key={item.path} to={item.path}>
                    <Button
                        variant="ghost"
                        className={cn(
                            'cursor-pointer justify-start w-full',
                            pathname === item.path &&
                                'bg-accent text-accent-foreground dark:bg-accent/50',
                        )}
                    >
                        {item.icon}{' '}
                        <p className="hidden lg:block">
                            {t(item.title as Parameters<typeof t>[0])}
                        </p>{' '}
                        <Badge hidden={!item.releaseTag} variant="secondary">
                            {item.releaseTag}
                        </Badge>
                    </Button>
                </Link>
            ))}
        </div>
    );
}

export function MenuBar() {
    const t = useTranslations('menu');
    const {pathname} = useLocation();

    return (
        <div className="grid grid-cols-4 gap-2 p-4 w-full max-w-md mx-auto">
            {MENUBAR_ITEMS.map(item => (
                <Link key={item.path} to={item.path} className="min-w-0 w-full">
                    <Button
                        variant="ghost"
                        className={cn(
                            'cursor-pointer w-full h-12 py-1 px-1 text-xs sm:text-sm',
                            pathname === item.path &&
                                'bg-accent text-accent-foreground dark:bg-accent/50',
                        )}
                    >
                        <div className="flex flex-col items-center justify-between h-full w-full min-w-0">
                            <div className="flex items-center justify-center h-5">
                                <Badge
                                    hidden={!item.releaseTag}
                                    variant="secondary"
                                    className="scale-90 origin-center"
                                >
                                    {item.releaseTag}
                                </Badge>
                                <div
                                    hidden={!!item.releaseTag}
                                    className="w-4 h-4"
                                >
                                    {item.icon}
                                </div>
                            </div>
                            <span className="truncate w-full text-center leading-none mt-auto">
                                {t(item.title as Parameters<typeof t>[0])}
                            </span>
                        </div>
                    </Button>
                </Link>
            ))}
        </div>
    );
}
