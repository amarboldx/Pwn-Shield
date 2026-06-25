import React, { useState } from 'react';
import { useVault } from '../../../context/VaultAuthContext';

export const VaultAuthGate: React.FC = () => {
  const { login, signup, isLoading, authError } = useVault();

  const [isLoginMode, setIsLoginMode] = useState<boolean>(true);
  const [email, setEmail] = useState<string>('');
  const [masterPassword, setMasterPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setFormError(null);
    
    if (!email || !masterPassword) {
      setFormError('Please fill out all required fields.');
      return;
    }

    if (!isLoginMode) {
      if (masterPassword !== confirmPassword) {
        setFormError('Master passwords do not match.');
        return;
      }
      if (masterPassword.length < 8) {
        setFormError('Master password must be at least 8 characters.');
        return;
      }
    }

    try {
      if (isLoginMode) {
        await login(email, masterPassword);
      } else {
        await signup(email, masterPassword);
      }
    } catch (err) {
      console.error("Login attempt failed", err);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '440px', margin: '0 auto' }}>
      
      {/* Tier 1 Outer Main Card (16px Radius) */}
      <div style={{
        backgroundColor: 'var(--pg-brand-white)',
        borderRadius: '16px',
        boxShadow: 'var(--pg-shadow-card)',
        border: '1px solid var(--pg-slate-200)',
        padding: '32px',
        boxSizing: 'border-box'
      }}>
        
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h2 style={{ fontSize: 'var(--font-h1)', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--pg-slate-900)' }}>
            {isLoginMode ? 'Unlock Zero-Knowledge Vault' : 'Provision Secure Vault'}
          </h2>
          <p style={{ fontSize: 'var(--font-micro)', color: 'var(--pg-slate-500)', margin: 0 }}>
            Client-side Argon2id key derivation active
          </p>
        </div>

        {/* Tier 2 Inner Sub-Wrapper (12px Radius) */}
        <div style={{
          display: 'flex',
          backgroundColor: 'var(--pg-slate-100)',
          borderRadius: '12px',
          padding: '4px',
          marginBottom: '24px'
        }}>
          <button
            type="button"
            onClick={() => { setIsLoginMode(true); setFormError(null); }}
            style={{
              flex: 1,
              padding: '8px 0',
              borderRadius: '10px', // Tier 3 (12 - 2)
              border: 'none',
              fontSize: 'var(--font-micro)',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              backgroundColor: isLoginMode ? 'var(--pg-brand-white)' : 'transparent',
              color: isLoginMode ? 'var(--pg-slate-900)' : 'var(--pg-slate-500)',
              boxShadow: isLoginMode ? '0 2px 4px rgba(0,0,0,0.04)' : 'none'
            }}
          >
            Authenticate
          </button>
          <button
            type="button"
            onClick={() => { setIsLoginMode(false); setFormError(null); }}
            style={{
              flex: 1,
              padding: '8px 0',
              borderRadius: '10px',
              border: 'none',
              fontSize: 'var(--font-micro)',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              backgroundColor: !isLoginMode ? 'var(--pg-brand-white)' : 'transparent',
              color: !isLoginMode ? 'var(--pg-slate-900)' : 'var(--pg-slate-500)',
              boxShadow: !isLoginMode ? '0 2px 4px rgba(0,0,0,0.04)' : 'none'
            }}
          >
            Register New Key
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-micro)', fontWeight: 700, color: 'var(--pg-slate-700)', marginBottom: '6px' }}>
              Account Identifier (Email)
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value.trim())}
              placeholder="operator@pwnguard.internal"
              style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid var(--pg-slate-200)',
                    fontSize: 'var(--font-body)',
                    fontFamily: 'monospace',
                    color: 'var(--pg-slate-900)',
                    backgroundColor: 'var(--pg-canvas-bg)',
                    boxSizing: 'border-box',
                    outline: 'none'
              }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: 'var(--font-micro)', fontWeight: 700, color: 'var(--pg-slate-700)' }}>Master Password</label>
              <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--pg-danger-text)', backgroundColor: 'var(--pg-danger-bg)', padding: '2px 6px', borderRadius: '4px' }}>
                Never saved
              </span>
            </div>
            <input
              type="password"
              required
              value={masterPassword}
              onChange={(e) => setMasterPassword(e.target.value)}
              placeholder="••••••••••••••••"
              style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid var(--pg-slate-200)',
                    fontSize: 'var(--font-body)',
                    fontFamily: 'monospace',
                    color: 'var(--pg-slate-900)',
                    backgroundColor: 'var(--pg-canvas-bg)', // <-- ADD THIS LINE TO ALL 3 INPUTS
                    boxSizing: 'border-box',
                    outline: 'none'
              }}
            />
          </div>

          {!isLoginMode && (
            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-micro)', fontWeight: 700, color: 'var(--pg-slate-700)', marginBottom: '6px' }}>
                Verify Master Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••••••"
                style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid var(--pg-slate-200)',
                    fontSize: 'var(--font-body)',
                    fontFamily: 'monospace',
                    color: 'var(--pg-slate-900)',
                    backgroundColor: 'var(--pg-canvas-bg)',
                    boxSizing: 'border-box',
                    outline: 'none'
                }}
              />
            </div>
          )}

          {(formError || authError) && (
            <div style={{
              backgroundColor: 'var(--pg-danger-bg)',
              borderLeft: '4px solid var(--pg-danger-text)',
              padding: '10px 12px',
              borderRadius: '0 8px 8px 0',
              fontSize: 'var(--font-micro)',
              color: 'var(--pg-danger-text)',
              fontWeight: 600
            }}>
              {formError || authError}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '10px',
              backgroundColor: 'var(--pg-brand-black)',
              color: 'var(--pg-brand-white)',
              fontSize: 'var(--font-body-s)',
              fontWeight: 700,
              border: 'none',
              cursor: isLoading ? 'wait' : 'pointer',
              marginTop: '4px',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            {isLoading ? 'Bifurcating Keys in WASM Engine...' : isLoginMode ? 'Decrypt Private Vault' : 'Initialize Zero-Knowledge Space'}
          </button>
        </form>

      </div>
    </div>
  );
};