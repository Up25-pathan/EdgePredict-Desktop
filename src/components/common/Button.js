import React from 'react';

/**
 * A reusable button component with different variants.
 * @param {object} props
 * @param {React.ReactNode} props.children - The content inside the button.
 * @param {() => void} props.onClick - The function to call when the button is clicked.
 * @param {'primary' | 'secondary' | 'danger'} [props.variant='primary'] - The button style variant.
 * @param {string} [props.className] - Additional CSS classes to apply.
 */
const Button = ({ children, onClick, variant = 'primary', className = '' }) => {
    const baseClasses = 'font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center';

    const variantClasses = {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white',
        secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
        danger: 'bg-red-600 hover:bg-red-700 text-white',
    };

    return (
        <button
            onClick={onClick}
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        >
            {children}
        </button>
    );
};

export default Button;

