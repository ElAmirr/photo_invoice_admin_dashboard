import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { toast } from 'sonner';
import { RefreshCcw, Monitor, Clock, ShieldAlert, ShieldCheck } from 'lucide-react';

interface Trial {
    machine_id: string;
    start_date: string;
    days_left: number;
    is_blocked: number;
}

const TrialsTab: React.FC = () => {
    const [trials, setTrials] = useState<Trial[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTrials = async () => {
        try {
            const response = await api.get('/trials');
            setTrials(response.data);
        } catch (error: any) {
            toast.error('Erreur lors du chargement des essais');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrials();
    }, []);

    const handleReset = async (machineId: string) => {
        if (!window.confirm('Réinitialiser cet essai ?')) return;

        try {
            await api.delete(`/trials/${machineId}`);
            toast.success('Essai réinitialisé');
            fetchTrials();
        } catch (error: any) {
            toast.error('Erreur lors de la réinitialisation');
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '40px' }}>Chargement...</div>;

    return (
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2>Machines en essai</h2>
                <button onClick={fetchTrials} className="secondary" style={{ padding: '8px', background: 'transparent', border: '1px solid var(--border-color)' }}>
                    <RefreshCcw size={18} />
                </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                            <th style={{ padding: '12px' }}>Machine ID</th>
                            <th style={{ padding: '12px' }}>Date début</th>
                            <th style={{ padding: '12px' }}>Jours restants</th>
                            <th style={{ padding: '12px' }}>Status</th>
                            <th style={{ padding: '12px' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {trials.map((trial) => (
                            <tr key={trial.machine_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '14px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Monitor size={14} color="var(--text-muted)" />
                                        {trial.machine_id.substring(0, 12)}...
                                    </div>
                                </td>
                                <td style={{ padding: '12px', fontSize: '14px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Clock size={14} color="var(--text-muted)" />
                                        {new Date(trial.start_date).toLocaleDateString()}
                                    </div>
                                </td>
                                <td style={{ padding: '12px' }}>
                                    <span style={{
                                        color: trial.days_left > 1 ? 'var(--text-main)' : 'var(--warning)',
                                        fontWeight: 'bold'
                                    }}>
                                        {trial.days_left} jours
                                    </span>
                                </td>
                                <td style={{ padding: '12px' }}>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        background: trial.is_blocked ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                        color: trial.is_blocked ? 'var(--error)' : 'var(--success)',
                                        border: `1px solid ${trial.is_blocked ? 'var(--error)' : 'var(--success)'}22`
                                    }}>
                                        {trial.is_blocked ? <ShieldAlert size={12} /> : <ShieldCheck size={12} />}
                                        {trial.is_blocked ? 'Bloqué' : 'Actif'}
                                    </span>
                                </td>
                                <td style={{ padding: '12px' }}>
                                    <button
                                        onClick={() => handleReset(trial.machine_id)}
                                        style={{
                                            padding: '6px 12px',
                                            fontSize: '12px',
                                            background: 'rgba(239, 68, 68, 0.1)',
                                            color: 'var(--error)',
                                            border: '1px solid rgba(239, 68, 68, 0.2)'
                                        }}
                                    >
                                        Réinitialiser
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {trials.length === 0 && (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                    Aucun essai en cours
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TrialsTab;
