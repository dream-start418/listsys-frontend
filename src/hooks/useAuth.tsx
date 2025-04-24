import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function useAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const token = localStorage.getItem('listan_token');
        if (!token) {
            router.push('/auth/signin');
        } else {
            setIsAuthenticated(true);
        }
    }, [router]);

    return isAuthenticated;
}