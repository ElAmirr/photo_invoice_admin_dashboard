import React, { useState, useEffect } from 'react';
import GlassCard from '../components/GlassCard';
import PremiumButton from '../components/PremiumButton';
import api from '../api/api';
import {
    Search,
    RefreshCw,
    Trash2,
    ExternalLink,
    ShieldAlert,
    Calendar,
    Hash
} from 'lucide-react';

const Licenses = () => {
    const [licenses, setLicenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [actionLoading, setActionLoading] = useState(null);

    const fetchLicenses = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/admin/licenses');
            setLicenses(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error('Fetch error:', err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLicenses();
    }, []);

    const handleResetHwid = async (key) => {
        if (!window.confirm(`Are you sure you want to reset HWID for key: ${key}?`)) return;
        setActionLoading(`reset-${key}`);
        try {
            await api.post('/api/admin/reset-hwid', { key });
            fetchLicenses();
            alert('HWID Reset successfully');
        } catch (err) {
            console.error('Reset HWID error:', err.response?.data || err.message);
            const errorMsg = err.response?.data?.message || err.message || 'Check your admin secret.';
            alert(`Failed to reset HWID: ${errorMsg}`);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this license?')) return;
        setActionLoading(`delete-${id}`);
        try {
            await api.delete(`/api/admin/license/${id}`);
            fetchLicenses();
        } catch (err) {
            console.error('Delete error:', err.response?.data || err.message);
            const errorMsg = err.response?.data?.message || err.message || 'Check your admin secret.';
            alert(`Failed to delete license: ${errorMsg}`);
        } finally {
            setActionLoading(null);
        }
    };

    const filteredLicenses = licenses.filter(l =>
        l.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (l.hwid && l.hwid.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: '700' }}>Manage Licenses</h1>
                    <p style={{ color: 'var(--text-dim)' }}>Search, reset, or delete license keys</p>
                </div>
                <PremiumButton icon={RefreshCw} onClick={fetchLicenses} loading={loading}>Refresh</PremiumButton>
            </div>

            <GlassCard style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)', display: 'flex', gap: '16px' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                        <input
                            type="text"
                            placeholder="Search by Key or HWID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 16px 12px 48px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '12px',
                                color: '#fff',
                                outline: 'none',
                                transition: 'var(--transition)'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--glass-border)'}
                        />
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--glass-border)' }}>
                                <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: 600, color: 'var(--text-dim)' }}>LICENSE KEY</th>
                                <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: 600, color: 'var(--text-dim)' }}>STATUS / HWID</th>
                                <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: 600, color: 'var(--text-dim)' }}>ACTIVATED AT</th>
                                <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: 600, color: 'var(--text-dim)' }}>CREATED AT</th>
                                <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: 600, color: 'var(--text-dim)', textAlign: 'right' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>Loading licenses...</td>
                                </tr>
                            ) : filteredLicenses.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>No licenses found matching your search.</td>
                                </tr>
                            ) : filteredLicenses.map((license) => (
                                <tr key={license.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'var(--transition)' }}>
                                    <td style={{ padding: '16px 20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <Hash size={16} color="var(--primary)" />
                                            <code style={{ fontSize: '14px', background: 'rgba(212, 0, 212, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>{license.key}</code>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 20px' }}>
                                        {license.hwid ? (
                                            <span className="glass-pill" style={{ fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#00ff88', borderColor: 'rgba(0, 255, 136, 0.2)' }}>
                                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00ff88' }}></div>
                                                {license.hwid.substring(0, 12)}...
                                            </span>
                                        ) : (
                                            <span className="glass-pill" style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Available</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--text-dim)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Calendar size={14} />
                                            {license.activated_at ? new Date(license.activated_at).toLocaleDateString() : '—'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--text-dim)' }}>
                                        {license.created_at ? new Date(license.created_at).toLocaleDateString() : '—'}
                                    </td>
                                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                            <button
                                                title="Reset HWID"
                                                onClick={() => handleResetHwid(license.key)}
                                                disabled={!license.hwid || actionLoading === `reset-${license.key}`}
                                                style={{
                                                    background: 'rgba(255, 255, 255, 0.05)',
                                                    border: '1px solid var(--glass-border)',
                                                    padding: '8px',
                                                    borderRadius: '8px',
                                                    color: license.hwid ? '#fff' : 'rgba(255, 255, 255, 0.1)',
                                                    cursor: license.hwid ? 'pointer' : 'not-allowed',
                                                    transition: 'var(--transition)'
                                                }}
                                            >
                                                <RefreshCw size={16} className={actionLoading === `reset-${license.key}` ? 'animate-spin' : ''} />
                                            </button>
                                            <button
                                                title="Delete License"
                                                onClick={() => handleDelete(license.id)}
                                                disabled={actionLoading === `delete-${license.id}`}
                                                style={{
                                                    background: 'rgba(255, 75, 75, 0.1)',
                                                    border: '1px solid rgba(255, 75, 75, 0.2)',
                                                    padding: '8px',
                                                    borderRadius: '8px',
                                                    color: '#ff4b4b',
                                                    cursor: 'pointer',
                                                    transition: 'var(--transition)'
                                                }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
        </div>
    );
};

export default Licenses;
