import { useState, useEffect } from "react";
import { X, Download, Smartphone } from "lucide-react";

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [show, setShow] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
      return;
    }

    // Check if dismissed before
    if (localStorage.getItem("pwa-dismissed")) return;

    // Listen for install prompt
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show after 10 seconds
      setTimeout(() => setShow(true), 10000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => {
      setInstalled(true);
      setShow(false);
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setShow(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem("pwa-dismissed", "1");
  };

  if (!show || installed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[9998] max-w-sm mx-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#f43f5e,#fb923c)" }}>
          <Smartphone className="w-6 h-6 text-white"/>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-sm">Install Spark App 🔥</p>
          <p className="text-gray-500 text-xs">Add to home screen for best experience</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={handleInstall}
            className="flex items-center gap-1 px-3 py-2 text-white text-xs font-bold rounded-xl"
            style={{ background: "linear-gradient(135deg,#f43f5e,#fb923c)" }}>
            <Download className="w-3 h-3"/> Install
          </button>
          <button onClick={handleDismiss} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4"/>
          </button>
        </div>
      </div>
    </div>
  );
}
