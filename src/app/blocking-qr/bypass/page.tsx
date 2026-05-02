'use client';

import {useEffect, ReactNode} from 'react';
import {useRouter} from 'next/navigation';

export default function Bypass(): ReactNode {
    const router = useRouter();

    useEffect(() => {
        localStorage.setItem('blocking-qr-completed', 'true');
        router.push('/');
    }, []);

    return;
}
