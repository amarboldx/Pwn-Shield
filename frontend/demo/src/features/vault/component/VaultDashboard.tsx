import React, { useEffect, useState, useRef } from 'react';
import { useVault } from '../../../context/VaultAuthContext';
import { VaultGrid } from './VaultGrid';
import { VaultEditor } from './VaultEditor';
import { VaultItem } from '../../../types/vault';
import { getBreachCount } from '../../pwned-checker/utils/pwnedUtils';

export type ScanStatus = 'scanning' | 'safe' | 'breached' | 'pending';

export const VaultDashboard: React.FC = () => {
  const { vaultItems, saveVaultState } = useVault();
  const [localItems, setLocalItems] = useState<VaultItem[]>(vaultItems);
  
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VaultItem | undefined>(undefined);
  const [isSyncing, setIsSyncing] = useState(false);

  // --- OPTIMIZED BREACH RADAR ENGINE ---
  const [scanStatuses, setScanStatuses] = useState<Record<string, ScanStatus>>({});
  const sessionPasswordCache = useRef<Map<string, ScanStatus>>(new Map());
  const syncTimeoutRef = useRef<number | null>(null);

  useEffect(() => { setLocalItems(vaultItems); }, [vaultItems]);

  useEffect(() => {
    let isMounted = true;

    const runBackgroundSweep = async () => {
      for (const item of localItems) {
        if (!isMounted) return;
        if (!item.password) continue;

        // 1. If we already scanned this exact password string in this session, use the cache.
        if (sessionPasswordCache.current.has(item.password)) {
          const cachedStatus = sessionPasswordCache.current.get(item.password)!;
          setScanStatuses(prev => ({ ...prev, [item.id]: cachedStatus }));
          continue;
        }

        // 2. Otherwise, flag it as scanning and hit the API.
        setScanStatuses(prev => ({ ...prev, [item.id]: 'scanning' }));
        
        try {
          const count = await getBreachCount(item.password);
          const finalStatus = count > 0 ? 'breached' : 'safe';
          
          sessionPasswordCache.current.set(item.password, finalStatus);
          
          if (isMounted) {
            setScanStatuses(prev => ({ ...prev, [item.id]: finalStatus }));
          }
        } catch (error) {
          // Fail gracefully if network drops
          if (isMounted) setScanStatuses(prev => ({ ...prev, [item.id]: 'pending' }));
        }
      }
    };

    runBackgroundSweep();
    return () => { isMounted = false; };
  }, [localItems]);

  // --- EXPLICIT SYNC PIPELINE ---
  const pushToDatabase = (newItems: VaultItem[]) => {
    setLocalItems(newItems);
    setIsSyncing(true);

    if (syncTimeoutRef.current) window.clearTimeout(syncTimeoutRef.current);

    syncTimeoutRef.current = window.setTimeout(async () => {
      await saveVaultState(newItems);
      setIsSyncing(false);
    }, 500);
  };

  const handleSave = (item: VaultItem) => {
    const exists = localItems.find(v => v.id === item.id);
    const nextItems = exists 
      ? localItems.map(v => v.id === item.id ? item : v)
      : [...localItems, item];
    
    pushToDatabase(nextItems);
    setEditingItem(undefined);
    setIsEditorOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Permanently delete this secret? This action cannot be undone.")) {
      const filtered = localItems.filter(item => item.id !== id);
      pushToDatabase(filtered);
    }
  };

  const handleEdit = (item: VaultItem) => {
    setEditingItem(item);
    setIsEditorOpen(true);
  };

  return (
    <div style={{ background: 'var(--pg-brand-white)', borderRadius: '16px', border: '1px solid var(--pg-slate-200)', padding: '24px', boxShadow: 'var(--pg-shadow-card)', position: 'relative' }}>
      <header style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 'var(--font-h1)', margin: 0, color: 'var(--pg-slate-900)' }}>Vault Manager</h2>
          <p style={{ fontSize: 'var(--font-micro)', color: 'var(--pg-slate-500)', margin: 0 }}>
             {isSyncing ? "Encrypting & Syncing..." : "Safe & Synchronized"}
          </p>
        </div>
        <button className="pg-toggle-btn" onClick={() => { setEditingItem(undefined); setIsEditorOpen(true); }}>+ Add Login</button>
      </header>

      {localItems.length > 0 ? (
        <VaultGrid 
          items={localItems} 
          scanStatuses={scanStatuses} 
          onEdit={handleEdit} 
          onDelete={handleDelete} 
        />
      ) : (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--pg-slate-500)' }}>
          <p>No secrets stored yet. Add your first item to begin.</p>
        </div>
      )}

      {isEditorOpen && (
        <VaultEditor onClose={() => { setIsEditorOpen(false); setEditingItem(undefined); }} onSave={handleSave} initialData={editingItem} />
      )}
    </div>
  );
};