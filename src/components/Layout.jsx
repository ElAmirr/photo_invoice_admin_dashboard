import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu, X } from 'lucide-react';

const Layout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="dashboard-layout">
            {/* Mobile Header Toggle */}
            <div className="mobile-navbar mobile-only glass" style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                height: '64px',
                zIndex: 80,
                padding: '0 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderWidth: '0 0 1px 0',
                borderRadius: 0
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src="/logo.png" alt="Shootix" style={{ width: '28px', height: '28px' }} />
                    <span style={{ fontWeight: 800, fontSize: '18px' }}>Shootix</span>
                </div>
                <button
                    onClick={toggleSidebar}
                    style={{ background: 'transparent', border: 'none', color: '#fff', padding: '8px' }}
                >
                    <Menu size={28} />
                </button>
            </div>

            {/* Backdrop for mobile */}
            <div
                className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`}
                onClick={() => setIsSidebarOpen(false)}
            />

            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="main-content animate-fade-in">
                {children}
            </main>
        </div>
    );
};

export default Layout;
