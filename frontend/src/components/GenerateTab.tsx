import React, { useState } from 'react';
import api from '../services/api';
import { toast } from 'sonner';
import { PlusCircle, Copy, CheckCircle2, Key } from 'lucide-react';

const GenerateTab: React.FC = () => {
    const [count, setCount] = useState<number>(1);
    const [generatedKeys, setGeneratedKeys] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await api.post('/generate', { count });
            setGeneratedKeys(response.data.keys);
            toast.success(`${response.data.keys.length} nouvelles clés générées !`);
        } catch (error: any) {
            toast.error('Erreur lors de la génération des clés');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (key: string) => {
        navigator.clipboard.writeText(key);
        setCopiedKey(key);
        toast.success('Clé copiée !');
        setTimeout(() => setCopiedKey(null), 2000);
    };

    const copyAll = () => {
        navigator.clipboard.writeText(generatedKeys.join('\n'));
        toast.success('Toutes les clés ont été copiées !');
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="card" style={{ marginBottom: '24px' }}>
                <h2 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <PlusCircle color="var(--primary)" />
                    Générer des clés de licence
                </h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '14px' }}>
                    Choisissez le nombre de clés à générer. Elles seront immédiatement ajoutées à la base de données.
                </p>

                <form onSubmit={handleGenerate} style={{ display: 'flex', gap: '12px' }}>
                    <input
                        type="number"
                        min="1"
                        max="100"
                        value={count}
                        onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                        style={{ width: '100px' }}
                    />
                    <button type="submit" disabled={loading} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        {loading ? 'Génération...' : (
                            <>
                                <Key size={18} />
                                Générer des clés
                            </>
                        )}
                    </button>
                </form>
            </div>

            {generatedKeys.length > 0 && (
                <div className="card" style={{
                    background: 'rgba(139, 92, 246, 0.05)',
                    borderStyle: 'dashed',
                    borderColor: 'var(--primary)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '16px' }}>Clés générées</h3>
                        <button
                            onClick={copyAll}
                            style={{ padding: '4px 12px', fontSize: '12px', background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)' }}
                        >
                            Tout copier
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {generatedKeys.map((key) => (
                            <div
                                key={key}
                                onClick={() => copyToClipboard(key)}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '12px 16px',
                                    background: 'var(--card-bg)',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-color)',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'var(--card-bg)'}
                            >
                                <code style={{ fontSize: '16px', color: 'var(--primary)' }}>{key}</code>
                                {copiedKey === key ? <CheckCircle2 size={16} color="var(--success)" /> : <Copy size={16} color="var(--text-muted)" />}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default GenerateTab;
