import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import PremiumButton from '../components/PremiumButton';
import { ShieldCheck, Lock } from 'lucide-react';
import api from '../api/api';

const LoginPage = () => {
    const [secret, setSecret] = useState('');
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // If already authenticated, redirect to dashboard immediately
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!secret) return setError('Please enter the Admin Secret');

        setLoading(true);
        setError('');

        try {
            // Temporarily set the token in a mock header or use the api instance directly
            // Here we just test a request with the provided secret
            await api.get('/api/admin/licenses', {
                headers: { 'x-admin-token': secret }
            });

            // If success, proceed with login
            login(secret);
            navigate('/', { replace: true });
        } catch (err) {
            console.error('Full Error Object:', err);
            const status = err.response?.status;
            const data = err.response?.data;

            if (status === 401) {
                setError(`Invalid Secret (401). Value sent: "${secret}"`);
            } else if (status === 404) {
                setError(`Server error (404). Check if baseURL is correct.`);
            } else {
                setError(`Connection Error: ${err.message}. Status: ${status || 'Unknown'}`);
            }
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
            <GlassCard className="animate-fade-in" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
                <div style={{ marginBottom: '24px' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '16px',
                        background: 'rgba(147, 51, 234, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        color: 'var(--primary)',
                        border: '1px solid rgba(147, 51, 234, 0.2)'
                    }}>
                        <ShieldCheck size={32} />
                    </div>
                    <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>Shootix Admin</h1>
                    <p style={{ color: 'var(--text-dim)', fontSize: '14px' }}>Enter your security secret to access the dashboard</p>
                </div>

                <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Admin Secret</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="password"
                                value={secret}
                                onChange={(e) => setSecret(e.target.value)}
                                placeholder="••••••••••••"
                                style={{
                                    width: '100%',
                                    padding: '12px 16px 12px 44px',
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
                            <Lock size={18} style={{
                                position: 'absolute',
                                left: '16px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--text-dim)'
                            }} />
                        </div>
                        {error && <p style={{ color: '#ff4b4b', fontSize: '12px', marginTop: '6px' }}>{error}</p>}
                    </div>

                    <PremiumButton
                        type="submit"
                        className="w-full"
                        style={{ width: '100%', justifyContent: 'center' }}
                        loading={loading}
                    >
                        Authorize Access
                    </PremiumButton>
                </form>
            </GlassCard>
        </div>
    );
};

export default LoginPage;
