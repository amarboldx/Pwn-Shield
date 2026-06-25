import { hashToSha1 } from '../../../core/crypto/sha1';
import { api } from '../../../core/api/axiosInstance';

const fetchWordlist = async (): Promise<string[]> => {
    const res = await fetch('/eff_large_wordlist.txt');
    if (!res.ok) throw new Error("Failed to load EFF wordlist");
    const text = await res.text();
    
    // Parse the "11111 abacus" format and return just the words
    return text.split('\n')
        .filter(line => line.trim() !== '')
        .map(line => line.split(/\s+/)[1])
        .filter(word => word); 
};

const generateRawPassphrase = (words: string[], phraseCount: number): string => {
    const array = new Uint32Array(phraseCount);
    window.crypto.getRandomValues(array);
    
    const selectedWords = Array.from(array).map(num => words[num % words.length]);

    // THE COMPLEXIFIER: Ensure it passes strict bank/corporate regex checkers
    // Modifies at least one random word to have: a Capital, a Number, and a Special Char.
    const targetIdx = Math.floor(Math.random() * phraseCount);
    let targetWord = selectedWords[targetIdx];
    
    targetWord = targetWord.charAt(0).toUpperCase() + targetWord.slice(1);
    
    targetWord += Math.floor(Math.random() * 10).toString();
    
    const specials = "!@#$%^&*";
    targetWord += specials[Math.floor(Math.random() * specials.length)];
    
    selectedWords[targetIdx] = targetWord;

    return selectedWords.join('-');
};

export const validateAndGeneratePassphrase = async (phraseCount: number = 4): Promise<string> => {
    const wordlist = await fetchWordlist();
    
    let passphrase = "";
    let isSafe = false;

    while (!isSafe) {
        passphrase = generateRawPassphrase(wordlist, phraseCount);
        const hash = await hashToSha1(passphrase);
        const prefix = hash.substring(0, 5);
        const suffix = hash.substring(5);
        
        const res = await api.get(`/pwned/range/${prefix}`);
        if (!res.data.includes(suffix)) {
            isSafe = true;
        }
    }
    return passphrase;
};