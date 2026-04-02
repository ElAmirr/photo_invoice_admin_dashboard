import React, { useState } from 'react';
import TrialsTab from '../components/TrialsTab';
import LicensesTab from '../components/LicensesTab';
import GenerateTab from '../components/GenerateTab';
import { LogOut, LayoutDashboard, Key, Monitor, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../services/AuthContext';

type Tab = 'essais' | 'licences' | 'generer';

const DashboardPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('essais');
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        toast.success('Déconnecté');
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <header style={{
                background: 'var(--card-bg)',
                borderBottom: '1px solid var(--border-color)',
                padding: '16px 40px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'sticky',
                top: 0,
                zIndex: 100,
                backdropFilter: 'blur(10px)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        background: 'var(--primary)',
                        padding: '8px',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <LayoutDashboard size={20} color="white" />
                    </div>
                    <h1 style={{ fontSize: '20px', fontWeight: 'bold', letterSpacing: '-0.5px' }}>Shootix <span style={{ color: 'var(--primary)' }}>Admin</span></h1>
                </div>

                <button
                    onClick={handleLogout}
                    style={{
                        background: 'transparent',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        fontSize: '14px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--error)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                >
                    <LogOut size={16} />
                    Déconnexion
                </button>
            </header>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '40px', maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
                {/* Navigation Tabs */}
                <div style={{
                    display: 'flex',
                    gap: '8px',
                    marginBottom: '32px',
                    background: 'rgba(255,255,255,0.05)',
                    padding: '4px',
                    borderRadius: '12px',
                    width: 'fit-content'
                }}>
                    {[
                        { id: 'essais', label: 'Essais', icon: <Monitor size={16} /> },
                        { id: 'licences', label: 'Licences', icon: <Key size={16} /> },
                        { id: 'generer', label: 'Générer', icon: <PlusCircle size={16} /> }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as Tab)}
                            style={{
                                background: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                                color: activeTab === tab.id ? 'white' : 'var(--text-muted)',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '10px 24px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '14px',
                                fontWeight: '600'
                            }}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                    {activeTab === 'essais' && <TrialsTab />}
                    {activeTab === 'licences' && <LicensesTab />}
                    {activeTab === 'generer' && <GenerateTab />}
                </div>
            </main>

            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
};

export default DashboardPage;
