import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="bg-white border-b border-gray-200 shadow-sm">
            <div className="container mx-auto px-4 py-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-800">
                        Math Tutor
                    </h1>
                    <p className="text-gray-600 text-sm mt-1">
                        Long Division Practice
                    </p>
                </div>
            </div>
        </header>
    );
};

export default Header; 