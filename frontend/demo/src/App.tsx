import CheckerForm from './features/pwned-checker/components/CheckerForm';

export default function App() {
    return (
        <div style={{ maxWidth: '450px', margin: '60px auto', padding: '0 16px', fontFamily: 'system-ui, sans-serif' }}>
            <header style={{ marginBottom: '32px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '28px', margin: '0 0 8px 0' }}>🛡️ PwnShield</h1>
                <span style={{ fontSize: '12px', textTransform: 'uppercase', color: '#888', fontWeight: 'bold' }}>
                    Zero-Knowledge Security Suite
                </span>
            </header>

            <main>
                {/* Our isolated Password Checker Module */}
                <CheckerForm />
            </main>
        </div>
    );
}