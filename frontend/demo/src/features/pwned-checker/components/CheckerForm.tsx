import React, { useState } from 'react';
import { usePwnedCheck } from '../hooks/usePwnedCheck';

export default function CheckerForm() {
    const [inputPassword, setInputPassword] = useState('');
    const { checkPassword, loading, breachCount, error } = usePwnedCheck();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        checkPassword(inputPassword);
    };

    return (
        <div style={{ 
            padding: '28px', 
            background: '#ffffff', 
            borderRadius: '16px', 
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
            boxSizing: 'border-box',
            width: '100%'
        }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 8px 0', color: '#0f172a' }}>
                Instant Vulnerability Scan
            </h2>
            <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 20px 0', lineHeight: '1.4' }}>
                Verify if a credential has appeared in public leaks. Using $k$-anonymity, your plain text password never leaves this device.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                <input
                    type="password"
                    placeholder="Enter password to analyze..."
                    value={inputPassword}
                    onChange={(e) => setInputPassword(e.target.value)}
                    style={{ 
                        padding: '14px 16px', 
                        fontSize: '15px', 
                        borderRadius: '10px', 
                        border: '1px solid #cbd5e1',
                        background: '#f8fafc',
                        color: '#0f172a',
                        outline: 'none',
                        boxSizing: 'border-box',
                        width: '100%',
                        transition: 'border-color 0.15s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#000000'}
                    onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                />
                <button
                    type="submit"
                    disabled={loading || !inputPassword}
                    style={{ 
                        padding: '14px 16px', 
                        fontSize: '15px', 
                        fontWeight: '700',
                        backgroundColor: (loading || !inputPassword) ? '#94a3b8' : '#000000', 
                        color: '#ffffff', 
                        border: 'none', 
                        borderRadius: '10px', 
                        cursor: (loading || !inputPassword) ? 'not-allowed' : 'pointer',
                        width: '100%',
                        boxSizing: 'border-box',
                        transition: 'background-color 0.15s ease',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                >
                    {loading ? 'Performing Cryptographic Lookup...' : 'Analyze Credential'}
                </button>
            </form>

            <div style={{ marginTop: '24px' }}>
                {error && (
                    <div style={{ color: '#b91c1c', padding: '14px', background: '#fef2f2', borderRadius: '10px', border: '1px solid #f87171', fontSize: '14px' }}>
                        ❌ {error}
                    </div>
                )}
                
                {breachCount !== null && !error && (
                    breachCount > 0 ? (
                        <div style={{ color: '#991b1b', padding: '16px', background: '#fef2f2', borderRadius: '10px', border: '1px solid #fecaca', borderLeft: '5px solid #dc2626', fontSize: '14px', lineHeight: '1.5' }}>
                            ⚠️ <strong>High Risk!</strong> This password has appeared in <strong>{breachCount.toLocaleString()}</strong> public data breaches. Immediately retire this credential.
                        </div>
                    ) : (
                        <div style={{ color: '#166534', padding: '16px', background: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d0', borderLeft: '5px solid #16a34a', fontSize: '14px', lineHeight: '1.5' }}>
                            ✅ <strong>Zero-Knowledge Safe!</strong> This password has not appeared in any known public database leaks.
                        </div>
                    )
                )}
            </div>
        </div>
    );
}