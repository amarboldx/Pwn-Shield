import React, { createContext, useContext, useState, ReactNode } from 'react';
import { api } from '../core/api/axiosInstance';
import { VaultItem } from '../types/vault';
import { deriveMasterKeys, decryptVaultPayload, encryptVaultPayload } from '../core/crypto/vaultCrypto';

interface VaultAuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  vaultItems: VaultItem[];
  authError: string | null;
  login: (email: string, masterPass: string) => Promise<void>;
  signup: (email: string, masterPass: string) => Promise<void>;
  logout: () => void;
  saveVaultState: (newItems: VaultItem[]) => Promise<void>;
}

const VaultAuthContext = createContext<VaultAuthContextType | null>(null);

export const VaultAuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  const [keyB, setKeyB] = useState<CryptoKey | null>(null);
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);


  const unboxVault = async (activeKeyB: CryptoKey) => {
    try {
      const res = await api.get('/vault/sync');
      const serverBlob: string = res.data;

      if (serverBlob === "EMPTY_VAULT_INITIALIZED") {
        console.log("Genesis vault detected. Initializing empty ciphertext block...");
        const genesisBase64 = await encryptVaultPayload(JSON.stringify([]), activeKeyB);
        
        // Push the real AES-GCM empty array back to overwrite the caution tape
        await api.post('/vault/sync', genesisBase64, {
          headers: { 'Content-Type': 'text/plain' }
        });
        
        setVaultItems([]);
      } else {
        const plaintextJson = await decryptVaultPayload(serverBlob, activeKeyB);
        const parsedItems: VaultItem[] = JSON.parse(plaintextJson);
        setVaultItems(parsedItems);
      }
      
      setIsAuthenticated(true);
    } catch (err) {
      console.error("Failed to decrypt or sync vault:", err);
      setAuthError("Cryptographic unboxing failed. Key mismatch.");
      setIsAuthenticated(false);
    }
  };

  /**
   * LOGIN
   */
  const login = async (email: string, masterPass: string) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const saltRes = await api.get(`/auth/salt?email=${encodeURIComponent(email)}`);
      const salt = saltRes.data.salt;

      const keys = await deriveMasterKeys(masterPass, salt);
      const keyAHex = keys.authKeyHex;
      const derivedKeyB = keys.vaultCryptoKey;

      await api.post('/auth/login', { email, authKeyHex: keyAHex });

      setKeyB(derivedKeyB);

      await unboxVault(derivedKeyB);

    } catch (err: any) {
      setAuthError(err.response?.data || "Handshake rejected.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * SIGNUP
   */
  const signup = async (email: string, masterPass: string) => {
      setIsLoading(true);
      setAuthError(null);
      try {
        // 1. Generate 32-character hex salt locally
        const array = new Uint8Array(16);
        window.crypto.getRandomValues(array);
        const localSalt = Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');

        // 2. Derive keys using this specific salt
        const keys = await deriveMasterKeys(masterPass, localSalt);
        
        // 3. Send to server
        await api.post('/auth/signup', { 
          email, 
          authKeyHex: keys.authKeyHex, 
          cryptoSalt: localSalt 
        });

        setKeyB(keys.vaultCryptoKey);
        await unboxVault(keys.vaultCryptoKey);
      } catch (err: any) {
        setAuthError(err.response?.data || "Signup failed.");
      } finally {
        setIsLoading(false);
      }
    };

  /**
   * PUSH UPDATED VAULT TO POSTGRESQL
   */
  const saveVaultState = async (newItems: VaultItem[]) => {
    if (!keyB) throw new Error("CRITICAL: RAM Key B lost. Cannot re-encrypt.");
    
    setVaultItems(newItems);

    const jsonStr = JSON.stringify(newItems);
    const newCiphertextBlob = await encryptVaultPayload(jsonStr, keyB);

    await api.post('/vault/sync', newCiphertextBlob, {
      headers: { 'Content-Type': 'text/plain' }
    });
  };

  const logout = () => {
    setKeyB(null);
    setVaultItems([]);
    setIsAuthenticated(false);
    document.cookie = "pg_token=; Max-Age=0; path=/; domain=" + window.location.hostname;
  };

    return (
    <VaultAuthContext.Provider value={{
      isAuthenticated, isLoading, vaultItems, authError,
      login, signup, logout, saveVaultState
    }}>
      {children}
    </VaultAuthContext.Provider>
  );
};

export const useVault = () => {
  const context = useContext(VaultAuthContext);
  if (!context) throw new Error("useVault must be used inside a <VaultAuthProvider>");
  return context;
};