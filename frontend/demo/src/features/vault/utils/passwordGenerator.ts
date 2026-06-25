import { hashToSha1 } from '../../../core/crypto/sha1';
import { api } from '../../../core/api/axiosInstance';

export const generatePassword = (length: number = 16): string => {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
  const array = new Uint32Array(length);
  window.crypto.getRandomValues(array);
  
  return Array.from(array)
    .map(x => charset[x % charset.length])
    .join('');
};

export const validateAndGenerate = async (length: number = 16): Promise<string> => {
    let password = "";
    let isSafe = false;

    while (!isSafe) {
        password = generatePassword(length);
        const hash = await hashToSha1(password);
        const prefix = hash.substring(0, 5);
        const suffix = hash.substring(5);
        
        const res = await api.get(`/pwned/range/${prefix}`);
        if (!res.data.includes(suffix)) {
            isSafe = true;
        }
    }
    return password;
};