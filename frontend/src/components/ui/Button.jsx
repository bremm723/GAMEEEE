import React from 'react';
import { motion } from 'framer-motion';

const VARIANTS = {
  primary: 'bg-blush-500 hover:bg-blush-600 text-white shadow-glow',
  secondary: 'bg-white/10 hover:bg-white/20 text-white border border-white/20',
  ghost: 'bg-transparent hover:bg-white/10 text-white/80',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
};

export default function Button({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  type = 'button',
  className = '',
  fullWidth = false,
}) {
  return (
    <motion.button
      type={type}
      whileTap={{ scale: disabled ? 1 : 0.96 }}
      whileHover={{ scale: disabled ? 1 : 1.03 }}
      onClick={onClick}
      disabled={disabled}
      className={`
        px-5 py-3 rounded-2xl font-display font-semibold text-sm sm:text-base
        transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed
        ${fullWidth ? 'w-full' : ''}
        ${VARIANTS[variant]}
        ${className}
      `}
    >
      {children}
    </motion.button>
  );
}
