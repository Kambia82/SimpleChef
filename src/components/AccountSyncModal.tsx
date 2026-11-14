import React, { useState, useEffect } from "react";
import { User } from "firebase/auth";
import {
  X,
  Cloud,
  LogIn,
  LogOut,
  Users,
  Lock,
  Copy,
  Check,
  ArrowRight,
  Plus,
  Loader2
} from "lucide-react";

interface AccountSyncModalProps {
  user: User | null;
  authLoading: boolean;
  householdId: string;
  householdName: string;
  isSyncingAction: boolean;
  syncError: string | null;
  onSignIn: () => Promise<void>;
  onSignOut: () => Promise<void>;
  onCreateHousehold: (name: string) => Promise<void>;
  onJoinHousehold: (code: string) => Promise<void>;
  onLeaveHousehold: () => Promise<void>;
  onClose: () => void;
}

export const AccountSyncModal: React.FC<AccountSyncModalProps> = ({
  user,
  authLoading,
  householdId,
  householdName,
  isSyncingAction,
  syncError,
  onSignIn,
  onSignOut,
  onCreateHousehold,
  onJoinHousehold,
  onLeaveHousehold,
  onClose
}) => {
  const [newHouseholdName, setNewHouseholdName] = useState("My Household");
  const [joinCode, setJoinCode] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleCopyCode = async () => {
    if (!householdId) return;
    try {
      await navigator.clipboard.writeText(householdId);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = householdId;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreateHousehold(newHouseholdName.trim() || "My Household");
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = joinCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (!cleaned) return;
    await onJoinHousehold(cleaned);
    setJoinCode("");
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl w-full max-w-lg border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-emerald-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-800 rounded-lg">
              <Cloud className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Sync &amp; Household</h2>
              <p className="text-xs text-emerald-200">
                {user
                  ? householdId
                    ? "Private account + shared household active"
                    : "Private cloud sync active across your devices"
                  : "Save privately across your phone & computer"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-emerald-200 hover:text-white hover:bg-emerald-800 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 flex-1 overflow-y-auto">
          {syncError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl p-3">
              {syncError}
            </div>
          )}

          {!user ? (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-950">
                  <Lock className="w-4 h-4 text-emerald-700" />
                  <span>Everyone gets their own private list</span>
                </div>
                <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed">
                  Anyone else who opens this app link starts with their own separate list. Sign in with Google to back up your pantry, Walmart list, favorites, and meal ideas across your phone and computer.
                </p>
              </div>

              <button
                type="button"
                onClick={onSignIn}
                disabled={authLoading || isSyncingAction}
                className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-semibold py-3 px-4 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-colors"
              >
                {authLoading || isSyncingAction ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Sign in with Google</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Signed-in account card */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Signed In &amp; Synced</span>
                  </div>
                  <div className="text-sm font-bold text-stone-900 truncate mt-0.5">
                    {user.displayName || "Google Account"}
                  </div>
                  {user.email && (
                    <div className="text-xs text-stone-500 truncate">{user.email}</div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={onSignOut}
                  disabled={isSyncingAction}
                  className="text-xs font-semibold px-3 py-2 rounded-lg border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 flex items-center gap-1.5 shrink-0 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>

              {/* Household Sharing Section */}
              <div className="border-t border-stone-200 pt-4 space-y-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-700" />
                  <h3 className="text-sm font-bold text-stone-900">
                    Optional Household Sharing
                  </h3>
                </div>

                {householdId ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                          Active Household
                        </div>
                        <div className="text-base font-bold text-stone-900">
                          {householdName || "Shared Household"}
                        </div>
                      </div>
                      <span className="bg-emerald-700 text-white text-xs font-mono font-bold px-2.5 py-1 rounded-lg tracking-wider">
                        {householdId}
                      </span>
                    </div>

                    <p className="text-xs text-emerald-900 leading-relaxed">
                      Your <strong>My Pantry</strong> and <strong>Walmart List</strong> stay synced live with anyone using this code. Your Favorites, Rut Tracker, and custom meals stay private to you.
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleCopyCode}
                        className="bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
                      >
                        {copiedCode ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Copied Code!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Invite Code</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={onLeaveHousehold}
                        disabled={isSyncingAction}
                        className="text-xs font-semibold text-rose-700 hover:bg-rose-50 px-3 py-2 rounded-lg border border-rose-200 transition-colors"
                      >
                        {isSyncingAction ? "Leaving..." : "Leave Household"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-xs text-stone-600 leading-relaxed">
                      By default your pantry and Walmart list are <strong>100% private</strong>. Want to share them with a partner or roommate? Create a household code or enter theirs below.
                    </p>

                    {/* Create Household */}
                    <form onSubmit={handleCreate} className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 space-y-2.5">
                      <div className="text-xs font-bold text-stone-800">
                        Start a Shared Household
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newHouseholdName}
                          onChange={(e) => setNewHouseholdName(e.target.value)}
                          maxLength={50}
                          placeholder="Household name (e.g. Home Kitchen)"
                          className="flex-1 px-3 py-2 rounded-lg border border-stone-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 text-stone-900"
                        />
                        <button
                          type="submit"
                          disabled={isSyncingAction}
                          className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-semibold px-3.5 py-2 rounded-lg flex items-center gap-1 shrink-0 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Create Code</span>
                        </button>
                      </div>
                    </form>

                    {/* Join Household */}
                    <form onSubmit={handleJoin} className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 space-y-2.5">
                      <div className="text-xs font-bold text-stone-800">
                        Join an Existing Household
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={joinCode}
                          onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                          maxLength={12}
                          placeholder="Enter 8-letter code (e.g. AB34CD56)"
                          className="flex-1 px-3 py-2 rounded-lg border border-stone-300 text-xs font-mono uppercase bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 text-stone-900"
                        />
                        <button
                          type="submit"
                          disabled={isSyncingAction || joinCode.trim().length < 6}
                          className="bg-stone-800 hover:bg-stone-900 disabled:opacity-50 text-white text-xs font-semibold px-3.5 py-2 rounded-lg flex items-center gap-1 shrink-0 transition-colors"
                        >
                          <span>Join</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="bg-stone-800 hover:bg-stone-900 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
