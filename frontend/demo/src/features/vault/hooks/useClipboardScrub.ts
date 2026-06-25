import { useRef } from 'react';

export const useClipboardScrub = () => {
    const timeoutRef = useRef<number | null>(null);

    const copyToClipboard = async (text: string) => {
        await navigator.clipboard.writeText(text);

        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = window.setTimeout(() => {
            navigator.clipboard.writeText('');
            console.log("Clipboard scrubbed for security.");
        }, 15000);
    };

    return { copyToClipboard };
};