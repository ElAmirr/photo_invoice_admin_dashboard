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
    Hash,
    Laptop,
    Activity
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
                                <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: 600, color: 'var(--text-dim)' }}>PC STATUS</th>
                                <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: 600, color: 'var(--text-dim)' }}>CONNECTED HWID</th>
                                <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: 600, color: 'var(--text-dim)' }}>LAST SEEN</th>
                                <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: 600, color: 'var(--text-dim)' }}>EXPIRES AT</th>
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
                                        {(() => {
                                            if (!license.hwid) return <span style={{ color: 'var(--text-dim)', fontSize: '12px' }}>Inactive</span>;
                                            const isOnline = license.last_heartbeat && (new Date() - new Date(license.last_heartbeat)) < 5 * 60 * 1000;
                                            return (
                                                <span className="glass-pill" style={{
                                                    fontSize: '11px',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    color: isOnline ? '#00ff88' : 'var(--text-dim)',
                                                    borderColor: isOnline ? 'rgba(0, 255, 136, 0.2)' : 'var(--glass-border)',
                                                    textTransform: 'uppercase',
                                                    fontWeight: '700'
                                                }}>
                                                    <div style={{
                                                        width: '6px',
                                                        height: '6px',
                                                        borderRadius: '50%',
                                                        background: isOnline ? '#00ff88' : '#666',
                                                        boxShadow: isOnline ? '0 0 10px #00ff88' : 'none'
                                                    }} className={isOnline ? 'animate-pulse' : ''}></div>
                                                    {isOnline ? 'Online' : 'Offline'}
                                                </span>
                                            );
                                        })()}
                                    </td>
                                    <td style={{ padding: '16px 20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)', fontSize: '13px' }}>
                                            <Laptop size={14} />
                                            {license.hwid ? license.hwid.substring(0, 12) + '...' : '—'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--text-dim)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Activity size={14} />
                                            {license.last_heartbeat ? (() => {
                                                const diff = Math.floor((new Date() - new Date(license.last_heartbeat)) / 1000);
                                                if (diff < 60) return 'Just now';
                                                if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
                                                if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
                                                return new Date(license.last_heartbeat).toLocaleDateString();
                                            })() : 'Never'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 20px', fontSize: '13px' }}>
                                        {license.expires_at ? (
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                color: new Date() > new Date(license.expires_at) ? '#ff4b4b' : 'var(--text-dim)',
                                                fontWeight: new Date() > new Date(license.expires_at) ? '600' : 'normal'
                                            }}>
                                                {new Date() > new Date(license.expires_at) ? <ShieldAlert size={14} /> : <Calendar size={14} />}
                                                {new Date(license.expires_at).toLocaleDateString()}
                                            </div>
                                        ) : (
                                            <span style={{ color: 'var(--text-dim)', opacity: 0.7 }}>Lifetime</span>
                                        )}
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
