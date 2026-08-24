import {ReactNode} from 'react';

const appVersion = String(import.meta.env.VITE_APP_VERSION);

export function DevPage(): ReactNode {
    return (
        <div className="w-full h-full flex items-center justify-center text-xl font-bold">
            {appVersion}
        </div>
    );
}
