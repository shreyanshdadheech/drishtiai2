import React from 'react';
import { Minus, Maximize2, X } from 'lucide-react';
import {
  closeWindow,
  maximizeWindow,
  minimizeWindow,
} from "@/helpers/window_helpers";

const WindowControls = () => {
  return (
    <div className="flex">
      <button
        title="Minimize"
        type="button"
        className="p-2 hover:bg-slate-300 dark:hover:bg-slate-600"
        onClick={minimizeWindow}
      >
        <Minus size={12} />
      </button>
      <button
        title="Maximize"
        type="button"
        className="p-2 hover:bg-slate-300 dark:hover:bg-slate-600"
        onClick={maximizeWindow}
      >
        <Maximize2 size={12} />
      </button>
      <button
        type="button"
        title="Close"
        className="p-2 hover:bg-red-300 dark:hover:bg-red-500/30"
        onClick={closeWindow}
      >
        <X size={12} />
      </button>
    </div>
  );
};

export default WindowControls;
