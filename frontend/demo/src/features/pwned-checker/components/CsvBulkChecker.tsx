import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { processBulkCheck, ParsedCredential, getCleanDomain } from '../utils/bulkChecker';

type Step = 'UPLOAD' | 'MAPPER' | 'PROCESSING' | 'RESULTS';

export default function CsvBulkChecker() {
    const [step, setStep] = useState<Step>('UPLOAD');
    const [rawRows, setRawRows] = useState<string[][]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [hasHeaders, setHasHeaders] = useState(true);
    
    // Column Mapping Indices (-1 means unmapped)
    const [websiteCol, setWebsiteCol] = useState(-1);
    const [usernameCol, setUsernameCol] = useState(-1);
    const [emailCol, setEmailCol] = useState(-1);
    const [passwordCol, setPasswordCol] = useState(-1);

    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [results, setResults] = useState<ParsedCredential[]>([]);
    const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

    const tableScrollRef = useRef<HTMLDivElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        Papa.parse<string[]>(file, {
            header: false, 
            skipEmptyLines: true,
            complete: (results) => {
                const data = results.data;
                if (data.length === 0) return;
                
                setRawRows(data);
                const firstRow = data[0];
                setHeaders(firstRow);
                
                // Heuristic Smart Guesses
                firstRow.forEach((h, index) => {
                    const low = h.toLowerCase();
                    if (low.includes('url') || low.includes('site') || low.includes('web')) setWebsiteCol(index);
                    if (low.includes('user') || low.includes('login')) setUsernameCol(index);
                    if (low.includes('email') || low.includes('mail')) setEmailCol(index);
                    if (low.includes('pass') || low.includes('pwd') || low.includes('secret')) setPasswordCol(index);
                });

                setStep('MAPPER');
            }
        });
    };

    const handleRunAnalysis = async () => {
        if (passwordCol === -1) {
            alert('You must select which column contains the Passwords.');
            return;
        }

        setStep('PROCESSING');
        const dataRows = hasHeaders ? rawRows.slice(1) : rawRows;

        const normalizedData: ParsedCredential[] = dataRows.map((row, i) => ({
            id: `row-${i}`,
            website: websiteCol !== -1 ? row[websiteCol] : undefined,
            username: usernameCol !== -1 ? row[usernameCol] : undefined,
            email: emailCol !== -1 ? row[emailCol] : undefined,
            password: row[passwordCol] || ''
        })).filter(item => item.password.trim() !== '');

        const analyzed = await processBulkCheck(normalizedData, (current, total) => {
            setProgress({ current, total });
        });

        setResults(analyzed);
        setStep('RESULTS');
    };

    const togglePasswordVisibility = (id: string) => {
        setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // Programmatic Glide Scroll (glides by 75% of visible wrapper width)
    const scrollTable = (direction: 'left' | 'right') => {
        if (tableScrollRef.current) {
            const { scrollLeft, clientWidth } = tableScrollRef.current;
            const scrollAmount = clientWidth * 0.75;
            tableScrollRef.current.scrollTo({
                left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    // Dynamic Header Labeling (Replaces raw text with "Column X" if hasHeaders is unchecked)
    const displayHeaders = hasHeaders 
        ? headers 
        : headers.map((_, idx) => `Column ${idx + 1}`);

    return (
        <div style={{ 
            background: '#ffffff', 
            padding: '28px', 
            borderRadius: '16px', 
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
            boxSizing: 'border-box',
            width: '100%'
        }}>
            {/* STEP 1: UPLOAD */}
            {step === 'UPLOAD' && (
                <div style={{ textAlign: 'center', padding: '40px 20px', border: '2px dashed #cbd5e1', borderRadius: '12px', background: '#f8fafc' }}>
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>📁</div>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>Import Encrypted CSV Vault</h3>
                    <p style={{ margin: '0 0 20px 0', color: '#64748b', fontSize: '13px', maxWidth: '320px', marginLeft: 'auto', marginRight: 'auto' }}>
                        Supports uncompressed exports from ProtonPass, Bitwarden, 1Password, or Chrome.
                    </p>
                    <label style={{
                        background: '#000000',
                        color: '#ffffff',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'inline-block',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}>
                        Select File
                        <input type="file" accept=".csv" onChange={handleFileUpload} style={{ display: 'none' }} />
                    </label>
                </div>
            )}

            {/* STEP 2: MAPPER MATRIX WITH UNBOUNDED MULTI-COLUMNS */}
            {step === 'MAPPER' && (
                <div style={{ width: '100%', boxSizing: 'border-box' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>🗺️ Map Data Columns</h3>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600', color: '#475569', cursor: 'pointer', userSelect: 'none' }}>
                            <input type="checkbox" checked={hasHeaders} onChange={(e) => setHasHeaders(e.target.checked)} style={{ accentColor: '#000' }} />
                            Row 1 contains headers
                        </label>
                    </div>

                    {/* 4-way Selector Grid (Dynamically uses displayHeaders) */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '24px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <div>
                            <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '6px', color: '#334155' }}>🌐 Website Column:</label>
                            <select value={websiteCol} onChange={(e) => setWebsiteCol(Number(e.target.value))} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '13px', fontWeight: '500', color: '#0f172a' }}>
                                <option value={-1}>-- Skip --</option>
                                {displayHeaders.map((h, i) => <option key={i} value={i}>Col {i + 1}: {h}</option>)}
                            </select>
                        </div>

                        <div>
                            <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '6px', color: '#334155' }}>👤 Username Column:</label>
                            <select value={usernameCol} onChange={(e) => setUsernameCol(Number(e.target.value))} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '13px', fontWeight: '500', color: '#0f172a' }}>
                                <option value={-1}>-- Skip --</option>
                                {displayHeaders.map((h, i) => <option key={i} value={i}>Col {i + 1}: {h}</option>)}
                            </select>
                        </div>

                        <div>
                            <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '6px', color: '#334155' }}>✉️ Email Column:</label>
                            <select value={emailCol} onChange={(e) => setEmailCol(Number(e.target.value))} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '13px', fontWeight: '500', color: '#0f172a' }}>
                                <option value={-1}>-- Skip --</option>
                                {displayHeaders.map((h, i) => <option key={i} value={i}>Col {i + 1}: {h}</option>)}
                            </select>
                        </div>

                        <div>
                            <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '6px', color: '#b91c1c' }}>🔑 Password (Required):</label>
                            <select value={passwordCol} onChange={(e) => setPasswordCol(Number(e.target.value))} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: passwordCol === -1 ? '2px solid #ef4444' : '1px solid #cbd5e1', background: '#fff', fontSize: '13px', fontWeight: '500', color: '#0f172a' }}>
                                <option value={-1}>-- Choose --</option>
                                {displayHeaders.map((h, i) => <option key={i} value={i}>Col {i + 1}: {h}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Unbounded Multi-Column Preview Table */}
                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden', marginBottom: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                        <div style={{ background: '#f1f5f9', padding: '10px 12px', fontSize: '12px', fontWeight: '700', color: '#475569', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>Data Shard Preview (First 4 entries)</span>
                            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'normal' }}>↔ Showing all {displayHeaders.length} columns</span>
                        </div>
                        
                        {/* Scrollable Viewport inside fixed card wrapper */}
                        <div 
                            ref={tableScrollRef}
                            style={{ 
                                overflowX: 'auto', 
                                width: '100%',
                                overflowY: 'scroll',
                                WebkitOverflowScrolling: 'touch'
                            }}
                        >
                            <table style={{ borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ background: '#f8fafc', color: '#334155', borderBottom: '1px solid #e2e8f0' }}>
                                        {/* Dynamically maps 100% of the columns discovered in the CSV */}
                                        {displayHeaders.map((h, idx) => (
                                            <th 
                                                key={idx} 
                                                title={h} 
                                                style={{ 
                                                    padding: '10px 14px', 
                                                    fontWeight: '600', 
                                                    minWidth: '140px', // Forces every column to stay wide and legible
                                                    maxWidth: '240px', 
                                                    whiteSpace: 'nowrap', 
                                                    overflow: 'hidden', 
                                                    textOverflow: 'ellipsis',
                                                    borderRight: idx < displayHeaders.length - 1 ? '1px solid #e2e8f0' : 'none'
                                                }}
                                            >
                                                {h} {idx === websiteCol && '🌐'} {idx === usernameCol && '👤'} {idx === emailCol && '✉️'} {idx === passwordCol && '🔑'}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {rawRows.slice(hasHeaders ? 1 : 0, hasHeaders ? 5 : 4).map((row, rIdx) => (
                                        <tr key={rIdx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            {/* Mathematically matches the row length to the header length */}
                                            {displayHeaders.map((_, cIdx) => {
                                                const cellValue = row[cIdx] || '';
                                                return (
                                                    <td 
                                                        key={cIdx} 
                                                        title={cIdx === passwordCol ? 'Hidden Password' : cellValue} 
                                                        style={{ 
                                                            padding: '10px 14px', 
                                                            minWidth: '140px', 
                                                            maxWidth: '240px', 
                                                            whiteSpace: 'nowrap', 
                                                            overflow: 'hidden', 
                                                            textOverflow: 'ellipsis', 
                                                            color: cIdx === passwordCol ? '#94a3b8' : '#0f172a', 
                                                            fontFamily: cIdx === passwordCol ? 'monospace' : 'inherit',
                                                            borderRight: cIdx < displayHeaders.length - 1 ? '1px solid #f1f5f9' : 'none'
                                                        }}
                                                    >
                                                        {cIdx === passwordCol ? '••••••••' : cellValue}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Dedicated Bottom Scroll Bar */}
                        <div style={{ 
                            background: '#f8fafc', 
                            padding: '8px 12px', 
                            borderTop: '1px solid #e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '8px'
                        }}>
                            <button 
                                type="button"
                                onClick={() => scrollTable('left')}
                                style={{
                                    background: '#ffffff',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '6px',
                                    padding: '6px 12px',
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    color: '#0f172a',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                    userSelect: 'none'
                                }}
                            >
                                ◀ SCROLL LEFT
                            </button>

                            <span style={{ fontSize: '11px', color: '#64748b', userSelect: 'none' }}>
                                ↔ Columns 1 to {displayHeaders.length}
                            </span>

                            <button 
                                type="button"
                                onClick={() => scrollTable('right')}
                                style={{
                                    background: '#ffffff',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '6px',
                                    padding: '6px 12px',
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    color: '#0f172a',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                    userSelect: 'none'
                                }}
                            >
                                SCROLL RIGHT ▶
                            </button>
                        </div>
                    </div>

                    <button onClick={handleRunAnalysis} style={{ width: '100%', padding: '14px', background: '#000000', color: '#ffffff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '15px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                        Execute Secure Bulk Analysis
                    </button>
                </div>
            )}

            {/* STEP 3: LOADING BAR */}
            {step === 'PROCESSING' && (
                <div style={{ textAlign: 'center', padding: '36px 16px' }}>
                    <h3 style={{ color: '#0f172a', margin: '0 0 8px 0', fontSize: '18px' }}>🔒 Processing Cryptographic Batches...</h3>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 24px 0' }}>Querying anonymized hash prefixes safely against server proxy.</p>
                    <div style={{ background: '#f1f5f9', height: '12px', borderRadius: '9999px', overflow: 'hidden', margin: '0 auto 16px auto', border: '1px solid #cbd5e1' }}>
                        <div style={{ background: '#000000', height: '100%', width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%`, transition: 'width 0.2s ease-out' }}></div>
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>{progress.current} of {progress.total} Unique Shards Analyzed</span>
                </div>
            )}

            {/* STEP 4: RESULTS (Maintained Pristine Black Styling) */}
            {step === 'RESULTS' && (
                <div style={{ width: '100%', boxSizing: 'border-box' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '20px' }}>
                        <div>
                            <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>⚠️ Compromised Shards</h3>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>Found {results.filter(r => r.isLeaked).length} vulnerabilities</span>
                        </div>
                        <button onClick={() => setStep('UPLOAD')} style={{ background: '#000000', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>
                            Start Over
                        </button>
                    </div>

                    {results.filter(r => r.isLeaked).length === 0 ? (
                        <div style={{ color: '#166534', padding: '24px', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0', textAlign: 'center', fontSize: '14px', fontWeight: '500' }}>
                            🎉 <strong>Perfect Health!</strong> Zero imported secrets matched known data breaches.
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '460px', overflowY: 'auto', paddingRight: '4px' }}>
                            {results.filter(r => r.isLeaked).map((item) => {
                                const isPasswordOnly = !item.website && !item.username && !item.email;
                                const displayUser = item.username || item.email || 'No username / email';
                                const show = visiblePasswords[item.id] || false;
                                
                                return (
                                    <div key={item.id} style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'space-between', 
                                        padding: '14px', 
                                        border: '1px solid #fecaca', 
                                        background: '#fff5f5', 
                                        borderRadius: '12px',
                                        gap: '12px'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                                            {!isPasswordOnly ? (
                                                <>
                                                    <img 
                                                        src={`https://icons.duckduckgo.com/ip3/${getCleanDomain(item.website)}.ico`} 
                                                        onError={(e) => { e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/></svg>'; }}
                                                        style={{ width: 26, height: 26, borderRadius: '6px', flexShrink: 0, background: '#fff', border: '1px solid #e2e8f0' }} 
                                                        alt="Site Icon"
                                                    />
                                                    <div style={{ minWidth: 0, flex: 1 }}>
                                                        <div title={item.website} style={{ fontWeight: '700', fontSize: '14px', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                            {item.website || 'Unknown Entity'}
                                                        </div>
                                                        <div title={displayUser} style={{ color: '#64748b', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                            {displayUser}
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <span style={{ fontSize: '14px', fontWeight: '700', color: '#991b1b' }}>⚠️ Raw Compromised Password</span>
                                            )}
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                                            <code style={{ 
                                                background: '#e2e8f0', 
                                                color: '#000000', 
                                                padding: '6px 10px', 
                                                borderRadius: '6px', 
                                                fontSize: '13px',
                                                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                                                fontWeight: '600',
                                                minWidth: '110px',
                                                textAlign: 'center',
                                                display: 'inline-block'
                                            }}>
                                                {show ? item.password : '••••••••••••'}
                                            </code>
                                            
                                            <button 
                                                onClick={() => togglePasswordVisibility(item.id)} 
                                                style={{ 
                                                    background: '#000000', 
                                                    color: '#ffffff',      
                                                    border: 'none', 
                                                    borderRadius: '6px', 
                                                    padding: '6px 10px', 
                                                    cursor: 'pointer', 
                                                    fontSize: '11px',
                                                    fontWeight: '700',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    userSelect: 'none'
                                                }}
                                            >
                                                {show ? 'HIDE 👁️' : 'SHOW 👁️'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}