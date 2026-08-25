import React, {useMemo} from 'react';
import remarkBreaks from 'remark-breaks';
import ReactMarkdown from 'react-markdown';
import {cn} from '@/lib/utils';

const MARKDOWN_LINK_REGEX = /\[([^\]]*)]\(([^)]*)\)/g;
const BARE_URL_REGEX = /https?:\/\/[^\s\]()]+/g;

function wrapBareLinks(text: string): string {
    const placeholders: string[] = [];
    const guarded = text.replace(MARKDOWN_LINK_REGEX, (match) => {
        placeholders.push(match);
        return `\x00${placeholders.length - 1}\x00`;
    });
    const linked = guarded.replace(BARE_URL_REGEX, (url) => `[${url}](${url})`);
    return linked.replace(/\x00(\d+)\x00/g, (_, i) => placeholders[Number(i)]);
}

function wrapNewlines(text: string): string {
    return text.replaceAll(/\n(?=\n)/g, '\n\xa0')
}

const linkClass = cn(
    'font-medium text-primary underline underline-offset-4',
    'decoration-primary/30 transition-colors hover:decoration-primary',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
);

interface MarkdownAreaProps {
    text: string;
    findLinks?: boolean;
    className?: string;
    ref?: React.Ref<HTMLDivElement>;
}

function MarkdownArea(
    {text, findLinks = true, className, ref}: MarkdownAreaProps,
) {
    const currentText = useMemo(
        () => {
            const links = findLinks ? wrapBareLinks(text) : text;
            const newlines = wrapNewlines(links);
            return newlines;
        },
        [text, findLinks],
    );

    return (
        <div
            ref={ref}
            className={cn(
                "w-full max-w-full min-w-0 overflow-x-auto overflow-y-hidden leading-5 break-words",
                className,
            )}>
            <ReactMarkdown
                remarkPlugins={[remarkBreaks]}
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
                {currentText}
            </ReactMarkdown>
        </div>
    );
}

export {MarkdownArea};
