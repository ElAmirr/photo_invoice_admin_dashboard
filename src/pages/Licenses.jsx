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
                                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Customer & Studio</th>
                                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>License Details</th>
                                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>PC Status & Info</th>
                                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Timeline</th>
                                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-dim)' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                                            <RefreshCw size={32} className="animate-spin" style={{ color: 'var(--primary)', opacity: 0.5 }} />
                                            <span>Loading license data...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredLicenses.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-dim)' }}>No licenses found.</td>
                                </tr>
                            ) : filteredLicenses.map((license) => (
                                <tr key={license.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'var(--transition)', verticalAlign: 'top' }}>
                                    <td style={{ padding: '24px 20px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            <span style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>
                                                {license.studio_name || license.customer_name || 'Individual Customer'}
                                            </span>
                                            {license.studio_name && license.customer_name && (
                                                <span style={{ fontSize: '13px', color: 'var(--text-dim)' }}>{license.customer_name}</span>
                                            )}
                                            {license.phone && (
                                                <div style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                                                    <Activity size={12} /> {license.phone}
                                                </div>
                                            )}
                                            {license.customer_email && (
                                                <div style={{ fontSize: '12px', color: 'var(--text-dim)', opacity: 0.7 }}>{license.customer_email}</div>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ padding: '24px 20px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Hash size={14} color="var(--primary)" />
                                                <code style={{ fontSize: '13px', color: '#fff', background: 'rgba(255, 255, 255, 0.05)', padding: '2px 8px', borderRadius: '4px' }}>{license.key}</code>
                                            </div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Calendar size={12} /> Created: {new Date(license.created_at).toLocaleDateString()}
                                            </div>
                                            <div style={{
                                                fontSize: '11px',
                                                padding: '4px 10px',
                                                borderRadius: '20px',
                                                background: license.expires_at ? 'rgba(212, 0, 212, 0.1)' : 'rgba(0, 255, 136, 0.1)',
                                                color: license.expires_at ? 'var(--primary)' : '#00ff88',
                                                display: 'inline-flex',
                                                width: 'fit-content',
                                                fontWeight: 800,
                                                textTransform: 'uppercase'
                                            }}>
                                                {license.expires_at ? 'Subscription' : 'Lifetime Access'}
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '24px 20px' }}>
                                        {(() => {
                                            if (!license.hwid) return <span style={{ color: 'var(--text-dim)', fontSize: '12px', opacity: 0.5 }}>Waiting for activation...</span>;
                                            const isOnline = license.last_heartbeat && (new Date() - new Date(license.last_heartbeat)) < 24 * 60 * 60 * 1000;
                                            return (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <div style={{
                                                            width: '8px',
                                                            height: '8px',
                                                            borderRadius: '50%',
                                                            background: isOnline ? '#00ff88' : '#666',
                                                            boxShadow: isOnline ? '0 0 10px #00ff88' : 'none'
                                                        }} className={isOnline ? 'animate-pulse' : ''}></div>
                                                        <span style={{ fontSize: '12px', fontWeight: 800, color: isOnline ? '#00ff88' : 'var(--text-dim)', textTransform: 'uppercase' }}>
                                                            {isOnline ? 'Online Now' : 'Offline'}
                                                        </span>
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: 'rgba(255, 255, 255, 0.03)', padding: '8px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                                                        {license.os_info ? (
                                                            <div style={{ fontSize: '11px', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                <Laptop size={12} color="var(--primary)" /> {license.os_info}
                                                            </div>
                                                        ) : (
                                                            <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>OS: Unknown</div>
                                                        )}
                                                        {license.app_version ? (
                                                            <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 700 }}>
                                                                Build version: {license.app_version}
                                                            </div>
                                                        ) : (
                                                            <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Version: Unknown</div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </td>
                                    <td style={{ padding: '24px 20px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <div style={{ fontSize: '12px' }}>
                                                <span style={{ color: 'var(--text-dim)', display: 'block', marginBottom: '4px', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}>First Activation</span>
                                                <div style={{ color: '#fff' }}>{license.activated_at ? new Date(license.activated_at).toLocaleString() : '—'}</div>
                                            </div>
                                            <div style={{ fontSize: '12px' }}>
                                                <span style={{ color: 'var(--text-dim)', display: 'block', marginBottom: '4px', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}>Last Seen</span>
                                                <div style={{ color: '#fff' }}>{license.last_heartbeat ? new Date(license.last_heartbeat).toLocaleString() : '—'}</div>
                                            </div>
                                            <div style={{ fontSize: '12px' }}>
                                                <span style={{ color: 'var(--text-dim)', display: 'block', marginBottom: '4px', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}>Expiry Date</span>
                                                <div style={{ color: license.expires_at && new Date() > new Date(license.expires_at) ? '#ff4b4b' : '#fff', fontWeight: license.expires_at ? '700' : 'normal' }}>
                                                    {license.expires_at ? new Date(license.expires_at).toLocaleDateString() : 'Indefinite (Lifetime)'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '24px 20px', textAlign: 'right' }}>
                                        <button
                                            title="Delete License Permanently"
                                            onClick={() => handleDelete(license.id)}
                                            disabled={actionLoading === `delete-${license.id}`}
                                            style={{
                                                background: 'rgba(255, 75, 75, 0.1)',
                                                border: '1px solid rgba(255, 75, 75, 0.2)',
                                                padding: '12px',
                                                borderRadius: '12px',
                                                color: '#ff4b4b',
                                                cursor: 'pointer',
                                                transition: 'var(--transition)'
                                            }}
                                        >
                                            <Trash2 size={20} />
                                        </button>
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
