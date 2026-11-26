import React from "react";

type IconProps = { size?: number };
const svg = (viewBox: string, children: React.ReactNode) =>
  function Icon({ size }: IconProps) {
    return (
      <svg className="i" viewBox={viewBox} aria-hidden="true" style={size ? { width: size, height: size } : undefined}>
        {children}
      </svg>
    );
  };

export const BackIcon = svg("0 0 24 24", <path d="M15 5l-7 7 7 7" />);
export const HomeIcon = svg("0 0 24 24", <path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1z" />);
export const StoveIcon = svg(
  "0 0 32 32",
  <>
    <rect x="4" y="3" width="24" height="26" rx="3" />
    <circle cx="11" cy="10" r="3" />
    <circle cx="21" cy="10" r="3" />
    <rect x="8" y="17" width="16" height="8" rx="1.5" />
  </>
);
export const MicrowaveIcon = svg(
  "0 0 32 32",
  <>
    <rect x="2" y="7" width="28" height="19" rx="3" />
    <rect x="6" y="11" width="15" height="11" rx="1.5" />
    <circle cx="25.5" cy="13" r="1.4" />
    <path d="M24 18.5h3M24 22h3" />
  </>
);
export const DormIcon = svg(
  "0 0 32 32",
  <>
    <path d="M5 29V10l11-6 11 6v19" />
    <path d="M3 29h26" />
    <rect x="10" y="12" width="4" height="4" />
    <rect x="18" y="12" width="4" height="4" />
    <path d="M14 29v-7h4v7" />
  </>
);
export const BarracksIcon = svg(
  "0 0 32 32",
  <>
    <path d="M5 4v25M27 4v25" />
    <rect x="5" y="8" width="22" height="5" rx="1.5" />
    <rect x="5" y="20" width="22" height="5" rx="1.5" />
    <path d="M9 8V6.5M9 20v-1.5" />
  </>
);
export const SparkleIcon = svg(
  "0 0 32 32",
  <>
    <path d="M15 3l2.6 7.4L25 13l-7.4 2.6L15 23l-2.6-7.4L5 13l7.4-2.6z" />
    <path d="M25 21l1 3 3 1-3 1-1 3-1-3-3-1 3-1z" />
  </>
);
export const ThreeIcon = svg(
  "0 0 32 32",
  <>
    <rect x="4" y="4" width="10" height="10" rx="2" />
    <rect x="18" y="4" width="10" height="10" rx="2" />
    <rect x="11" y="18" width="10" height="10" rx="2" />
  </>
);
export const CouchIcon = svg(
  "0 0 32 32",
  <>
    <path d="M6 17v-5a3 3 0 013-3h14a3 3 0 013 3v5" />
    <rect x="3" y="15" width="26" height="9" rx="3" />
    <path d="M7 24v4M25 24v4" />
  </>
);
export const PotIcon = svg(
  "0 0 32 32",
  <>
    <path d="M5 13h22v8a6 6 0 01-6 6H11a6 6 0 01-6-6z" />
    <path d="M2 13h28M12 9c0-2 2-2 2-4M18 9c0-2 2-2 2-4" />
  </>
);
export const BasketIcon = svg(
  "0 0 32 32",
  <>
    <path d="M4 12h24l-2.5 14a2 2 0 01-2 1.6H8.5a2 2 0 01-2-1.6z" />
    <path d="M10 12l5-7M22 12l-5-7M12 17v6M20 17v6M16 17v6" />
  </>
);
export const HeartIcon = svg(
  "0 0 32 32",
  <path d="M16 27s-11-6.5-11-14a6 6 0 0111-3.3A6 6 0 0127 13c0 7.5-11 14-11 14z" />
);
export const ListIcon = svg(
  "0 0 32 32",
  <>
    <rect x="7" y="5" width="18" height="24" rx="2.5" />
    <path d="M12 5V3.5h8V5M11 13h10M11 18h10M11 23h6" />
  </>
);

/** Food illustration for the welcome screen. Colors come from the theme tokens. */
export function HeroArt() {
  return (
    <svg className="hero-art" viewBox="0 0 360 250" role="img" aria-label="A warm bowl of noodles next to a breakfast sandwich">
      <circle cx="180" cy="140" r="104" style={{ fill: "var(--yolk-soft)" }} />
      <path d="M150 46c-8 12 8 18 0 30M180 38c-8 12 8 18 0 30M210 46c-8 12 8 18 0 30" style={{ fill: "none", stroke: "var(--muted)", strokeWidth: 4, strokeLinecap: "round", opacity: 0.5 }} />
      <path d="M84 120h192a96 82 0 01-192 0z" style={{ fill: "var(--basil)" }} />
      <ellipse cx="180" cy="120" rx="96" ry="18" style={{ fill: "var(--plate-1)" }} />
      <path d="M110 118c14-10 24 6 38-2s22 8 36-2 24 6 38-2 18 6 28 2" style={{ fill: "none", stroke: "var(--yolk)", strokeWidth: 7, strokeLinecap: "round" }} />
      <path d="M118 126c14-8 26 4 40-2s22 6 36-2 22 4 34-1" style={{ fill: "none", stroke: "var(--yolk)", strokeWidth: 6, strokeLinecap: "round", opacity: 0.8 }} />
      <circle cx="150" cy="112" r="12" style={{ fill: "var(--surface)" }} />
      <circle cx="150" cy="112" r="6" style={{ fill: "var(--yolk)" }} />
      <circle cx="206" cy="110" r="7" style={{ fill: "var(--tomato)" }} />
      <circle cx="222" cy="118" r="6" style={{ fill: "var(--tomato)" }} />
      <path d="M232 104c10-12 24-8 26 0-10 6-18 6-26 0z" style={{ fill: "var(--basil-soft)", stroke: "var(--basil)", strokeWidth: 2 }} />
      <rect x="258" y="74" width="22" height="70" rx="5" transform="rotate(20 269 109)" style={{ fill: "var(--tomato)" }} />
      <rect x="272" y="70" width="8" height="78" rx="4" transform="rotate(32 276 109)" style={{ fill: "var(--muted)", opacity: 0.55 }} />
      <ellipse cx="74" cy="206" rx="46" ry="14" style={{ fill: "var(--yolk)" }} />
      <rect x="32" y="190" width="84" height="10" rx="5" style={{ fill: "var(--basil)" }} />
      <rect x="34" y="182" width="80" height="9" rx="4" style={{ fill: "var(--surface)", stroke: "var(--line)" }} />
      <ellipse cx="74" cy="176" rx="44" ry="14" style={{ fill: "var(--yolk)" }} />
      <circle cx="60" cy="172" r="1.6" style={{ fill: "var(--ink)" }} />
      <circle cx="78" cy="169" r="1.6" style={{ fill: "var(--ink)" }} />
      <circle cx="90" cy="175" r="1.6" style={{ fill: "var(--ink)" }} />
      <circle cx="66" cy="178" r="1.6" style={{ fill: "var(--surface)" }} />
    </svg>
  );
}
