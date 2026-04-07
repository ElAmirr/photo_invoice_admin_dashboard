import React from 'react';

const GlassCard = ({ children, className = '', style = {} }) => {
    return (
        <div
            className={`glass ${className}`}
            style={{
                padding: '24px',
                marginBottom: '20px',
                ...style
            }}
        >
            {children}
        </div>
    );
};

export default GlassCard;
