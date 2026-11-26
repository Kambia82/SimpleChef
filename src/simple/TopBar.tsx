import React from "react";
import { BackIcon, HomeIcon } from "./icons";

interface TopBarProps {
  title?: string;
  /** Onboarding step 1–4 shows a progress bar instead of a title. */
  step?: number;
  onBack: () => void;
  onHome?: () => void;
}

export function TopBar({ title, step, onBack, onHome }: TopBarProps) {
  return (
    <div className="topbar">
      <button className="icon-btn" onClick={onBack} aria-label="Back">
        <BackIcon />
      </button>
      {step ? (
        <div className="progress" aria-label={`Step ${step} of 4`}>
          {[1, 2, 3, 4].map((n) => (
            <span key={n} className={n <= step ? "on" : ""} />
          ))}
        </div>
      ) : (
        <h2>{title ?? ""}</h2>
      )}
      {onHome && (
        <button className="icon-btn" onClick={onHome} aria-label="Home">
          <HomeIcon />
        </button>
      )}
    </div>
  );
}
