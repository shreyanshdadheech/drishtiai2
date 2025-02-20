import React from "react";
import Footer from "@/components/template/Footer";
import { LoginForm } from "@/components/template/login-form";
import DragWindowRegion from "@/components/DragWindowRegion";

export default function Login() {
  return (
    <div className="flex flex-col h-screen">
      <DragWindowRegion title="Drishti AI" />
      <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
        <div className="w-full max-w-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
