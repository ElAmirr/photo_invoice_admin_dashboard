import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="main-content animate-fade-in">
                {children}
            </main>
        </div>
    );
};

export default Layout;
