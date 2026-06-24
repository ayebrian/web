import {ReactNode, useEffect} from 'react';
import {useNavigate} from 'react-router';
import {useBlockingQR} from '@/app/blocking-qr/dialog';

export default function Bypass(): ReactNode {
    const navigate = useNavigate();
    const blockingQR = useBlockingQR();

    useEffect(() => {
        blockingQR.setShouldBlock(false);
        void navigate('/');
    }, []);

    return;
}
