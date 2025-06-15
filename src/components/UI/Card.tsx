import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
    const baseClasses = 'bg-white shadow-md rounded-lg overflow-hidden';

    return (
        <div className={`${baseClasses} ${className}`}>
            {children}
        </div>
    );
};

export default Card; 