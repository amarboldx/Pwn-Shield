import { useState } from 'react';
import CheckerForm from './features/pwned-checker/components/CheckerForm';
import CsvBulkChecker from './features/pwned-checker/components/CsvBulkChecker';

type Mode = 'SINGLE' | 'BULK';

export default function App() {
    const [mode, setMode] = useState<Mode>('SINGLE');

    return (
        <div style={{ 
            maxWidth: '540px', 
            margin: '40px auto', 
            padding: '0 16px', 
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            color: '#0f172a',
            boxSizing: 'border-box'
        }}>
            <header style={{ marginBottom: '32px', textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <h1 style={{ fontSize: '32px', fontWeight: '800', margin: '0', letterSpacing: '-0.5px', color: 'white' }}>
                        🛡️ PwnShield
                    </h1>
                </div>
                <span style={{ fontSize: '12px', letterSpacing: '1.5px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginTop: '4px' }}>
                    Zero-Knowledge Security Suite
                </span>

                {/* Modern Switcher Navigation */}
                <div style={{ 
                    display: 'inline-flex', 
                    background: '#f1f5f9', 
                    padding: '4px', 
                    borderRadius: '9999px', 
                    marginTop: '24px',
                    border: '1px solid #e2e8f0'
                }}>
                    <button 
                        onClick={() => setMode('SINGLE')} 
                        style={{ 
                            padding: '10px 20px', 
                            borderRadius: '9999px', 
                            border: 'none', 
                            background: mode === 'SINGLE' ? '#000000' : 'transparent', 
                            color: mode === 'SINGLE' ? '#ffffff' : '#475569', 
                            cursor: 'pointer', 
                            fontWeight: '700', 
                            fontSize: '13px',
                            transition: 'all 0.15s ease-in-out',
                            boxShadow: mode === 'SINGLE' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                        }}
                    >
                        Single Check
                    </button>
                    <button 
                        onClick={() => setMode('BULK')} 
                        style={{ 
                            padding: '10px 20px', 
                            borderRadius: '9999px', 
                            border: 'none', 
                            background: mode === 'BULK' ? '#000000' : 'transparent', 
                            color: mode === 'BULK' ? '#ffffff' : '#475569', 
                            cursor: 'pointer', 
                            fontWeight: '700', 
                            fontSize: '13px',
                            transition: 'all 0.15s ease-in-out',
                            boxShadow: mode === 'BULK' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                        }}
                    >
                        Bulk CSV Import
                    </button>
                </div>
            </header>

            <main style={{ width: '100%' }}>
                {mode === 'SINGLE' ? <CheckerForm /> : <CsvBulkChecker />}
            </main>
        </div>
    );
}