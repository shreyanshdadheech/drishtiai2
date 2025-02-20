import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DEFAULT_PATH = "C:\\Mediview\\resources\\server";

interface PathSelectionDialogProps {
  onPathConfirm: (path: string) => void;
}

export default function PathSelectionDialog({ onPathConfirm }: PathSelectionDialogProps) {
  const [path, setPath] = useState(DEFAULT_PATH);
  const [isOpen, setIsOpen] = useState(true);

  const handleBrowse = async () => {
    try {
      // Using Electron's dialog through preload
      const result = await window.electron.showOpenDialog({
        properties: ['openDirectory'],
        defaultPath: path
      });
      
      if (!result.canceled && result.filePaths.length > 0) {
        setPath(result.filePaths[0]);
      }
    } catch (error) {
      console.error('Failed to open directory dialog:', error);
    }
  };

  const handleConfirm = () => {
    onPathConfirm(path);
    setIsOpen(false);
  };

  const handleReset = () => {
    setPath(DEFAULT_PATH);
  };

  // Prevent dialog from closing without confirmation
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setIsOpen(true);
    }
    // Don't allow closing by clicking outside
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Server Path Required</DialogTitle>
          <DialogDescription>
            Please select or confirm the server path to continue using the application.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="path">Server Path</Label>
            <div className="flex gap-2">
              <Input
                id="path"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                placeholder="Enter server path"
                className="flex-1"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={handleBrowse}
              >
                Browse
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
          >
            Reset to Default
          </Button>
          <Button type="button" onClick={handleConfirm}>
            Confirm Path
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 