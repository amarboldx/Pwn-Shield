import { hashToSha1 } from '../../../core/crypto/sha1';
import { api } from '../../../core/api/axiosInstance';

export async function getBreachCount(password: string): Promise<number> {
    if (!password) return 0;

    const fullHash = await hashToSha1(password);
    const prefix = fullHash.substring(0, 5);
    const suffix = fullHash.substring(5);

    const response = await api.get<string>(`/pwned/range/${prefix}`, {
        responseType: 'text'
    });

    const lines = response.data.split('\n');
    for (const line of lines) {
        const [returnedSuffix, count] = line.trim().split(':');
        if (returnedSuffix === suffix) {
            return parseInt(count, 10);
        }
    }
    return 0;
}