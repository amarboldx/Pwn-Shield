import { argon2id } from 'hash-wasm';

// Helper: Converts raw byte arrays into clean Hexadecimal strings for the backend
const toHex = (buf: Uint8Array): string => {
    return Array.from(buf).map(b => b.toString(16).padStart(2, '0')).join('');
};

export interface MasterKeyPair {
    authKeyHex: string;        // Key A: Sent to Spring Boot to prove "I am the owner"
    vaultCryptoKey: CryptoKey; // Key B: Held strictly in browser RAM to lock/unlock JSON
}

/**
 * Takes the Master Password and derives two mathematically decoupled keys.
 */
export async function deriveMasterKeys(masterPassword: string, email: string): Promise<MasterKeyPair> {
    const encoder = new TextEncoder();
    
    // The salt must be deterministic per user so they generate the exact same keys tomorrow!
    const salt = encoder.encode(`pg_salt_${email.toLowerCase().trim()}`);

    // OWASP Recommended minimum baselines for interactive Argon2id logins
    const derivedBuffer = await argon2id({
        password: masterPassword,
        salt: salt,
        parallelism: 1,
        iterations: 3,
        memorySize: 64 * 1024, // 64 MB of RAM allocated per login computation
        hashLength: 64,        // We request a 64-byte pool (512 bits)
        outputType: 'binary'
    });

    // BIFURCATION: Slice the 64 bytes right down the middle
    const keyABuffer = derivedBuffer.slice(0, 32);  // Bytes 0 to 31 (Auth)
    const keyBBuffer = derivedBuffer.slice(32, 64); // Bytes 32 to 63 (Vault)

    // PEAK SECURITY OPTIMIZATION: 
    // We import Key B directly into the browser's C++ WebCrypto ring.
    // By passing "false" for extractable, even a malicious XSS JavaScript attack 
    // running in the user's browser cannot read the raw key bytes back out of RAM!
    const vaultCryptoKey = await window.crypto.subtle.importKey(
        'raw',
        keyBBuffer,
        { name: 'AES-GCM' },
        false, 
        ['encrypt', 'decrypt']
    );

    return {
        authKeyHex: toHex(keyABuffer),
        vaultCryptoKey
    };
}

/**
 * PAYLOAD LOCKING
 * Takes a raw JSON string of the user's vault and outputs an AES-256 Base64 blob.
 */
export async function encryptVaultPayload(plainTextJSON: string, vaultKey: CryptoKey): Promise<string> {
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(plainTextJSON);

    // AES-GCM requires a fresh, cryptographically random 12-byte IV for every save
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    const cipherBuffer = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        vaultKey,
        encodedData
    );

    // Package the IV and Ciphertext together: [ 12 Bytes IV ] + [ Ciphertext Blob ]
    const payload = new Uint8Array(iv.length + cipherBuffer.byteLength);
    payload.set(iv, 0);
    payload.set(new Uint8Array(cipherBuffer), iv.length);

    // Convert binary payload to Base64 for safe text storage in PostgreSQL
    return btoa(String.fromCharCode(...payload));
}

/**
 * PAYLOAD UNLOCKING
 * Reverses the Base64 blob back into the user's plain-text JSON string.
 */
export async function decryptVaultPayload(base64CipherBlob: string, vaultKey: CryptoKey): Promise<string> {
    const binaryStr = atob(base64CipherBlob);
    const rawBuffer = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
        rawBuffer[i] = binaryStr.charCodeAt(i);
    }

    // Unpack the bundle: strip the 12-byte IV off the front
    const iv = rawBuffer.slice(0, 12);
    const ciphertext = rawBuffer.slice(12);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        vaultKey,
        ciphertext
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
}