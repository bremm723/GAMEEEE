import React from 'react';

export default function TextInput({
  value,
  onChange,
  placeholder,
  maxLength,
  uppercase = false,
  className = '',
  onKeyDown,
  autoFocus = false,
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(uppercase ? e.target.value.toUpperCase() : e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      onKeyDown={onKeyDown}
      autoFocus={autoFocus}
      className={`
        w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15
        text-white placeholder-white/40 focus:outline-none focus:ring-2
        focus:ring-blush-500 transition-all font-body tracking-wide
        ${uppercase ? 'uppercase tracking-[0.3em] text-center font-display' : ''}
        ${className}
      `}
    />
  );
}
