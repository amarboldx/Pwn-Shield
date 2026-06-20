export async function hashToSha1(plainText: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(plainText);
    
    // Compute the SHA-1 digest using native browser hardware acceleration
    const hashBuffer = await window.crypto.subtle.digest('SHA-1', data);
    
    // Convert the buffer array into a readable Hexadecimal string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}