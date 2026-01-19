import { jwtDecode } from 'jwt-decode';

interface TokenPayload {
    exp: number; // Expiration time
    id: number;  // User ID or other payload data
}

export const isTokenValid = (token: string): boolean => {
    try {
        const decoded: TokenPayload = jwtDecode(token);
        const currentTime = Math.floor(Date.now() / 1000);
        return decoded.exp > currentTime; // Token is valid if expiration time is in the future
    } catch (error) {
        console.error('Invalid token:', error);
        return false;
    }
};
