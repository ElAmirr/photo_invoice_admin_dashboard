import React, { useState, useEffect } from 'react';
import GlassCard from '../components/GlassCard';
import PremiumButton from '../components/PremiumButton';
import api from '../api/api';
import {
    Search,
    RefreshCw,
    Calendar,
    Laptop,
    Activity,
    UserCheck
} from 'lucide-react';

const Trials = () => {
    const [trials, setTrials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchTrials = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/admin/trials');
            setTrials(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error('Fetch trials error:', err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrials();
    }, []);

    const filteredTrials = trials.filter(t =>
        t.hwid && t.hwid.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: '700' }}>Free Trials</h1>
                    <p style={{ color: 'var(--text-dim)' }}>Monitor machines currently on the 5-day trial</p>
                </div>
                <PremiumButton icon={RefreshCw} onClick={fetchTrials} loading={loading}>Refresh</PremiumButton>
            </div>

            <GlassCard style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)', display: 'flex', gap: '16px' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                        <input
                            type="text"
                            placeholder="Search by HWID..."
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
                                <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: 600, color: 'var(--text-dim)' }}>PC STATUS</th>
                                <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: 600, color: 'var(--text-dim)' }}>CONNECTED HWID</th>
                                <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: 600, color: 'var(--text-dim)' }}>START DATE</th>
                                <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: 600, color: 'var(--text-dim)' }}>LAST SEEN</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>Loading trials...</td>
                                </tr>
                            ) : filteredTrials.length === 0 ? (
                                <tr>
                                    <td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>No active trials found.</td>
                                </tr>
                            ) : filteredTrials.map((trial) => (
                                <tr key={trial.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'var(--transition)' }}>
                                    <td style={{ padding: '16px 20px' }}>
                                        {(() => {
                                            const isOnline = trial.last_heartbeat && (new Date() - new Date(trial.last_heartbeat)) < 10 * 1000 * 60;
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
                                            <code>{trial.hwid}</code>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--text-dim)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Calendar size={14} />
                                            {new Date(trial.started_at).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--text-dim)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Activity size={14} />
                                            {trial.last_heartbeat ? (() => {
                                                const diff = Math.floor((new Date() - new Date(trial.last_heartbeat)) / 1000);
                                                if (diff < 60) return 'Just now';
                                                if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
                                                if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
                                                return new Date(trial.last_heartbeat).toLocaleDateString();
                                            })() : 'Never'}
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

export default Trials;
