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

    // Customer Info State
    const [formData, setFormData] = useState({
        customerName: '',
        customerEmail: '',
        studioName: '',
        phone: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const generateKey = async () => {
        setLoading(true);
        setCopied(false);
        try {
            const res = await api.post('/api/admin/generate-key', {
                durationDays,
                ...formData
            });
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

    const inputStyle = {
        width: '100%',
        padding: '12px 16px',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid var(--glass-border)',
        borderRadius: '12px',
        color: '#fff',
        outline: 'none',
        fontSize: '15px'
    };

    const labelStyle = { display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: 'var(--text-dim)' };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: '700' }}>Key Generator</h1>
                <p style={{ color: 'var(--text-dim)' }}>Link keys to customers for a personalized experience</p>
            </div>

            <GlassCard style={{ padding: '40px', textAlign: 'center' }}>
                <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '16px',
                    background: 'rgba(212, 0, 212, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    color: 'var(--primary)',
                    border: '1px solid rgba(212, 0, 212, 0.2)'
                }}>
                    <Zap size={32} fill="currentColor" />
                </div>

                <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Create New License</h2>
                <p style={{ color: 'var(--text-dim)', marginBottom: '32px', maxWidth: '500px', margin: '0 auto 32px' }}>
                    Generate a unique key and link it to the customer profile.
                </p>

                {!newKey ? (
                    <div style={{ textAlign: 'left', maxWidth: '600px', margin: '0 auto' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                            <div>
                                <label style={labelStyle}>Full Name *</label>
                                <input style={inputStyle} name="customerName" placeholder="Ahmed Ben Ali" value={formData.customerName} onChange={handleInputChange} />
                            </div>
                            <div>
                                <label style={labelStyle}>Email Address</label>
                                <input style={inputStyle} name="customerEmail" placeholder="ahmed@example.com" value={formData.customerEmail} onChange={handleInputChange} />
                            </div>
                            <div>
                                <label style={labelStyle}>Studio Name</label>
                                <input style={inputStyle} name="studioName" placeholder="Studio Nova" value={formData.studioName} onChange={handleInputChange} />
                            </div>
                            <div>
                                <label style={labelStyle}>Phone Number</label>
                                <input style={inputStyle} name="phone" placeholder="+216 XX XXX XXX" value={formData.phone} onChange={handleInputChange} />
                            </div>
                        </div>

                        <div style={{ marginBottom: '40px' }}>
                            <label style={labelStyle}>License Plan / Duration</label>
                            <select
                                value={durationDays || ''}
                                onChange={(e) => setDurationDays(e.target.value ? parseInt(e.target.value) : null)}
                                style={inputStyle}
                            >
                                <option value="" style={{ background: '#1a0b2e' }}>Lifetime (Indéfinie)</option>
                                <option value="5" style={{ background: '#1a0b2e' }}>Trial (5 days)</option>
                                <option value="15" style={{ background: '#1a0b2e' }}>Pro Trial (15 days)</option>
                                <option value="30" style={{ background: '#1a0b2e' }}>Monthly (30 days)</option>
                                <option value="365" style={{ background: '#1a0b2e' }}>Yearly (365 days)</option>
                            </select>
                        </div>

                        <div style={{ textAlign: 'center' }}>
                            <PremiumButton
                                onClick={generateKey}
                                loading={loading}
                                icon={Key}
                                style={{ padding: '16px 48px', fontSize: '18px' }}
                                disabled={!formData.customerName}
                            >
                                Generate & Save License
                            </PremiumButton>
                        </div>
                    </div>
                ) : (
                    <div className="animate-fade-in">
                        <div style={{
                            background: 'rgba(0, 255, 136, 0.05)',
                            border: '1px solid rgba(0, 255, 136, 0.3)',
                            padding: '24px',
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '24px',
                        }}>
                            <div>
                                <p style={{ fontSize: '12px', color: '#00ff88', textTransform: 'uppercase', fontWeight: 800, marginBottom: '8px' }}>Generated License Key</p>
                                <code style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '1px', color: '#fff' }}>
                                    {newKey}
                                </code>
                            </div>
                            <button
                                onClick={copyToClipboard}
                                style={{
                                    background: copied ? '#00ff88' : 'var(--primary)',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '16px',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    transition: 'var(--transition)',
                                }}
                            >
                                {copied ? <Check size={24} /> : <Copy size={24} />}
                            </button>
                        </div>

                        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                            <button
                                onClick={() => {
                                    setNewKey('');
                                    setFormData({ customerName: '', customerEmail: '', studioName: '', phone: '' });
                                }}
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
                                New Entry
                            </button>
                        </div>
                    </div>
                )}
            </GlassCard>
        </div>
    );
};

export default Generator;
