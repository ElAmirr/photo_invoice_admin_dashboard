import React, { useState } from 'react';
import GlassCard from '../components/GlassCard';
import PremiumButton from '../components/PremiumButton';
import api from '../api/api';
import {
    Key,
    Copy,
    Check,
    Zap,
    ArrowRight
} from 'lucide-react';

const Generator = () => {
    const [newKey, setNewKey] = useState('');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [durationDays, setDurationDays] = useState(null);

    const generateKey = async () => {
        setLoading(true);
        setCopied(false);
        try {
            const res = await api.post('/api/admin/generate-key', { durationDays });
            if (res.data && res.data.key) {
                setNewKey(res.data.key);
            }
        } catch (err) {
            console.error('API Error details:', err.response?.data || err.message);
            const errorMsg = err.response?.data?.message || err.message || 'Check your admin secret or backend status.';
            alert(`Failed to generate key: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(newKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: '700' }}>Key Generator</h1>
                <p style={{ color: 'var(--text-dim)' }}>Instantly generate fresh UUID license keys</p>
            </div>

            <GlassCard style={{ padding: '40px', textAlign: 'center' }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '20px',
                    background: 'rgba(212, 0, 212, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px',
                    color: 'var(--primary)',
                    border: '1px solid rgba(212, 0, 212, 0.2)'
                }}>
                    <Zap size={40} fill="currentColor" />
                </div>

                <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>Generate a New License</h2>
                <p style={{ color: 'var(--text-dim)', marginBottom: '32px', maxWidth: '400px', margin: '0 auto 32px' }}>
                    This will create a new unique license key in the system that can be assigned to a user or machine later.
                </p>

                <div style={{ marginBottom: '32px', textAlign: 'left', maxWidth: '320px', margin: '0 auto 32px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: 'var(--text-dim)' }}>
                        License Duration
                    </label>
                    <select
                        value={durationDays || ''}
                        onChange={(e) => setDurationDays(e.target.value ? parseInt(e.target.value) : null)}
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '12px',
                            color: '#fff',
                            outline: 'none',
                            cursor: 'pointer',
                            fontSize: '15px'
                        }}
                    >
                        <option value="" style={{ background: '#1a0b2e' }}>Lifetime (No expiration)</option>
                        <option value="30" style={{ background: '#1a0b2e' }}>1 Month (30 days)</option>
                        <option value="365" style={{ background: '#1a0b2e' }}>1 Year (365 days)</option>
                    </select>
                </div>

                {!newKey ? (
                    <PremiumButton
                        onClick={generateKey}
                        loading={loading}
                        icon={Key}
                        style={{ padding: '16px 40px', fontSize: '18px' }}
                    >
                        Generate Key
                    </PremiumButton>
                ) : (
                    <div className="animate-fade-in">
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid var(--primary)',
                            padding: '24px',
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '24px',
                            boxShadow: '0 0 20px rgba(212, 0, 212, 0.1)'
                        }}>
                            <code style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '1px', color: '#fff' }}>
                                {newKey}
                            </code>
                            <button
                                onClick={copyToClipboard}
                                style={{
                                    background: copied ? '#00ff88' : 'var(--primary)',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '12px',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    transition: 'var(--transition)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                {copied ? <Check size={20} /> : <Copy size={20} />}
                            </button>
                        </div>

                        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                            <button
                                onClick={() => setNewKey('')}
                                style={{
                                    background: 'transparent',
                                    color: 'var(--text-dim)',
                                    border: '1px solid var(--glass-border)',
                                    padding: '12px 24px',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    transition: 'var(--transition)'
                                }}
                            >
                                Clear Result
                            </button>
                            <PremiumButton icon={ArrowRight} onClick={generateKey} loading={loading}>
                                Generate Another
                            </PremiumButton>
                        </div>
                    </div>
                )}
            </GlassCard>
        </div>
    );
};

export default Generator;
