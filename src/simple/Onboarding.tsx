import React from "react";
import type { Appliance, FridgeAccess, KitchenKind, KitchenSetup, MicrowaveAccess } from "./types";
import { fridgeLevel } from "./logic";
import { TopBar } from "./TopBar";
import { BarracksIcon, DormIcon, HeroArt, MicrowaveIcon, StoveIcon } from "./icons";

export function WelcomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <section className="screen welcome">
      <HeroArt />
      <div>
        <h1>Simple Chef</h1>
        <p className="tag">Easy meals you can actually remember.</p>
        <p className="lede">Real food with shortcuts. Few ingredients, few steps, made for the kitchen you really have.</p>
        <div className="who">
          <span>Dorms</span>
          <span>Barracks</span>
          <span>Busy parents</span>
          <span>Low-energy days</span>
        </div>
      </div>
      <button className="btn btn-primary btn-block" onClick={onStart}>
        Get started
      </button>
    </section>
  );
}

const KITCHENS: Array<{ id: KitchenKind; title: string; sub: string; Icon: React.FC }> = [
  { id: "full", title: "Full Kitchen", sub: "Stove, oven, the works", Icon: StoveIcon },
  { id: "micro", title: "Microwave Only", sub: "Apartment or home, no stove", Icon: MicrowaveIcon },
  { id: "dorm", title: "Dorm Room", sub: "Your room, shared space", Icon: DormIcon },
  { id: "barracks", title: "Barracks", sub: "Eating in your room", Icon: BarracksIcon },
];
const APPLIANCES: Appliance[] = ["stove", "oven", "microwave", "air fryer", "toaster"];
const FRIDGES: Array<[FridgeAccess, string]> = [
  ["full", "Full fridge & freezer"],
  ["mini", "Mini fridge"],
  ["none", "No fridge"],
];
const MICROWAVES: Array<[MicrowaveAccess, string]> = [
  ["mine", "In my room"],
  ["shared", "Shared"],
  ["none", "No microwave"],
];
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

/** Draft setup while onboarding; fridge/microwave start unanswered (null). */
export interface SetupDraft {
  kitchen: KitchenKind | null;
  appliances: Appliance[];
  fridge: FridgeAccess | null;
  microwave: MicrowaveAccess | null;
  servings: number;
}

export function draftIsReady(d: SetupDraft): boolean {
  if (d.kitchen === "full") return d.appliances.length > 0;
  if (d.kitchen === "micro") return d.fridge !== null;
  if (d.kitchen) return d.fridge !== null && d.microwave !== null;
  return false;
}

export function draftToSetup(d: SetupDraft): KitchenSetup {
  return {
    kitchen: d.kitchen ?? "full",
    appliances: d.appliances,
    fridge: d.fridge ?? "full",
    microwave: d.kitchen === "micro" ? "mine" : d.microwave ?? "mine",
    servings: d.servings,
  };
}

interface StepProps {
  draft: SetupDraft;
  onChange: (next: SetupDraft) => void;
  onNext: () => void;
  onBack: () => void;
}

export function KitchenScreen({ draft, onChange, onNext, onBack }: StepProps) {
  const set = (patch: Partial<SetupDraft>) => onChange({ ...draft, ...patch });
  return (
    <section className="screen">
      <TopBar step={1} onBack={onBack} />
      <div className="stack">
        <div>
          <h1 style={{ fontSize: "1.9rem" }}>Where are you cooking?</h1>
          <p className="lede">This decides which meals you'll see.</p>
        </div>
        <div className="choices">
          {KITCHENS.map(({ id, title, sub, Icon }) => (
            <button
              key={id}
              className="choice"
              aria-pressed={draft.kitchen === id}
              onClick={() =>
                set({ kitchen: id, microwave: id === "micro" ? "mine" : id === draft.kitchen ? draft.microwave : null })
              }
            >
              <Icon />
              <b>{title}</b>
              <small>{sub}</small>
            </button>
          ))}
        </div>

        {draft.kitchen === "full" && (
          <div className="question">
            <h3>What do you have?</h3>
            <div className="seg">
              {APPLIANCES.map((a) => (
                <button
                  key={a}
                  className="pill"
                  aria-pressed={draft.appliances.includes(a)}
                  onClick={() =>
                    set({
                      appliances: draft.appliances.includes(a)
                        ? draft.appliances.filter((x) => x !== a)
                        : [...draft.appliances, a],
                    })
                  }
                >
                  {cap(a)}
                </button>
              ))}
            </div>
          </div>
        )}

        {draft.kitchen && draft.kitchen !== "full" && (
          <div className="question">
            <h3>Do you have a fridge?</h3>
            <div className="seg">
              {FRIDGES.map(([v, label]) => (
                <button key={v} className="pill" aria-pressed={draft.fridge === v} onClick={() => set({ fridge: v })}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {(draft.kitchen === "dorm" || draft.kitchen === "barracks") && (
          <div className="question">
            <h3>Microwave?</h3>
            <div className="seg">
              {MICROWAVES.map(([v, label]) => (
                <button key={v} className="pill" aria-pressed={draft.microwave === v} onClick={() => set({ microwave: v })}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="footer-actions">
        <button className="btn btn-primary btn-block" disabled={!draftIsReady(draft)} onClick={onNext}>
          Next
        </button>
      </div>
    </section>
  );
}

const SERVINGS: Array<[number, string]> = [
  [1, "Just me"],
  [2, "Two"],
  [4, "Family"],
  [6, "Crowd"],
];

export function ServingsScreen({ draft, onChange, onNext, onBack }: StepProps) {
  return (
    <section className="screen">
      <TopBar step={2} onBack={onBack} />
      <div className="stack">
        <div>
          <h1 style={{ fontSize: "1.9rem" }}>How many are you feeding?</h1>
          <p className="lede">Amounts adjust for you. You can change it on any recipe.</p>
        </div>
        <div className="servings">
          {SERVINGS.map(([n, label]) => (
            <button key={n} className="pill" aria-pressed={draft.servings === n} onClick={() => onChange({ ...draft, servings: n })}>
              {n}
              <small>{label}</small>
            </button>
          ))}
        </div>
      </div>
      <div className="footer-actions">
        <button className="btn btn-primary btn-block" onClick={onNext}>
          Next
        </button>
      </div>
    </section>
  );
}

export const ON_HAND_GROUPS: Record<"Fridge" | "Pantry" | "Freezer", string[]> = {
  Fridge: ["eggs", "cheese", "milk", "butter", "chicken", "ground beef", "tortillas", "sour cream", "yogurt"],
  Pantry: ["bread", "ramen", "rice", "peanut butter", "chili", "chips", "pasta", "tuna", "oats", "salsa", "soy sauce", "potatoes"],
  Freezer: ["shrimp", "frozen veggies", "meatballs"],
};

interface OnHandProps {
  setup: KitchenSetup;
  onHand: Set<string>;
  onToggle: (key: string) => void;
  onDone: () => void;
  onBack: () => void;
  /** Onboarding shows the progress bar; from the home menu it's a normal page. */
  fromOnboarding: boolean;
}

export function OnHandScreen({ setup, onHand, onToggle, onDone, onBack, fromOnboarding }: OnHandProps) {
  const level = fridgeLevel(setup);
  const groups = (Object.entries(ON_HAND_GROUPS) as Array<[keyof typeof ON_HAND_GROUPS, string[]]>).filter(
    ([g]) => !(g === "Fridge" && level === 0) && !(g === "Freezer" && level < 2)
  );
  return (
    <section className="screen">
      <TopBar step={fromOnboarding ? 3 : undefined} title="What you have" onBack={onBack} />
      <div className="stack">
        <div>
          <h1 style={{ fontSize: "1.9rem" }}>What do you already have?</h1>
          <p className="lede">Tap what's in your room or kitchen. Optional.</p>
        </div>
        {groups.map(([group, items]) => (
          <div className="chip-group" key={group}>
            <h3>{group}</h3>
            <div className="chips">
              {items.map((k) => (
                <button key={k} className="pill" aria-pressed={onHand.has(k)} onClick={() => onToggle(k)}>
                  {cap(k)}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="footer-actions">
        <button className="btn btn-primary btn-block" onClick={onDone}>
          {onHand.size ? `Done · ${onHand.size} items` : "Done"}
        </button>
        {fromOnboarding && (
          <button className="btn btn-ghost btn-block" onClick={onDone}>
            Skip for now
          </button>
        )}
      </div>
    </section>
  );
}
