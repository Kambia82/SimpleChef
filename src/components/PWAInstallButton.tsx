import React, { useState, useEffect } from "react";
import { Download, Share, MoreVertical, Smartphone, X, CheckCircle } from "lucide-react";
import { usePWAInstall } from "../hooks/usePWAInstall";

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    if (!showGuide) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowGuide(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showGuide]);

  // Hide when already running as an installed home-screen app
  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      await install();
      return;
    }
    setShowGuide(true);
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-stone-300 bg-white text-stone-700 hover:bg-stone-50 flex items-center gap-1.5 transition-colors"
        title="Save this app to your phone home screen"
      >
        {isInstallable ? (
          <Download className="w-3.5 h-3.5 text-emerald-700" />
        ) : (
          <Smartphone className="w-3.5 h-3.5 text-emerald-700" />
        )}
        <span className="hidden sm:inline">{isInstallable ? "Install App" : "Save to Phone"}</span>
        <span className="sm:hidden">{isInstallable ? "Install" : "Phone"}</span>
      </button>

      {showGuide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowGuide(false);
          }}
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-stone-200 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">
                    {isIOS ? "Save to iPhone Home Screen" : "Save to Your Phone"}
                  </h3>
                  <p className="text-xs text-stone-500">
                    Works like a real app with your saved meals &amp; Walmart list.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isIOS ? (
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3 text-sm text-stone-700">
                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    1
                  </span>
                  <p>
                    Open this page in <strong>Safari</strong>, then tap the{" "}
                    <span className="inline-flex items-center gap-1 font-semibold text-stone-900">
                      <Share className="w-3.5 h-3.5 inline" /> Share
                    </span>{" "}
                    button at the bottom or top bar.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    2
                  </span>
                  <p>
                    Scroll down and tap <strong>Add to Home Screen</strong>, then tap{" "}
                    <strong>Add</strong>.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-sm text-stone-700">
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 space-y-2">
                  <p className="font-bold text-stone-900 text-xs uppercase tracking-wider">
                    On iPhone (Safari)
                  </p>
                  <p className="text-xs sm:text-sm">
                    1. Open the app link in <strong>Safari</strong>.
                    <br />
                    2. Tap{" "}
                    <span className="inline-flex items-center gap-1 font-semibold">
                      <Share className="w-3.5 h-3.5 inline" /> Share
                    </span>{" "}
                    &rarr; <strong>Add to Home Screen</strong>.
                  </p>
                </div>

                <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 space-y-2">
                  <p className="font-bold text-stone-900 text-xs uppercase tracking-wider">
                    On Android (Chrome)
                  </p>
                  <p className="text-xs sm:text-sm">
                    1. Open the app link in <strong>Chrome</strong>.
                    <br />
                    2. Tap{" "}
                    <span className="inline-flex items-center gap-1 font-semibold">
                      <MoreVertical className="w-3.5 h-3.5 inline" /> Menu (3 dots)
                    </span>{" "}
                    &rarr; <strong>Add to Home screen</strong> (or <strong>Install app</strong>).
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-xl p-3">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-700" />
              <span>
                Note: Saved meals and your Walmart list stay on the device you use, so open it directly on your phone before building your list.
              </span>
            </div>

            <button
              onClick={() => setShowGuide(false)}
              className="w-full rounded-xl bg-emerald-700 hover:bg-emerald-800 py-2.5 text-sm font-semibold text-white transition-colors"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
};
