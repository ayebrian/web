import React from 'react';

export interface OpenNewTabShortcutProps {
    url: string;
    onNavigate: (url: string) => void;
}

export function openBlankShortcut(
    event: React.MouseEvent,
    {url, onNavigate}: OpenNewTabShortcutProps,
) {
    if (event.button !== 0 && event.button !== 1) return;
    if (event.button === 1 || event.metaKey || event.ctrlKey) {
        window.open(url, '_blank');
        return;
    }
    onNavigate(url);
}
