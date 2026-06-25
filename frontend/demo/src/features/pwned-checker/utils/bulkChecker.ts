import { hashToSha1 } from '../../../core/crypto/sha1';
import { api } from '../../../core/api/axiosInstance';

export interface ParsedCredential {
    id: string;
    website?: string;
    username?: string;
    email?: string;
    password: string;
    isLeaked?: boolean;
    leakCount?: number;
}

export function getCleanDomain(url?: string): string {
    if (!url) return 'default';
    try {
        const cleaned = url.replace(/^(https?:\/\/)?(www\.)?/, '');
        const parts = cleaned.split('/')[0].split('.');
        return parts.slice(-2).join('.');
    } catch {
        return 'default';
    }
}

export async function processBulkCheck(
    credentials: ParsedCredential[],
    onProgress: (current: number, total: number) => void
): Promise<ParsedCredential[]> {
    const uniquePasswords = Array.from(new Set(credentials.map(c => c.password)));
    const leakCache = new Map<string, number>();
    const BATCH_SIZE = 5;
    let completed = 0;

    for (let i = 0; i < uniquePasswords.length; i += BATCH_SIZE) {
        const batch = uniquePasswords.slice(i, i + BATCH_SIZE);
        
        const batchPromises = batch.map(async (pwd) => {
            const hash = await hashToSha1(pwd);
            const prefix = hash.substring(0, 5);
            const suffix = hash.substring(5);

            try {
                const response = await api.get<string>(`/pwned/range/${prefix}`, {
                    responseType: 'text'
                });
            
                const text = response.data;
                const lines = text.split('\n');
                
                let count = 0;
                for (const line of lines) {
                    const [retSuffix, leakNum] = line.trim().split(':');
                    if (retSuffix === suffix) {
                        count = parseInt(leakNum, 10);
                        break;
                    }
                }
                leakCache.set(pwd, count);
            } catch {
                leakCache.set(pwd, -1);
            }
        });

        await Promise.all(batchPromises);
        completed += batch.length;
        onProgress(completed, uniquePasswords.length);
    }

    return credentials.map(cred => {
        const count = leakCache.get(cred.password) || 0;
        return {
            ...cred,
            isLeaked: count > 0,
            leakCount: count
        };
    });
}