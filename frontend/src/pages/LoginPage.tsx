import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'sonner';
import { Lock, LogIn } from 'lucide-react';
import { useAuth } from '../services/AuthContext';

const LoginPage: React.FC = () => {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await api.post('/login', { password });
            const { token } = response.data;

            login(token);
            toast.success('Connexion réussie');
            navigate('/');
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Mot de passe incorrect');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '20px'
        }}>
            <div className="card" style={{
                maxWidth: '400px',
                width: '100%',
                textAlign: 'center',
                background: 'linear-gradient(145deg, #1a0b2e 0%, #0f0518 100%)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Subtle background glow */}
                <div style={{
                    position: 'absolute',
                    top: '-50%',
                    left: '-50%',
                    width: '200%',
                    height: '200%',
                    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 50%)',
                    pointerEvents: 'none'
                }} />

                <div style={{ marginBottom: '32px' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        background: 'rgba(139, 92, 246, 0.1)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        border: '1px solid var(--border-color)'
                    }}>
                        <Lock size={32} color="var(--primary)" />
                    </div>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Shootix Admin</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Veuillez vous connecter pour continuer</p>
                </div>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
                    <div style={{ textAlign: 'left' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>
                            Mot de passe
                        </label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '14px'
                        }}
                    >
                        {loading ? 'Connexion...' : (
                            <>
                                <LogIn size={20} />
                                Se connecter
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
