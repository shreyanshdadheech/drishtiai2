import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Routes, Route } from "react-router-dom";
import { syncThemeWithLocal } from "./helpers/theme_helpers";
import { useTranslation } from "react-i18next";
import "./localization/i18n";
import { updateAppLanguage } from "./helpers/language_helpers";
import Login from "./pages/Login";
import HomePage from "./pages/HomePage";
import BaseLayout from "./layouts/BaseLayout";
import { ErrorBoundary } from './components/ErrorBoundary';
import PatientPage from "./pages/PatientPage";

export default function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    syncThemeWithLocal();
    updateAppLanguage(i18n);
  }, [i18n]);

  
  useEffect(() => {
    // Reset focus when the app first loads
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }, []);

  return (
    <ErrorBoundary>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={
            <BaseLayout>
              <HomePage />
            </BaseLayout>
          } />
          <Route path="/patient/:id" element={
            <BaseLayout>
              <PatientPage />
            </BaseLayout>
          } />
        </Routes>
      </HashRouter>
    </ErrorBoundary>
  );
}

const root = createRoot(document.getElementById("app")!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
