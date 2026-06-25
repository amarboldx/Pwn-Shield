import { useState, useEffect } from 'react';
import { useVault } from './context/VaultAuthContext';
import { VaultAuthGate } from './features/auth/component/VaultAuthGate';
import CheckerForm from './features/pwned-checker/components/CheckerForm';
import CsvBulkChecker from './features/pwned-checker/components/CsvBulkChecker';
import { VaultDashboard } from './features/vault/component/VaultDashboard';

type LoggedInTab = 'VAULT' | 'RADAR';
type RadarSubMode = 'SINGLE' | 'BULK';
type PublicAccessMode = 'FREE_RADAR' | 'VAULT_GATE';
type ThemeMode = 'light' | 'dark';

export default function App() {
    const { isAuthenticated, logout } = useVault();
    
    const [theme, setTheme] = useState<ThemeMode>(() => {
        const cached = localStorage.getItem('pg_theme');
        if (cached === 'light' || cached === 'dark') return cached;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('pg_theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    // Navigation states
    const [publicMode, setPublicMode] = useState<PublicAccessMode>('FREE_RADAR');
    const [activeTab, setActiveTab] = useState<LoggedInTab>('VAULT');
    const [radarMode, setRadarMode] = useState<RadarSubMode>('SINGLE');

    return (
        <div style={{ minHeight: '100vh', padding: '32px 16px', boxSizing: 'border-box' }}>
            <div style={{ maxWidth: isAuthenticated ? '720px' : '540px', margin: '0 auto', transition: 'max-width 0.3s ease' }}>
                
                <header style={{ 
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                    borderBottom: '1px solid var(--pg-slate-200)', paddingBottom: '16px', marginBottom: '32px'
                }}>
                    <div>
                        <h1 style={{ fontSize: 'var(--font-display)', fontWeight: 800, margin: '0', letterSpacing: '-0.5px', color: 'var(--pg-brand-black)' }}>
                            🛡️ PwnShield
                        </h1>
                        <span style={{ fontSize: '10px', letterSpacing: '1px', color: 'var(--pg-slate-500)', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>
                            {isAuthenticated ? 'Zero-Knowledge Security Suite' : 'Public k-Anonymity Radar'}
                        </span>
                    </div>


                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        
                        {/* 1. THE THEME TOGGLE BUTTON */}
                        <button
                            onClick={toggleTheme}
                            title={`Switch to ${theme === 'light' ? 'Obsidian Dark' : 'Pristine Light'} Mode`}
                            style={{
                                width: '32px', height: '32px', borderRadius: '10px', border: '1px solid var(--pg-slate-200)',
                                background: 'var(--pg-brand-white)', color: 'var(--pg-slate-900)', fontSize: '14px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
                            }}
                        >
                            {theme === 'light' ? '🌙' : '☀️'}
                        </button>

                        {!isAuthenticated ? (
                            <div style={{ display: 'flex', background: 'var(--pg-slate-100)', borderRadius: '9999px', padding: '4px', border: '1px solid var(--pg-slate-200)' }}>
                                <button 
                                    onClick={() => setPublicMode('FREE_RADAR')}
                                    style={{
                                        padding: '8px 14px', borderRadius: '9999px', border: 'none', fontWeight: 700, fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s ease',
                                        background: publicMode === 'FREE_RADAR' ? 'var(--pg-brand-black)' : 'transparent',
                                        color: publicMode === 'FREE_RADAR' ? 'var(--pg-brand-white)' : 'var(--pg-slate-500)'
                                    }}
                                >
                                    🛡️ Free Radar
                                </button>
                                <button 
                                    onClick={() => setPublicMode('VAULT_GATE')}
                                    style={{
                                        padding: '8px 14px', borderRadius: '9999px', border: 'none', fontWeight: 700, fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s ease',
                                        background: publicMode === 'VAULT_GATE' ? 'var(--pg-brand-black)' : 'transparent',
                                        color: publicMode === 'VAULT_GATE' ? 'var(--pg-brand-white)' : 'var(--pg-slate-500)'
                                    }}
                                >
                                    🔐 Open Vault
                                </button>
                            </div>
                        ) : (
                            <>
                                <div style={{ display: 'flex', background: 'var(--pg-slate-100)', borderRadius: '10px', padding: '3px', border: '1px solid var(--pg-slate-200)' }}>
                                    <button 
                                        onClick={() => setActiveTab('VAULT')}
                                        style={{
                                            padding: '6px 12px', borderRadius: '8px', border: 'none', fontWeight: 700, fontSize: '12px', cursor: 'pointer',
                                            background: activeTab === 'VAULT' ? 'var(--pg-brand-black)' : 'transparent',
                                            color: activeTab === 'VAULT' ? 'var(--pg-brand-white)' : 'var(--pg-slate-500)'
                                        }}
                                    >
                                        🔐 Vault
                                    </button>
                                    <button 
                                        onClick={() => setActiveTab('RADAR')}
                                        style={{
                                            padding: '6px 12px', borderRadius: '8px', border: 'none', fontWeight: 700, fontSize: '12px', cursor: 'pointer',
                                            background: activeTab === 'RADAR' ? 'var(--pg-brand-black)' : 'transparent',
                                            color: activeTab === 'RADAR' ? 'var(--pg-brand-white)' : 'var(--pg-slate-500)'
                                        }}
                                    >
                                        🛡️ Breach Radar
                                    </button>
                                </div>

                                <button 
                                    onClick={logout}
                                    style={{
                                        background: 'var(--pg-danger-bg)', color: 'var(--pg-danger-text)', border: '1px solid var(--pg-danger-border)', borderRadius: '8px',
                                        padding: '6px 12px', fontSize: '11px', fontWeight: 700, cursor: 'pointer'
                                    }}
                                >
                                    Lock Safe
                                </button>
                            </>
                        )}
                    </div>
                </header>

                {/* VIEWPORT ROUTER */}
                <main>
                    {!isAuthenticated ? (
                        publicMode === 'FREE_RADAR' ? (
                            <div style={{ background: 'var(--pg-brand-white)', borderRadius: '16px', border: '1px solid var(--pg-slate-200)', boxShadow: 'var(--pg-shadow-card)', padding: '28px' }}>
                                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                    <h2 style={{ fontSize: 'var(--font-h1)', margin: '0 0 4px 0', color: 'var(--pg-slate-900)' }}>Public k-Anonymity Engine</h2>
                                    <p style={{ fontSize: 'var(--font-micro)', color: 'var(--pg-slate-500)', margin: 0 }}>Cross-reference local SHA-1 prefix ranges instantly</p>
                                    
                                    <div style={{ display: 'inline-flex', background: 'var(--pg-slate-100)', padding: '3px', borderRadius: '9999px', marginTop: '16px' }}>
                                        <button onClick={() => setRadarMode('SINGLE')} style={{ padding: '6px 14px', borderRadius: '9999px', border: 'none', background: radarMode === 'SINGLE' ? 'var(--pg-brand-black)' : 'transparent', color: radarMode === 'SINGLE' ? 'var(--pg-brand-white)' : 'var(--pg-slate-500)', cursor: 'pointer', fontWeight: 700, fontSize: '11px' }}>
                                            Single Check
                                        </button>
                                        <button onClick={() => setRadarMode('BULK')} style={{ padding: '6px 14px', borderRadius: '9999px', border: 'none', background: radarMode === 'BULK' ? 'var(--pg-brand-black)' : 'transparent', color: radarMode === 'BULK' ? 'var(--pg-brand-white)' : 'var(--pg-slate-500)', cursor: 'pointer', fontWeight: 700, fontSize: '11px' }}>
                                            Bulk CSV Import
                                        </button>
                                    </div>
                                </div>
                                {radarMode === 'SINGLE' ? <CheckerForm /> : <CsvBulkChecker />}
                            </div>
                        ) : (
                            <VaultAuthGate />
                        )
                    ) : (
                        activeTab === 'VAULT' ? (
                            <VaultDashboard />
                        ) : (
                            <div style={{ background: 'var(--pg-brand-white)', borderRadius: '16px', border: '1px solid var(--pg-slate-200)', boxShadow: 'var(--pg-shadow-card)', padding: '28px' }}>
                                {radarMode === 'SINGLE' ? <CheckerForm /> : <CsvBulkChecker />}
                            </div>
                        )
                    )}
                </main>

            </div>
        </div>
    );
}