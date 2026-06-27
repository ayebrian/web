import React, {ComponentProps, useEffect, useRef, useState} from 'react';
import {useTranslations} from 'use-intl';
import {Bold, Code, Italic, Link, Quote} from 'lucide-react';
import {cn} from '@/lib/utils';
import ToggleButton from './toggle-button';
import {Textarea} from './textarea';
import {Button} from '@/components/ui/button';
import {MarkdownArea} from '@/components/ui/markdown-area';

interface MarkdownInputProps {
    text: string;
    setText: (value: string) => void;
    useButtons?: boolean;
    contentClassName?: string;
    placeholder?: string;
    id?: string
}

function ToolButton({ tooltip, ...props }: ComponentProps<typeof Button> & { tooltip?: string }) {
    return (
        <div className="relative group">
            <Button asChild={false} size="xs" className="rounded-none p-0 border border-input border-collapse" variant="secondary" {...props} />
            {tooltip && (
                <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1 whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md opacity-0 transition-opacity group-hover:opacity-100">
                    {tooltip}
                </span>
            )}
        </div>
    );
}

function MarkdownInput({
    text,
    setText,
    useButtons = true,
    contentClassName,
    placeholder,
    id
}: MarkdownInputProps) {
    const t = useTranslations('markdown-input');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const pendingCursor = useRef<number | null>(null);
    const [isPreviewText, setIsPreviewText] = useState(false);

    useEffect(() => {
        if (pendingCursor.current === null || !textareaRef.current) return;
        const el = textareaRef.current;
        const pos = pendingCursor.current;
        pendingCursor.current = null;
        el.focus();
        el.setSelectionRange(pos, pos);
    }, [text]);

    function onTextAreaChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
        setText(event.target.value);
    }

    function applyInlineFormat(marker: string) {
        const el = textareaRef.current;
        if (!el) return;

        const start = el.selectionStart;
        const end = el.selectionEnd;

        if (document.activeElement !== el && start === 0) return;

        const escaped = marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const markerLen = marker.length;
        const wrapRegex = new RegExp(`${escaped}[\\s\\S]*?${escaped}`, 'g');
        const innerRegex = new RegExp(`${escaped}([\\s\\S]*?)${escaped}`, 'g');

        let match: RegExpExecArray | null;
        while ((match = wrapRegex.exec(text)) !== null) {
            const contentStart = match.index + markerLen;
            const contentEnd = match.index + match[0].length - markerLen;
            if (start >= contentStart && end <= contentEnd) {
                setText(
                    text.slice(0, match.index) +
                    text.slice(match.index + markerLen, match.index + match[0].length - markerLen) +
                    text.slice(match.index + match[0].length)
                );
                return;
            }
        }

        if (start < end) {
            const selectedText = text.slice(start, end);
            const cleaned = selectedText.replace(innerRegex, '$1');
            if (cleaned !== selectedText) {
                setText(text.slice(0, start) + cleaned + text.slice(end));
                return;
            }
        }

        if (start === end) {
            let wordStart = start;
            let wordEnd = start;
            while (wordStart > 0 && !/\s/.test(text[wordStart - 1])) wordStart--;
            while (wordEnd < text.length && !/\s/.test(text[wordEnd])) wordEnd++;
            setText(text.slice(0, wordStart) + marker + text.slice(wordStart, wordEnd) + marker + text.slice(wordEnd));
        } else {
            let trimStart = start;
            let trimEnd = end;
            while (trimStart < trimEnd && /\s/.test(text[trimStart])) trimStart++;
            while (trimEnd > trimStart && /\s/.test(text[trimEnd - 1])) trimEnd--;
            if (trimStart >= trimEnd) return;
            setText(text.slice(0, trimStart) + marker + text.slice(trimStart, trimEnd) + marker + text.slice(trimEnd));
        }
    }

    const onBoldText  = () => applyInlineFormat('**');
    const onItalicText = () => applyInlineFormat('_');
    const onCodeText  = () => applyInlineFormat('`');

    function onBlockquote() {
        const el = textareaRef.current;
        if (!el) return;

        const start = el.selectionStart;
        const end = el.selectionEnd;

        const lineStart = text.lastIndexOf('\n', start - 1) + 1;
        const lineEnd = end === start
            ? (text.indexOf('\n', end) === -1 ? text.length : text.indexOf('\n', end))
            : (text.indexOf('\n', end - 1) === -1 ? text.length : text.indexOf('\n', end - 1));

        const block = text.slice(lineStart, lineEnd);
        const lines = block.split('\n');
        const allQuoted = lines.every(l => l.startsWith('> '));

        const replaced = allQuoted
            ? lines.map(l => l.slice(2)).join('\n')
            : lines.map(l => l.startsWith('> ') ? l : `> ${l}`).join('\n');

        setText(text.slice(0, lineStart) + replaced + text.slice(lineEnd));
    }

    function onLinkText() {
        const el = textareaRef.current;
        if (!el) return;

        const start = el.selectionStart;
        const end = el.selectionEnd;

        if (document.activeElement !== el && start === 0) return;

        if (start === end) {
            setText(text.slice(0, start) + '[]()'+ text.slice(start));
            pendingCursor.current = start + 1;
            return;
        }

        const selected = text.slice(start, end);
        if (/^https?:\/\//.test(selected)) {
            setText(text.slice(0, start) + `[](${selected})` + text.slice(end));
            pendingCursor.current = start + 1;
        } else {
            setText(text.slice(0, start) + `[${selected}]()` + text.slice(end));
            pendingCursor.current = start + selected.length + 3;
        }
    }

    return (
        <div className={cn('w-full h-full relative', contentClassName)}>
            <div className="flex flex-row justify-between items-center">
                {useButtons
                    ? (<div className="flex flex-row border border-input rounded-md h-fit ml-1">
                        <ToolButton tooltip={t('bold')}          onClick={onBoldText}><Bold /></ToolButton>
                        <ToolButton tooltip={t('italic')}        onClick={onItalicText}><Italic /></ToolButton>
                        <ToolButton tooltip={t('blockquote')} onClick={onBlockquote}><Quote /></ToolButton>
                        <ToolButton tooltip={t('code')}          onClick={onCodeText}><Code /></ToolButton>
                        <ToolButton tooltip={t('link')}          onClick={onLinkText}><Link /></ToolButton>
                    </div>)
                    : <div />
                }
                <div>
                    <ToggleButton
                        leftContent={t('raw')}
                        rightContent={t('preview')}
                        isRight={isPreviewText}
                        toggleChange={setIsPreviewText}
                    />
                </div>
            </div>

                { isPreviewText
                    ? (<div className='flex field-sizing-content min-h-16 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:ring-destructive/40'>
                        <MarkdownArea text={text} />
                    </div>)
                    : (<Textarea
                        ref={textareaRef}
                        value={text}
                        onChange={onTextAreaChange}
                        placeholder={placeholder}
                        id={id}
                    />)
                }
        </div>
    );
}



export {MarkdownInput};
