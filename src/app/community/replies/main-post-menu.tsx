import {Ellipsis, Trash} from 'lucide-react';
import {useTranslations} from 'use-intl';
import {useState} from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {ConfirmationDialog} from '@/components/confirmation-dialog';

export interface MainPostMenuProps {
    onDelete: () => void;
}

export function MainPostMenu({onDelete}: MainPostMenuProps) {
    const t = useTranslations('replies');
    const [isDeletePostOpen, setDeletePostOpen] = useState(false);

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Ellipsis />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuGroup>
                        <DropdownMenuItem
                            variant="destructive"
                            onClick={() => setDeletePostOpen(true)}
                        >
                            <Trash className="size-4" />
                            {t('delete.trigger')}
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>

            <ConfirmationDialog
                variant="default"
                icon={<Trash />}
                title={t('delete.title')}
                description={t('delete.description')}
                actionLabel={t('delete.action')}
                cancelLabel={t('delete.cancel')}
                onAction={onDelete}
                open={isDeletePostOpen}
                onOpenChange={isOpen => {
                    if (!isOpen) setDeletePostOpen(isOpen);
                }}
            />
        </>
    );
}
