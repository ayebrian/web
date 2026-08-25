import React, {useMemo} from 'react';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import ReactMarkdown from 'react-markdown';
import {cn} from '@/lib/utils';

const linkClass = cn(
    'font-medium text-primary underline underline-offset-4',
    'decoration-primary/30 transition-colors hover:decoration-primary',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
);

interface MarkdownAreaProps {
    text: string;
    className?: string;
    ref?: React.Ref<HTMLDivElement>;
}

function MarkdownArea(
    {text, className, ref}: MarkdownAreaProps,
) {
    return (
        <div
            ref={ref}
            className={cn(
                "w-full max-w-full min-w-0 ",
                "overflow-x-auto overflow-y-hidden",
                "break-words space-y-[1em] leading-5",
                className,
            )}>
            <ReactMarkdown
                remarkPlugins={[remarkBreaks, remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeSanitize]}
                components={{
                    a: ({href, children}) => (
                        <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={linkClass}
                        >
                            {children}
                        </a>
                    ),
                    blockquote: ({children}) => <blockquote className="text-sm">{children}</blockquote>,
                }}
            >
                {text}
            </ReactMarkdown>
        </div>
    );
}

export {MarkdownArea};
