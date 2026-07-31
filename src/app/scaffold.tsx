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
        <div className="flex flex-col h-dvh w-dvw bg-background">
            <TopBar />
            <div className="flex-1 h-full flex min-h-0">
                {showMenu && (
                    <>
                        <div
                            className={cn(
                                'h-full',
                                'bg-card',
                                'hidden md:block',
                            )}
                        >
                            <MenuRail />
                        </div>
                        <div
                            className={cn(
                                'h-full w-px hidden md:block',
                                'bg-border',
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
                                    'bg-border',
                                )}
                            />
                            <div
                                className={cn('w-full', 'bg-card', 'md:hidden')}
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
