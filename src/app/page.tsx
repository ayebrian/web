import {useEffect} from 'react';
import {useNavigate} from 'react-router';

export function AppPage() {
    const navigate = useNavigate();

    useEffect(() => {
        void navigate('/community');
    }, [navigate]);

    return null;
}
