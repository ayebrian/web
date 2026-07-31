import {ReactNode} from 'react';
import {cn} from '@/lib/utils';

export function TopBar(): ReactNode {
    return (
        <div className={cn('w-full h-16', 'flex flex-col items-center')}>
            <div
                className={cn(
                    'flex p-4',
                    'bg-card',
                    'w-full flex-1 min-h-0',
                    'items-center',
                )}
            >
                <a className="h-full" href="/">
                    <img
                        className="dark:hidden h-full"
                        src="/banner-light.svg"
                    />
                    <img
                        className="hidden dark:block h-full"
                        src="/banner-dark.svg"
                    />
                </a>
            </div>
            <div className="w-full h-px bg-border" />
        </div>
    );
}
