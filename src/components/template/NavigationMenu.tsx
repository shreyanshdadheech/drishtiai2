import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  NavigationMenu as NavigationMenuBase,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "../ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ToggleTheme from "../ToggleTheme";
import { getStoredPath, storePath } from "@/helpers/path_helpers";
import fs from 'fs';
import path from 'path';
import { Eye, EyeOff, Download, RotateCw } from 'lucide-react';
import { Progress } from "@/components/ui/progress"; // Add this import

const DEFAULT_PATH = "C:\\Mediview\\resources\\server";

export default function NavigationMenu() {
  const navigate = useNavigate();
  const [serverPath, setServerPath] = useState(() => getStoredPath() || "C:\\Mediview\\resources\\server");
  const [email, setEmail] = useState(() => localStorage.getItem('email') || '');
  const [password, setPassword] = useState(() => localStorage.getItem('password') || '');
  const [showPassword, setShowPassword] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showDatabaseDialog, setShowDatabaseDialog] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<'checking' | 'available' | 'up-to-date' | 'error' | null>(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);
  useEffect(() => {
    return () => {
      window.electron?.removeUpdateProgressListener?.();
    };
  }, []);

  const handleBrowse = async () => {
    try {
      const result = await window.electron.showOpenDialog({
        properties: ['openDirectory'],
        defaultPath: serverPath
      });
      
      if (!result.canceled && result.filePaths.length > 0) {
        setServerPath(result.filePaths[0]);
      }
    } catch (error) {
      console.error('Failed to open directory dialog:', error);
    }
  };

  const handlePathSave = () => {
    storePath(serverPath);
    setShowDatabaseDialog(false);
  };

  const handleLogout = () => {
    setShowLogoutDialog(false);
    setTimeout(() => {
      localStorage.clear();
      navigate("/");
    }, 0);
  };

  const handleReset = () => {
    setServerPath(DEFAULT_PATH);
  };

  const handleAccountUpdate = () => {
    // Update localStorage with credentials
    localStorage.setItem('email', email);
    localStorage.setItem('password', password);
    setUpdateSuccess(true);
    
    // Clear success message after 3 seconds
    setTimeout(() => setUpdateSuccess(false), 3000);
  };

  


  return (
    <div className="flex items-center justify-between px-4 select-none">
      <div className="flex items-center gap-2">
        <ToggleTheme />
        <NavigationMenuBase>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink
                asChild
                className={navigationMenuTriggerStyle()}
              >
                <Link to="/home">Home</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                <DropdownMenu>
                  <DropdownMenuTrigger className="cursor-pointer">Settings</DropdownMenuTrigger>
                  <DropdownMenuContent>
                    
                    <Dialog open={showDatabaseDialog} onOpenChange={setShowDatabaseDialog}>
                      <DialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          Database Configuration
                        </DropdownMenuItem>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Database Configuration</DialogTitle>
                          <DialogDescription>
                            Configure the database server path for your application.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="serverPath">Server Path</Label>
                            <div className="flex gap-2">
                              <Input
                                id="serverPath"
                                value={serverPath}
                                onChange={(e) => setServerPath(e.target.value)}
                                placeholder="Enter the server path"
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
                          <Button type="button" onClick={handlePathSave}>
                            Save Configuration
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <DropdownMenuSeparator />
                    <Dialog>
                      <DialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          Account Settings
                        </DropdownMenuItem>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Account Settings</DialogTitle>
                          <DialogDescription>
                            Update your account credentials
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                              id="email"
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="Enter your email address"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                              <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password"
                                className="pr-10"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                          {updateSuccess && (
                            <div className="text-green-500 text-sm text-center">
                              Account updated successfully!
                            </div>
                          )}
                        </div>
                        <DialogFooter>
                          <Button type="button" onClick={handleAccountUpdate}>
                            Update Account
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                 

                    <DropdownMenuSeparator />

                    <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                      <DialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          Sign Out
                        </DropdownMenuItem>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Confirm Sign Out</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to sign out of your account?
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="gap-2 sm:gap-0">
                          <Button
                            variant="outline"
                            onClick={() => setShowLogoutDialog(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={handleLogout}
                          >
                            Sign Out
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </NavigationMenuLink>
            </NavigationMenuItem>
            
          </NavigationMenuList>
        </NavigationMenuBase>
      </div>

      
    </div>
  );
}
