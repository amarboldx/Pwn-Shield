import React, { useState, useEffect } from 'react';
import { VaultItem, CategoryType } from '../../../types/vault';
import { validateAndGenerate } from '../utils/passwordGenerator';
import { validateAndGeneratePassphrase } from '../utils/passphraseGenerator';

interface Props {
  onClose: () => void;
  onSave: (item: VaultItem) => void;
  initialData?: VaultItem;
}

type GenMode = 'string' | 'phrase';

export const VaultEditor: React.FC<Props> = ({ onClose, onSave, initialData }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDirty, setIsDirty] = useState(false); 
  
  const [genMode, setGenMode] = useState<GenMode>('string');
  const [strLength, setStrLength] = useState<number>(16);
  const [phraseCount, setPhraseCount] = useState<number>(4);
  const [generatorError, setGeneratorError] = useState<string | null>(null);

  const [formData, setFormData] = useState<VaultItem>(initialData || {
    id: crypto.randomUUID(),
    title: '',
    username: '',
    password: '',
    url: '',
    notes: '',
    category: 'Login',
    updatedAt: new Date().toISOString()
  });

  // --- MANUAL GENERATOR OVERRIDE ---
  const handleManualGenerate = async () => {
    setIsGenerating(true);
    setGeneratorError(null);
    setIsDirty(true); // Flag as dirty so we don't accidentally overwrite later
    
    try {
      let secureSecret = "";
      if (genMode === 'string') {
        secureSecret = await validateAndGenerate(strLength);
      } else {
        secureSecret = await validateAndGeneratePassphrase(phraseCount);
      }
      setFormData(prev => ({ ...prev, password: secureSecret }));
    } catch (err: any) {
      setGeneratorError(err.message || "Failed to generate secret.");
    } finally {
      setIsGenerating(false);
    }
  };

  // --- THE DEBOUNCED AUTO-GENERATOR ---
  useEffect(() => {
    if (initialData && !isDirty) return;

    const timer = setTimeout(async () => {
      setIsGenerating(true);
      setGeneratorError(null);
      try {
        let secureSecret = "";
        if (genMode === 'string') {
          secureSecret = await validateAndGenerate(strLength);
        } else {
          secureSecret = await validateAndGeneratePassphrase(phraseCount);
        }
        setFormData(prev => ({ ...prev, password: secureSecret }));
      } catch (err: any) {
        setGeneratorError(err.message || "Failed to generate secret.");
      } finally {
        setIsGenerating(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [genMode, strLength, phraseCount, isDirty]); 


  // --- STRENGTH ENGINE ---
  const getStrength = () => {
    const val = genMode === 'string' ? strLength : phraseCount;
    if (genMode === 'string') {
      if (val < 12) return { label: 'WEAK', color: '#ef4444', pct: '25%' }; 
      if (val < 14) return { label: 'FAIR', color: '#eab308', pct: '50%' }; 
      if (val < 16) return { label: 'STRONG', color: '#84cc16', pct: '75%' }; 
      return { label: 'VAULT-GRADE', color: '#22c55e', pct: '100%' }; 
    } else {
      if (val <= 3) return { label: 'WEAK', color: '#ef4444', pct: '25%' };
      if (val === 4) return { label: 'FAIR', color: '#eab308', pct: '50%' };
      if (val === 5) return { label: 'STRONG', color: '#84cc16', pct: '75%' };
      return { label: 'VAULT-GRADE', color: '#22c55e', pct: '100%' };
    }
  };
  const strength = getStrength();

  const handleSaveClick = () => {
    if (!formData.title.trim()) {
      alert("A Record Title is required.");
      return;
    }
    onSave({ ...formData, updatedAt: new Date().toISOString() });
  };

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: '10px',
    border: '1px solid var(--pg-slate-200)', fontSize: 'var(--font-body)',
    color: 'var(--pg-slate-900)', backgroundColor: 'var(--pg-canvas-bg)',
    boxSizing: 'border-box' as const, outline: 'none', marginBottom: '12px'
  };

  const labelStyle = {
    display: 'block', fontSize: 'var(--font-micro)', fontWeight: 700, 
    color: 'var(--pg-slate-700)', marginBottom: '6px'
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '20px' }}>
      
      <div style={{ background: 'var(--pg-brand-white)', padding: '32px', borderRadius: '16px', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--pg-shadow-card)', border: '1px solid var(--pg-slate-200)' }}>
        
        <h2 style={{ fontSize: 'var(--font-h1)', margin: '0 0 24px 0', color: 'var(--pg-slate-900)' }}>
          {initialData ? 'Edit Secret' : 'New Vault Item'}
        </h2>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ flex: 2 }}>
            <label style={labelStyle}>Record Title <span style={{ color: '#ef4444' }}>*</span></label>
            <input placeholder="e.g. ProtonMail, GitHub" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Category</label>
            <select 
              value={formData.category} 
              onChange={e => setFormData({...formData, category: e.target.value as CategoryType})} 
              style={{...inputStyle, cursor: 'pointer', appearance: 'none'}}
            >
              <option value="Login">Login</option>
              <option value="Secure Note">Secure Note</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Identity">Identity</option>
            </select>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Username / Email</label>
            <input placeholder="operator@domain.com" value={formData.username || ''} onChange={e => setFormData({...formData, username: e.target.value})} style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Website URL</label>
            <input placeholder="https://..." value={formData.url || ''} onChange={e => setFormData({...formData, url: e.target.value})} style={inputStyle} />
          </div>
        </div>
        
        {/* === SMART GENERATOR CONTROLS === */}
        <div style={{ backgroundColor: 'var(--pg-slate-100)', padding: '16px', borderRadius: '12px', marginBottom: '16px', border: '1px solid var(--pg-slate-200)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: 'var(--font-micro)', fontWeight: 700, color: 'var(--pg-slate-700)' }}>Smart Generator</span>
            
            <div style={{ display: 'flex', background: 'var(--pg-slate-200)', borderRadius: '8px', padding: '2px' }}>
              <button type="button" onClick={() => { setGenMode('string'); setIsDirty(true); }} style={{ padding: '4px 8px', borderRadius: '6px', border: 'none', fontSize: '10px', fontWeight: 700, cursor: 'pointer', background: genMode === 'string' ? 'var(--pg-brand-white)' : 'transparent', color: genMode === 'string' ? 'var(--pg-slate-900)' : 'var(--pg-slate-500)' }}>
                String
              </button>
              <button type="button" onClick={() => { setGenMode('phrase'); setIsDirty(true); }} style={{ padding: '4px 8px', borderRadius: '6px', border: 'none', fontSize: '10px', fontWeight: 700, cursor: 'pointer', background: genMode === 'phrase' ? 'var(--pg-brand-white)' : 'transparent', color: genMode === 'phrase' ? 'var(--pg-slate-900)' : 'var(--pg-slate-500)' }}>
                Phrase
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <span style={{ fontSize: 'var(--font-micro)', fontWeight: 600, color: 'var(--pg-slate-500)', width: '40px' }}>
              {genMode === 'string' ? `L:${strLength}` : `W:${phraseCount}`}
            </span>
            <input 
              type="range" 
              min={genMode === 'string' ? 8 : 3} 
              max={genMode === 'string' ? 24 : 8} 
              value={genMode === 'string' ? strLength : phraseCount} 
              onChange={e => {
                setIsDirty(true);
                genMode === 'string' ? setStrLength(Number(e.target.value)) : setPhraseCount(Number(e.target.value));
              }}
              style={{ flex: 1, accentColor: 'var(--pg-slate-700)' }}
            />
          </div>

          <div style={{ height: '4px', background: 'var(--pg-slate-200)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: strength.pct, backgroundColor: strength.color, transition: 'all 0.3s ease' }} />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, color: strength.color, transition: 'color 0.3s ease' }}>{strength.label}</span>
            
            {/* --- REGENERATE BUTTON --- */}
            <button 
              type="button" 
              onClick={handleManualGenerate} 
              disabled={isGenerating} 
              style={{ background: 'transparent', border: 'none', color: 'var(--pg-slate-700)', fontSize: '11px', cursor: isGenerating ? 'wait' : 'pointer', fontWeight: 700, padding: 0 }}
            >
              {isGenerating ? 'Rolling Dice...' : '⚡ Regenerate'}
            </button>
          </div>
        </div>

        {generatorError && (
          <div style={{ backgroundColor: 'var(--pg-danger-bg)', padding: '8px', borderRadius: '8px', fontSize: '11px', color: 'var(--pg-danger-text)', marginBottom: '12px', border: '1px solid var(--pg-danger-border)' }}>
            {generatorError}
          </div>
        )}

        <label style={labelStyle}>Secret Payload</label>
        <input placeholder="••••••••••••••••" value={formData.password || ''} onChange={e => setFormData({...formData, password: e.target.value})} style={{ ...inputStyle, fontFamily: 'var(--font-crypto)' }} />

        <label style={labelStyle}>Secure Notes</label>
        <textarea placeholder="Private keys, recovery phrases, or PINs..." value={formData.notes || ''} onChange={e => setFormData({...formData, notes: e.target.value})} style={{ ...inputStyle, height: '80px', resize: 'vertical', fontFamily: 'var(--font-body)' }} />

        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button className="pg-toggle-btn" style={{ flex: 1, padding: '12px', fontSize: '13px' }} onClick={handleSaveClick} disabled={isGenerating}>
              Save to Vault
            </button>
            <button onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid var(--pg-slate-200)', background: 'var(--pg-slate-100)', color: 'var(--pg-slate-700)', fontWeight: 700, cursor: 'pointer' }}>
              Cancel
            </button>
        </div>
      </div>
    </div>
  );
};