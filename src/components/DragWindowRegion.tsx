import {
  closeWindow,
  maximizeWindow,
  minimizeWindow,
} from "@/helpers/window_helpers";
import React, { type ReactNode } from "react";

interface DragWindowRegionProps {
  title: string;
}

function isMac() {
  return navigator.userAgent.includes("Mac");
}
import WindowControls from '@/components/template/WindowControls';


export default function DragWindowRegion({ title }: DragWindowRegionProps) {
  return (
    <div className="h-8 w-full bg-background fixed top-0 left-0 right-0 flex items-center justify-between draggable z-50">
      
      <div className="flex-1 flex justify-end app-region-no-drag">
          <WindowControls />
        </div>
    </div>
  );
}
