import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  children: React.ReactNode;
}

// Tailwind config is presumed to include our brand colors as utility classes.
// For example, 'bg-neon-cyan' (#00F0FF), 'hover:bg-bright-orange' (#FF6B00), 'text-dark-navy' (#0A192F), etc.

const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, ...props }) => {
  // Base styles
  let baseStyles =
    'inline-flex items-center justify-center rounded-lg px-6 py-3 font-poppins font-semibold transition-colors shadow-sm focus:outline-none';

  // Variant-specific styles
  switch (variant) {
    case 'primary':
      baseStyles += ' bg-neon-cyan text-dark-navy hover:bg-bright-orange';
      break;
    case 'secondary':
      baseStyles += ' bg-dark-navy text-soft-white border border-neon-cyan hover:bg-neon-cyan hover:text-dark-navy';
      break;
    case 'danger':
      baseStyles += ' bg-bright-orange text-soft-white hover:opacity-90';
      break;
    default:
      baseStyles += ' bg-neon-cyan text-dark-navy hover:bg-bright-orange';
      break;
  }

  return (
    <button className={baseStyles} {...props}>
      {children}
    </button>
  );
};

export default Button;
