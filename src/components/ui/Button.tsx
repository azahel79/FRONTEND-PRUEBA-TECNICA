// src/components/ui/Button.tsx
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ children, className, ...props }) => {
  return (
    <button
      className={`px-6 py-2 bg-[#55E6ED] text-[#0A1016] font-bold rounded-sm uppercase text-sm tracking-wider hover:bg-[#AEEFF3] transition-colors ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};