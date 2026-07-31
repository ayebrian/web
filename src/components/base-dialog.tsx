import {ReactNode} from 'react';
import {cn} from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

export interface BaseDialogProps {
    children: ReactNode;
    isShow: boolean;
    onOpenChange?: (open: boolean) => void;
    title: string;
    subtitle?: string;
    className?: string;
    showCloseButton?: boolean;
}

export function BaseDialog({
    children,
    isShow,
    onOpenChange,
    title,
    subtitle,
    className,
    showCloseButton = true,
}: BaseDialogProps) {
    return (
        <Dialog open={isShow} onOpenChange={onOpenChange}>
            <DialogContent
                className={cn('bg-popover sm:max-w-sm', className)}
                showCloseButton={showCloseButton}
            >
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {subtitle && (
                        <DialogDescription>{subtitle}</DialogDescription>
                    )}
                </DialogHeader>
                {children}
            </DialogContent>
        </Dialog>
    );
}
