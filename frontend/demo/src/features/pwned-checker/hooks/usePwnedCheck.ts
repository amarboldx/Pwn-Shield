import { useState } from 'react';
import { hashToSha1 } from '../../../core/crypto/sha1';
import {api} from '../../../core/api/axiosInstance';
import { getBreachCount } from '../utils/pwnedUtils';

export function usePwnedCheck() {
    const [loading, setLoading] = useState(false);
    const [breachCount, setBreachCount] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    const checkPassword = async (password: string) => {
        setLoading(true);
        setError(null);
        try {
            const count = await getBreachCount(password);
            setBreachCount(count);
        } catch (err: any) {
            setError(err.message || 'An error occurred.');
        } finally {
            setLoading(false);
        }
    };
    return { checkPassword, loading, breachCount, error };
}