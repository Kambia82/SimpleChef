import React from "react";
import type { KitchenSetup } from "./types";
import { classicsLabel, fridgeLevel, greetingForHour, mealTypeForHour } from "./logic";
import { BasketIcon, CouchIcon, HeartIcon, ListIcon, PotIcon, SparkleIcon, ThreeIcon } from "./icons";

export type MenuAction = "pick" | "three" | "low" | "classics" | "usehave" | "favs" | "grocery" | "setup";

interface HomeProps {
  setup: KitchenSetup;
  onHandCount: number;
  favoritesCount: number;
  groceryCount: number;
  onAction: (action: MenuAction) => void;
}

const KITCHEN_NAMES: Record<KitchenSetup["kitchen"], string> = {
  full: "Full kitchen",
  micro: "Microwave only",
  dorm: "Dorm room",
  barracks: "Barracks",
};
const FRIDGE_NAMES: Record<KitchenSetup["fridge"], string> = {
  full: "full fridge",
  mini: "mini fridge",
  none: "no fridge",
};

export function HomeScreen({ setup, onHandCount, favoritesCount, groceryCount, onAction }: HomeProps) {
  const hour = new Date().getHours();
  const meal = mealTypeForHour(hour);
  const noFridge = fridgeLevel(setup) === 0;
  const summary = [
    KITCHEN_NAMES[setup.kitchen],
    setup.kitchen === "full" ? null : FRIDGE_NAMES[setup.fridge],
    `${setup.servings} ${setup.servings === 1 ? "serving" : "servings"}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <section className="screen">
      <div className="home-head">
        <div>
          <p className="eyebrow">{greetingForHour(hour)}</p>
          <h1 style={{ fontSize: "2rem", marginTop: 4 }}>What sounds good?</h1>
        </div>
        <button className="setup-pill" onClick={() => onAction("setup")}>
          <span>{summary}</span>
          <b>Change</b>
        </button>
      </div>
      <div className="menu">
        <button className="tile big" onClick={() => onAction("pick")}>
          <SparkleIcon />
          <span>
            <b>Pick a {meal} for me</b>
            <small>One idea, no decisions</small>
          </span>
        </button>
        <button className="tile t1" onClick={() => onAction("three")}>
          <ThreeIcon />
          <span>
            <b>Show me 3 ideas</b>
            <small>Compare and choose</small>
          </span>
        </button>
        <button className="tile t2" onClick={() => onAction("low")}>
          <CouchIcon />
          <span>
            <b>Low effort</b>
            <small>Few steps, little cleanup</small>
          </span>
        </button>
        <button className="tile t3" onClick={() => onAction("classics")}>
          <PotIcon />
          <span>
            <b>{classicsLabel(setup)}</b>
            <small>{noFridge ? "No-fridge comfort food" : "Real dishes, made easy"}</small>
          </span>
        </button>
        <button className="tile t4" onClick={() => onAction("usehave")}>
          <BasketIcon />
          <span>
            <b>Use what I have</b>
            <small>{onHandCount ? `${onHandCount} ${onHandCount === 1 ? "item" : "items"} on hand` : "Add what's on hand"}</small>
          </span>
        </button>
        <button className="tile t5" onClick={() => onAction("favs")}>
          <HeartIcon />
          <span>
            <b>Favorites</b>
            <small>{favoritesCount} saved</small>
          </span>
        </button>
        <button className="tile t6" onClick={() => onAction("grocery")}>
          <ListIcon />
          <span>
            <b>Grocery list</b>
            <small>{groceryCount ? `${groceryCount} meals added` : "Sorted by Walmart aisle"}</small>
          </span>
        </button>
      </div>
    </section>
  );
}
