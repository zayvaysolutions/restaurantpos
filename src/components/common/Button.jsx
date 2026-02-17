import React from 'react';

// EXACTAMENTE IGUAL que en el original
export const Button = ({ 
    children, 
    onClick, 
    variant = 'primary', 
    icon, 
    fullWidth = false, 
    disabled = false,
    className = '',
    type = 'button'
}) => {
    const variants = {
        primary: 'bg-orange-500 hover:bg-orange-600 text-white',
        secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
        danger: 'bg-red-500 hover:bg-red-600 text-white',
        success: 'bg-green-500 hover:bg-green-600 text-white',
        info: 'bg-blue-500 hover:bg-blue-600 text-white',
        warning: 'bg-yellow-500 hover:bg-yellow-600 text-white',
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`
                btn-touch flex items-center justify-center gap-2 
                ${variants[variant]}
                ${fullWidth ? 'w-full' : ''}
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                ${className}
            `}
        >
            {icon && <span className="flex-shrink-0">{icon}</span>}
            {children}
        </button>
    );
};