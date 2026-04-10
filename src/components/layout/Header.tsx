import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 w-full h-16 bg-[#0A1016]/80 backdrop-blur-md border-b border-[#1A2530] px-8 flex items-center justify-center  z-50  py-10">
      
      <div className="flex items-center gap-1 font-black text-4xl tracking-tighter uppercase italic">
        <span className="text-[#55E6ED]">React</span>
        <span className="text-white">Task</span>
      </div>

     

    </header>
  );
};