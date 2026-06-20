import { useState } from 'react';
import { hashToSha1 } from '../../../core/crypto/sha1';

export function usePwnedCheck() {
    const [loading, setLoading] = useState(false);
    const [breachCount, setBreachCount] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    const checkPassword = async (password: string) => {
        if (!password) return;
        
        setLoading(true);
        setError(null);
        setBreachCount(null);

        try {
            // 1. Get the local full SHA-1 hash
            const fullHash = await hashToSha1(password);
            const prefix = fullHash.substring(0, 5);
            const suffix = fullHash.substring(5);

            // 2. Fetch matching suffixes from your secure Spring Boot proxy
            const response = await fetch(`http://localhost:8080/api/v1/pwned/range/${prefix}`);
            
            if (!response.ok) {
                throw new Error('Failed to communicate with security server.');
            }

            const rawText = await response.text();
            
            // 3. Parse the lines of suffixes looking for our match
            const lines = rawText.split('\n');
            let matchFound = false;

            for (const line of lines) {
                const [returnedSuffix, count] = line.trim().split(':');
                if (returnedSuffix === suffix) {
                    setBreachCount(parseInt(count, 10));
                    matchFound = true;
                    break;
                }
            }

            if (!matchFound) {
                setBreachCount(0); // Safe!
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred during verification.');
        } finally {
            setLoading(false);
        }
    };

    return { checkPassword, loading, breachCount, error };
}