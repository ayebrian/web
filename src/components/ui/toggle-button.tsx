import {Button} from '@/components/ui/button';
import {ReactNode} from 'react';

import {cn} from '@/lib/utils';

function ToggleButton({
    leftContent,
    rightContent,
    isRight,
    toggleChange,
    className,
}: {
    leftContent: string | ReactNode,
    rightContent: string | ReactNode,
    isRight: boolean,
    toggleChange: (val: boolean) => void,
    className?: string,
}) {

    return (
        <div className={cn('flex flex-row', className)}>
            <Button
                variant={isRight ? "secondary" : "default"}
                onClick={() => toggleChange(false)}
                className="h-auto rounded-l-md rounded-r-none px-2 py-2 font-medium leading-none"
            >{leftContent}</Button>
            <Button
                variant={isRight ? "default" : "secondary"}
                onClick={() => toggleChange(true)}
                className="h-auto rounded-r-md rounded-l-none px-2 py-2 font-medium leading-none"
            >{rightContent}</Button>
        </div>
    )
}

export default ToggleButton;
