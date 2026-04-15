import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Key,
    ShieldCheck,
    LogOut,
    Settings,
    UserCheck,
    X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
    const { logout } = useAuth();

    const navItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Licenses', path: '/licenses', icon: ShieldCheck },
        { name: 'Key Generator', path: '/generator', icon: Key },
    ];

    return (
        <aside className={`sidebar glass ${isOpen ? 'open' : ''}`} style={{
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            width: 'var(--sidebar-width)',
            borderRadius: '0 24px 24px 0',
            borderLeft: 'none',
            padding: '30px 20px',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 100
        }}>
            <div className="sidebar-header" style={{ marginBottom: '40px', padding: '0 10px', position: 'relative' }}>
                <button
                    className="mobile-only"
                    onClick={onClose}
                    style={{ position: 'absolute', right: '-5px', top: '-5px', background: 'transparent', border: 'none', color: 'var(--text-dim)', padding: '10px' }}
                >
                    <X size={24} />
                </button>
                <h2 style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    background: 'linear-gradient(135deg, #A855F7 0%, #9333EA 50%, #C026D3 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <img src="/logo.png" alt="Shootix" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                    Shootix
                </h2>
                <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px' }}>Admin Licensing</p>
            </div>

            <nav style={{ flex: 1 }}>
                <ul style={{ listStyle: 'none' }}>
                    {navItems.map((item) => (
                        <li key={item.path} style={{ marginBottom: '8px' }}>
                            <NavLink
                                to={item.path}
                                onClick={onClose}
                                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                                style={({ isActive }) => ({
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    color: isActive ? '#fff' : 'var(--text-dim)',
                                    textDecoration: 'none',
                                    background: isActive ? 'rgba(147, 51, 234, 0.15)' : 'transparent',
                                    transition: 'var(--transition)',
                                    border: isActive ? '1px solid rgba(147, 51, 234, 0.3)' : '1px solid transparent'
                                })}
                            >
                                <item.icon size={20} />
                                <span style={{ fontWeight: 500 }}>{item.name}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            <button
                onClick={() => {
                    onClose();
                    logout();
                }}
                style={{
                    marginTop: 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    color: '#ff4b4b',
                    background: 'rgba(255, 75, 75, 0.05)',
                    border: '1px solid rgba(255, 75, 75, 0.1)',
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                    width: '100%',
                    fontWeight: 600
                }}
                onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 75, 75, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(255, 75, 75, 0.3)';
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 75, 75, 0.05)';
                    e.currentTarget.style.borderColor = 'rgba(255, 75, 75, 0.1)';
                }}
            >
                <LogOut size={20} />
                Log Out
            </button>
        </aside>
    );
};

export default Sidebar;
