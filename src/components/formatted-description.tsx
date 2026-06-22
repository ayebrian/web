import {cn} from '@/lib/utils';

const URL_REGEX = /((?:https?):\/\/[^\s]+)/g;

export function FormattedDescription({description}: {description: string}) {
    const parts = description.split(URL_REGEX);

    return (
        <p>
            {parts.map((part, index) => {
                if (part.match(URL_REGEX)) {
                    return (
                        <a
                            key={index}
                            href={part}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                                'font-medium text-primary underline underline-offset-4',
                                'decoration-primary/30 transition-colors hover:decoration-primary',
                                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                            )}
                        >
                            {part}
                        </a>
                    );
                }
                return part;
            })}
        </p>
    );
}
