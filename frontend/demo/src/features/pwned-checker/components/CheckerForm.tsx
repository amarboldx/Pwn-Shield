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
        <div style={{ padding: '24px', background: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <p style={{ color: '#666', fontSize: '14px', marginTop: 0 }}>
                Test if a password has been leaked. Your actual password never leaves your browser.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input
                    type="password"
                    placeholder="Enter password to check..."
                    value={inputPassword}
                    onChange={(e) => setInputPassword(e.target.value)}
                    style={{ padding: '12px', fontSize: '16px', borderRadius: '6px', border: '1px solid #ccc' }}
                />
                <button
                    type="submit"
                    disabled={loading || !inputPassword}
                    style={{ padding: '12px', fontSize: '16px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                >
                    {loading ? 'Analyzing...' : 'Check Security'}
                </button>
            </form>

            <div style={{ marginTop: '24px' }}>
                {error && <div style={{ color: '#ff3333', padding: '12px', background: '#ffe6e6', borderRadius: '6px' }}>❌ {error}</div>}
                
                {breachCount !== null && !error && (
                    breachCount > 0 ? (
                        <div style={{ color: '#cc0000', padding: '16px', background: '#fff0f0', borderRadius: '6px', borderLeft: '4px solid #cc0000' }}>
                            ⚠️ <strong>Compromised!</strong> This password was found in <strong>{breachCount.toLocaleString()}</strong> data breaches. Do not use it!
                        </div>
                    ) : (
                        <div style={{ color: '#006600', padding: '16px', background: '#f0fbf0', borderRadius: '6px', borderLeft: '4px solid #006600' }}>
                            ✅ <strong>Secure!</strong> This password has not appeared in any known public data leaks.
                        </div>
                    )
                )}
            </div>
        </div>
    );
}