import React from 'react';

const PremiumButton = ({ children, onClick, disabled, loading, icon: Icon, className = '', type = 'button' }) => {
    return (
        <button
            type={type}
            className={`btn-premium ${className}`}
            onClick={onClick}
            disabled={disabled || loading}
        >
            {Icon && <Icon size={18} />}
            {loading ? 'Processing...' : children}
        </button>
    );
};

export default PremiumButton;
