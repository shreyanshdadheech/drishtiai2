import React from 'react';
import NavigationMenu from '@/components/template/NavigationMenu';
import WindowControls from '@/components/template/WindowControls';
import logo from "@/assets/logo.png";
import ToggleTheme from '@/components/ToggleTheme';

export default function BaseLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>
      <div className="flex items-center justify-between bg-background border-b">
        <div style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties} className="flex-1">
          <NavigationMenu />
        </div>
        <div className="flex items-center justify-center    select-none h-6 w-auto">
          <img src={logo} alt="Logo" className="w-1/4 px-4 py-1 min-h-4  not-md:min-w-1/2  bg-white/95 rounded-md"/>
        </div>
        <div style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties} className="flex-1 flex justify-end">
          <WindowControls />
        </div>
      </div>
      <div className="flex-1 overflow-auto" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        {children}
      </div>
    </div>
  );
}
