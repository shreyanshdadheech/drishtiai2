import { Moon } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { toggleTheme } from "@/helpers/theme_helpers";

export default function ToggleTheme() {
  return (
    <Button onClick={toggleTheme} size="sm" className="mx-4  ">
      <Moon size={10} />
    </Button>
  );
}
