import {ReactNode} from 'react';
import {cn} from '@/lib/utils';
import {TopBar} from '@/app/top-bar';
import {MenuRail, MenuBar} from '@/app/menu';
import {useSession} from '@/components/session-provider';
import {useBlockingQR} from '@/app/blocking-qr/dialog';

export interface ScaffoldProps {
    children: ReactNode;
}

export function Scaffold({children}: ScaffoldProps): ReactNode {
    const session = useSession();
    const blockingQR = useBlockingQR();
    const showMenu = session.isAuthed && !blockingQR.shouldBlock;

    return (
        <div className="flex flex-col h-dvh w-dvw bg-zinc-50 dark:bg-black">
            <TopBar />
            <div className="flex-1 h-full flex min-h-0">
                {showMenu && (
                    <>
                        <div
                            className={cn(
                                'h-full',
                                'bg-white dark:bg-zinc-950',
                                'hidden md:block',
                            )}
                        >
                            <MenuRail />
                        </div>
                        <div
                            className={cn(
                                'h-full w-px hidden md:block',
                                'bg-zinc-200 dark:bg-zinc-800',
                            )}
                        />
                    </>
                )}
                <div className="flex flex-col flex-1 min-w-0">
                    <div className="overflow-y-auto flex-1">{children}</div>
                    {showMenu && (
                        <>
                            <div
                                className={cn(
                                    'w-full h-px md:hidden',
                                    'bg-zinc-200 dark:bg-zinc-800',
                                )}
                            />
                            <div
                                className={cn(
                                    'w-full',
                                    'bg-white dark:bg-zinc-950',
                                    'md:hidden',
                                )}
                            >
                                <MenuBar />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
