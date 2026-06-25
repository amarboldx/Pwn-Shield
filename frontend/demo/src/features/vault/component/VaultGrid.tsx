import React, { useState } from 'react';
import { VaultItem } from '../../../types/vault';
import { useClipboardScrub } from '../hooks/useClipboardScrub';
import { ScanStatus } from './VaultDashboard';

interface Props {
  items: VaultItem[];
  scanStatuses: Record<string, ScanStatus>;
  onEdit: (item: VaultItem) => void;
  onDelete: (id: string) => void;
}

export const VaultGrid: React.FC<Props> = ({ items, scanStatuses, onEdit, onDelete }) => {
  const { copyToClipboard } = useClipboardScrub();
  
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [clickedId, setClickedId] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);

  const handleInteractionClick = async (id: string, password?: string) => {
    if (!password) return;
    setClickedId(id);
    setTimeout(() => setClickedId(null), 150);
    await copyToClipboard(password);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const getFaviconUrl = (url?: string): string | null => {
    if (!url) return null;
    try {
      const targetUrl = url.startsWith('http') ? url : `https://${url}`;
      return `https://icons.duckduckgo.com/ip3/${new URL(targetUrl).hostname}.ico`;
    } catch { return null; }
  };

  // --- THE STANDARDIZED PILL RENDERER ---
  const renderStatusBadge = (status: ScanStatus) => {
    switch (status) {
      case 'scanning':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'var(--pg-slate-700)', background: 'var(--pg-slate-100)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--pg-slate-200)', fontWeight: 700 }}>
            <svg style={{ animation: 'pg-spin 1s linear infinite', width: '10px', height: '10px', color: 'var(--pg-slate-500)' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.25"></circle>
              <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Scanning
          </span>
        );
      case 'breached':
        return (
          <span style={{ display: 'inline-block', fontSize: '10px', color: 'var(--pg-danger-text)', background: 'var(--pg-danger-bg)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--pg-danger-border)', fontWeight: 700 }}>
            🚨 Pwned
          </span>
        );
      case 'safe':
        return (
          <span style={{ display: 'inline-block', fontSize: '10px', color: 'var(--pg-safe-text)', background: 'var(--pg-safe-bg)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--pg-safe-border)', fontWeight: 700 }}>
            🛡️ Safe
          </span>
        );
      default:
        return (
          <span style={{ display: 'inline-block', fontSize: '10px', color: 'var(--pg-slate-500)', background: 'transparent', padding: '2px 6px', borderRadius: '4px', border: '1px solid transparent', fontWeight: 700 }}>
            Queued...
          </span>
        );
    }
  };

  return (
    <div style={{ overflowX: 'auto', position: 'relative' }}>
      
      {/* GLOBAL GRID ANIMATIONS */}
      <style>
        {`
          @keyframes pg-toast-slide-up {
            from { opacity: 0; transform: translate(-50%, 20px); }
            to { opacity: 1; transform: translate(-50%, 0); }
          }
          @keyframes pg-spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>

      {toastVisible && (
        <div style={{
          position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)',
          backgroundColor: 'var(--pg-slate-900)', color: 'var(--pg-brand-white)',
          padding: '12px 24px', borderRadius: '9999px', fontSize: 'var(--font-micro)', fontWeight: 700,
          boxShadow: 'var(--pg-shadow-card)', border: '1px solid var(--pg-slate-700)',
          display: 'flex', alignItems: 'center', gap: '8px', zIndex: 9999,
          animation: 'pg-toast-slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          <span style={{ fontSize: '14px' }}>📋</span>
          Securely copied to clipboard. Auto-scrubbing in 15s...
        </div>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '12px' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--pg-slate-200)' }}>
            <th className="pg-matrix-cell" style={{ textAlign: 'left', color: 'var(--pg-slate-500)', fontSize: 'var(--font-micro)' }}>Identity</th>
            <th className="pg-matrix-cell" style={{ textAlign: 'center', color: 'var(--pg-slate-500)', fontSize: 'var(--font-micro)' }}>Secret Payload</th>
            <th className="pg-matrix-cell" style={{ textAlign: 'right', color: 'var(--pg-slate-500)', fontSize: 'var(--font-micro)' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const status = scanStatuses[item.id] || 'pending';
            const isHovered = hoveredId === item.id;
            const isClicked = clickedId === item.id;
            const iconUrl = getFaviconUrl(item.url);

            return (
              <tr key={item.id} style={{ 
                borderBottom: '1px solid var(--pg-slate-200)',
                backgroundColor: status === 'breached' ? 'var(--pg-danger-bg)' : 'transparent',
                transition: 'background-color 0.2s ease'
              }}>
                {/* IDENTITY COLUMN */}
                <td className="pg-matrix-cell">
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ 
                      width: '28px', height: '28px', borderRadius: '6px', marginTop: '2px',
                      backgroundColor: 'var(--pg-slate-100)', border: '1px solid var(--pg-slate-200)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' 
                    }}>
                      {iconUrl ? (
                        <img src={iconUrl} alt="" style={{ width: '16px', height: '16px' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                      ) : (
                        <span style={{ fontSize: '14px' }}>🌐</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontWeight: 700, color: status === 'breached' ? 'var(--pg-danger-text)' : 'var(--pg-slate-900)' }}>
                        {item.title}
                      </span>
                      <span style={{ fontSize: 'var(--font-micro)', color: 'var(--pg-slate-500)' }}>{item.username || 'No Identity Attached'}</span>
                      <div style={{ marginTop: '2px' }}>
                        {renderStatusBadge(status)}
                      </div>
                    </div>
                  </div>
                </td>

                {/* SECRET COLUMN */}
                <td className="pg-matrix-cell pg-secret-anchor" style={{ verticalAlign: 'middle', position: 'relative', textOverflow: 'clip' }}>
                  <div 
                    onMouseEnter={() => setHoveredId(item.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => handleInteractionClick(item.id, item.password)}
                    title="Click to securely copy"
                    style={{
                      position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: '100%', minHeight: '32px', cursor: 'pointer', borderRadius: '8px',
                      backgroundColor: isHovered ? 'var(--pg-slate-100)' : 'transparent',
                      transform: isClicked ? 'scale(0.95)' : 'scale(1)',
                      transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                      border: isHovered ? '1px solid var(--pg-slate-200)' : '1px solid transparent',
                      overflow: 'hidden'
                    }}
                  >
                    <span style={{ position: 'absolute', opacity: isHovered ? 0 : 1, transition: 'opacity 0.2s ease', pointerEvents: 'none', letterSpacing: '2px', color: 'var(--pg-slate-500)' }}>
                      ••••••••••••
                    </span>
                    <span style={{ position: 'absolute', opacity: isHovered ? 1 : 0, filter: isHovered ? 'blur(0px)' : 'blur(4px)', transition: 'all 0.2s ease', pointerEvents: 'none', color: 'var(--pg-slate-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '90%' }}>
                      {item.password}
                    </span>
                  </div>
                </td>

                {/* ACTIONS COLUMN */}
                <td className="pg-matrix-cell" style={{ textAlign: 'right', verticalAlign: 'middle' }}>
                  <div style={{ display: 'inline-flex', gap: '8px' }}>
                    <button onClick={() => onEdit(item)} title="Edit Entry" style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--pg-slate-200)', background: 'var(--pg-brand-white)', color: 'var(--pg-slate-900)', cursor: 'pointer', fontSize: '12px' }}>✏️</button>
                    <button onClick={() => onDelete(item.id)} title="Delete Entry" style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--pg-danger-border)', background: 'var(--pg-danger-bg)', color: 'var(--pg-danger-text)', cursor: 'pointer', fontSize: '12px' }}>🗑️</button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};