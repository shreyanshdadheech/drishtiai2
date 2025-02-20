import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/utils/tailwind"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import logo from "../../../images/logo.png";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { getStoredPath, storePath } from "@/helpers/path_helpers";

interface LoginResponse {
  message: string;
  access: string;
  refresh: string;
}

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const navigate = useNavigate();
  const [serverPath, setServerPath] = useState(() => getStoredPath() || "C:\\Mediview\\resources\\server");
  const emailInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfigDialog, setShowConfigDialog] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('accessToken');
    if (token) {
      navigate('/home');
    }
    
    // Focus email input when component mounts
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value;
    const password = (e.currentTarget.elements.namedItem('password') as HTMLInputElement).value;

    try {
      const response = await fetch('https://bioscanai.com/drishti/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed. Please check your credentials.');
      }

      const data: LoginResponse = await response.json();

      // Save all necessary data to localStorage
      localStorage.setItem('email', email);
      localStorage.setItem('password', password);
      localStorage.setItem('accessToken', data.access);
      localStorage.setItem('refreshToken', data.refresh);
      localStorage.setItem('serverPath', serverPath);

      navigate('/home');
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handlePathSave = () => {
    storePath(serverPath);
    setShowConfigDialog(false);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form className="mt-[-30%]" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <div className="bg-white p-4 rounded-xl">
              <img 
                src={logo} 
                alt="Drishti AI Logo" 
                className="w-3/4 mx-auto"
              />
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                ref={emailInputRef}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Password"
                required
              />
            </div>
            {error && (
              <div className="text-red-500 text-sm text-center mb-4">
                {error}
              </div>
            )}
            <Button 
              type="submit" 
              className="w-full" 
              tabIndex={3}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </div>
          <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
            <span className="relative z-10 bg-background px-2 text-muted-foreground">
              Or
            </span>
          </div>
          <div className="flex gap-4 justify-center align-middle">
            <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full" tabIndex={4}>
                  Advanced configuration
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Advanced Configuration</DialogTitle>
                  <DialogDescription>
                    Set the server path for the application.
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
                        onClick={async () => {
                          const result = await window.electron.showOpenDialog({
                            properties: ['openDirectory'],
                            defaultPath: serverPath
                          });
                          
                          if (!result.canceled && result.filePaths.length > 0) {
                            setServerPath(result.filePaths[0]);
                          }
                        }}
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
                    onClick={() => setServerPath("C:\\Mediview\\resources\\server")}
                  >
                    Reset to Default
                  </Button>
                  <Button type="button" onClick={handlePathSave}>
                    Save Configuration
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </form>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
        By clicking continue, you agree to our <a href="#" tabIndex={5}>Terms of Service</a>{" "}
        and <a href="#" tabIndex={6}>Privacy Policy</a>.
      </div>
    </div>
  );
}
