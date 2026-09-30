import * as Dialog from '@radix-ui/react-dialog';
import {ReactNode} from 'react';
import {cn} from '@/lib/utils';

interface StyledDialogWrapperProps {
    open: boolean;
    onOpenChange?: (open: boolean) => void;
    preventDefault?: boolean;
    popoverBackground?: boolean;
    fullscreen?: boolean;
    contentClassName?: string;
    children: ReactNode;
}

export function StyledDialogWrapper({
    open,
    onOpenChange,
    preventDefault = false,
    popoverBackground = true,
    fullscreen = false,
    contentClassName,
    children,
}: StyledDialogWrapperProps) {
    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-2" />
                <Dialog.Content
                    {...(preventDefault && {
                        onInteractOutside: e => e.preventDefault(),
                    })}
                    className={cn(
                        'z-2 fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
                        'w-full max-h-dvh overflow-y-auto',
                        'sm:p-8 scrollbar-none box-border',
                        'sm:min-w-lg',
                        fullscreen ? 'sm:w-auto' : 'sm:w-lg',
                    )}
                >
                    <div
                        className={cn(
                            'flex flex-col w-full sm:rounded-2xl',
                            popoverBackground ? 'bg-popover shadow-lg' : '',
                            contentClassName,
                        )}
                    >
                        {children}
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
