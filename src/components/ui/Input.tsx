// src/components/ui/Input.tsx
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input: React.FC<InputProps> = (props) => {
  return (
    <input
      className="w-full px-4 py-2 bg-[#1A2530] text-[#E0E0E0] rounded-sm focus:outline-none focus:ring-1 focus:ring-[#55E6ED] placeholder-[#6C7A86]"
      {...props}
    />
  );
};