import React, { useState, useEffect } from 'react';
import GlassCard from '../components/GlassCard';
import PremiumButton from '../components/PremiumButton';
import api from '../api/api';
import {
    Users,
    CheckCircle,
    Activity,
    Plus,
    ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        recent: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/api/admin/licenses');
                const licenses = res.data || [];

                setStats({
                    total: licenses.length,
                    active: licenses.filter(l => l.hwid).length,
                    recent: licenses.filter(l => {
                        if (!l.created_at) return false;
                        const diff = new Date() - new Date(l.created_at);
                        return diff < 86400000 * 7; // Last 7 days
                    }).length
                });
            } catch (err) {
                console.error('Failed to fetch stats', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const kpis = [
        { title: 'Total Licenses', value: stats.total, icon: Users, color: '#d400d4' },
        { title: 'Active Installations', value: stats.active, icon: CheckCircle, color: '#00d4ff' },
        { title: 'Recent Activations', value: stats.recent, icon: Activity, color: '#7c00ff' },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: '700' }}>Overview</h1>
                    <p style={{ color: 'var(--text-dim)' }}>Quick summary of your licensing system</p>
                </div>
                <Link to="/generator">
                    <PremiumButton icon={Plus}>Quick Generate</PremiumButton>
                </Link>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '24px',
                marginBottom: '40px'
            }}>
                {kpis.map((kpi, index) => (
                    <GlassCard key={index} style={{ marginBottom: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '12px',
                                background: `${kpi.color}15`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: kpi.color,
                                border: `1px solid ${kpi.color}30`
                            }}>
                                <kpi.icon size={28} />
                            </div>
                            <div>
                                <p style={{ color: 'var(--text-dim)', fontSize: '14px', fontWeight: '500' }}>{kpi.title}</p>
                                <h3 style={{ fontSize: '28px', fontWeight: '700', marginTop: '4px' }}>
                                    {loading ? '...' : kpi.value}
                                </h3>
                            </div>
                        </div>
                    </GlassCard>
                ))}
            </div>

            <GlassCard style={{ padding: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h3 style={{ fontSize: '20px', fontWeight: '600' }}>System Status</h3>
                        <p style={{ color: 'var(--text-dim)', fontSize: '14px', marginTop: '4px' }}>
                            Backend API: <span style={{ color: '#00ff88', fontWeight: 600 }}>Operational</span>
                        </p>
                    </div>
                    <a
                        href="https://photo-invoice-licence-sever.onrender.com"
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 600 }}
                    >
                        Visit Server <ExternalLink size={14} />
                    </a>
                </div>
            </GlassCard>
        </div>
    );
};

export default Dashboard;
