import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { toast } from 'sonner';
import { Key, User, Calendar, ShieldCheck, ShieldAlert, Ban, RefreshCcw } from 'lucide-react';

interface License {
    key: string;
    machine_id: string | null;
    email: string | null;
    activated_at: string | null;
    is_active: number;
}

const LicensesTab: React.FC = () => {
    const [licenses, setLicenses] = useState<License[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLicenses = async () => {
        try {
            const response = await api.get('/licenses');
            setLicenses(response.data);
        } catch (error: any) {
            toast.error('Erreur lors du chargement des licences');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLicenses();
    }, []);

    const handleDeactivate = async (key: string) => {
        if (!window.confirm('Voulez-vous vraiment désactiver cette clé ?')) return;

        try {
            await api.patch(`/licenses/${key}/deactivate`);
            toast.success('Licence désactivée');
            fetchLicenses();
        } catch (error: any) {
            toast.error('Erreur lors de la désactivation');
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '40px' }}>Chargement...</div>;

    return (
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2>Gestion des licences</h2>
                <button onClick={fetchLicenses} className="secondary" style={{ padding: '8px', background: 'transparent', border: '1px solid var(--border-color)' }}>
                    <RefreshCcw size={18} />
                </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                            <th style={{ padding: '12px' }}>Clé</th>
                            <th style={{ padding: '12px' }}>Utilisateur</th>
                            <th style={{ padding: '12px' }}>Machine ID</th>
                            <th style={{ padding: '12px' }}>Activée le</th>
                            <th style={{ padding: '12px' }}>Status</th>
                            <th style={{ padding: '12px' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {licenses.map((license) => (
                            <tr key={license.key} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '12px', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '14px', color: 'var(--primary)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Key size={14} />
                                        {license.key}
                                    </div>
                                </td>
                                <td style={{ padding: '12px', fontSize: '14px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <User size={14} color="var(--text-muted)" />
                                        {license.email || '-'}
                                    </div>
                                </td>
                                <td style={{ padding: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
                                    {license.machine_id ? license.machine_id.substring(0, 8) + '...' : 'Non activée'}
                                </td>
                                <td style={{ padding: '12px', fontSize: '14px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Calendar size={14} color="var(--text-muted)" />
                                        {license.activated_at ? new Date(license.activated_at).toLocaleDateString() : 'N/A'}
                                    </div>
                                </td>
                                <td style={{ padding: '12px' }}>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        background: license.is_active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                        color: license.is_active ? 'var(--success)' : 'var(--error)',
                                        border: `1px solid ${license.is_active ? 'var(--success)' : 'var(--error)'}22`
                                    }}>
                                        {license.is_active ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                                        {license.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td style={{ padding: '12px' }}>
                                    {license.is_active ? (
                                        <button
                                            onClick={() => handleDeactivate(license.key)}
                                            style={{
                                                padding: '6px 12px',
                                                fontSize: '12px',
                                                background: 'rgba(239, 68, 68, 0.1)',
                                                color: 'var(--error)',
                                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                            }}
                                        >
                                            <Ban size={12} />
                                            Désactiver
                                        </button>
                                    ) : '-'}
                                </td>
                            </tr>
                        ))}
                        {licenses.length === 0 && (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                    Aucune licence générée
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LicensesTab;
