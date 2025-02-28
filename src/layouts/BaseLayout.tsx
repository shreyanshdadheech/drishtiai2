import React from 'react';
import NavigationMenu from '@/components/template/NavigationMenu';
import WindowControls from '@/components/template/WindowControls';
import logo from "@/assets/logo.png";
import ToggleTheme from '@/components/ToggleTheme';

export default function BaseLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen" style={{ WebkitAppRegion: 'drag' }}>
      <div className="flex items-center justify-between bg-background border-b">
        <div style={{ WebkitAppRegion: 'no-drag' }} className="flex-1">
          <NavigationMenu />
        </div>
        <div className="flex items-center justify-center bg-white px-4 py-1 rounded-md mx-4 select-none">
          <img src={logo} alt="Logo" className="h-6 w-auto" />
        </div>
        <div style={{ WebkitAppRegion: 'no-drag' }} className="flex-1 flex justify-end">
          <WindowControls />
        </div>
      </div>
      <div className="flex-1 overflow-auto" style={{ WebkitAppRegion: 'no-drag' }}>
        {children}
      </div>
    </div>
  );
}
