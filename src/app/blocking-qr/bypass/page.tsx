import {ReactNode, useEffect} from 'react';
import { useNavigate } from 'react-router';

export default function Bypass(): ReactNode {
    const navigate = useNavigate();

    useEffect(() => {
        localStorage.setItem('blocking-qr-completed', 'true');
        void navigate('/');
    }, []);

    return;
}
