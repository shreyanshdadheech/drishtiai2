import React from 'react';
import NavigationMenu from '@/components/template/NavigationMenu';
import WindowControls from '@/components/template/WindowControls';
import logo from "@/assets/logo.png";
import ToggleTheme from '@/components/ToggleTheme';

export default function BaseLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center justify-between bg-background border-b app-region-drag">
        <div className="flex-1 app-region-drag">
          <NavigationMenu />
        </div>
        <div className="app-region-no-drag flex items-center justify-center bg-white px-4 py-1 rounded-md mx-4">
          <img src={logo} alt="Logo" className="h-6 w-auto" />
           <div>
      </div>
        </div>
        <div className="flex-1 flex justify-end app-region-no-drag">
          <WindowControls />
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
