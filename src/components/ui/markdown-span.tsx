import {useMemo} from 'react';
import {Image} from 'lucide-react';
import {useTranslations} from 'use-intl';
import ReactMarkdown from 'react-markdown';
import {cn} from '@/lib/utils';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';

const linkClass = cn(
    'font-medium text-primary underline underline-offset-4',
    'decoration-primary/30 transition-colors hover:decoration-primary',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
);

export interface MarkdownSpanProps {
    text: string;
}

export function MarkdownSpan({text}: MarkdownSpanProps) {
    const t = useTranslations('markdown');

    return (
        <ReactMarkdown
            remarkPlugins={[remarkBreaks, remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeSanitize]}
            components={{
                a: ({href, children}) => (
                    <span className={linkClass}>
                        {children}
                    </span>
                ),
                p: ({ children }) => <p>{children}</p>,
                h1: ({ children }) => <b>{children}<br/></b>,
                h2: ({ children }) => <b>{children}<br/></b>,
                h3: ({ children }) => <b>{children}<br/></b>,
                h4: ({ children }) => <b>{children}<br/></b>,
                h5: ({ children }) => <b>{children}<br/></b>,
                h6: ({ children }) => <b>{children}<br/></b>,
                img: ({ children }) => <Image className="inline h-[1em] w-[1em]" />,
            }}
        >
            {text}
        </ReactMarkdown>
    );
}
