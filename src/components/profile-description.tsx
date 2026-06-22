import {cn} from '@/lib/utils';
import {ChevronDown, ChevronUp} from 'lucide-react';
import {useEffect, useRef, useState} from 'react';
import {FormattedDescription} from '@/components/formatted-description';

export function ProfileDescription({description}: {description: string}) {
    const [expanded, setExpanded] = useState(false);
    const [canExpand, setCanExpand] = useState(false);

    const descriptionRef = useRef<HTMLParagraphElement>(null);

    useEffect(() => {
        const el = descriptionRef.current;
        if (!el) return;

        setCanExpand(el.scrollHeight > el.clientHeight);
    }, [description]);

    return (
        <>
            <div
                className={cn(
                    'text-neutral-700 dark:text-zinc-400 wrap-break-word whitespace-pre-wrap transition-all duration-300 ease-in-out',
                    !expanded && 'line-clamp-4 sm:line-clamp-3',
                )}
                ref={descriptionRef}
            >
                <FormattedDescription description={description} />
            </div>

            {canExpand && (
                <button
                    onClick={() => setExpanded(v => !v)}
                    className="mt-1 flex items-center gap-1 text-sm text-blue-500 hover:underline cursor-pointer"
                >
                    {expanded ? (
                        <>
                            <ChevronUp className="w-4 h-4" /> Show less
                        </>
                    ) : (
                        <>
                            <ChevronDown className="w-4 h-4" /> Show more
                        </>
                    )}
                </button>
            )}
        </>
    );
}
