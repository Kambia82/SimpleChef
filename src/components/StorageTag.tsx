import { Package, Refrigerator, Snowflake } from "lucide-react";
import { MealIngredient } from "../types";
import { inferIngredientStorage, needsFridgeAfterOpening } from "../utils/kitchenProfile";

/**
 * Per-ingredient storage badge, shown only for exceptions: Fridge once opened / Needs Fridge /
 * Needs Freezer. Plain shelf-stable items get no badge — the card header already says so,
 * and tagging every row made the lists look like a wall of identical labels.
 */
export default function StorageTag({ ingredient }: { ingredient: MealIngredient }) {
  const storage = inferIngredientStorage(ingredient);
  const base =
    "inline-flex items-center gap-0.5 px-1.5 py-px rounded text-[10px] font-semibold whitespace-nowrap";

  if (storage === "freezer") {
    return (
      <span className={`${base} bg-sky-50 text-sky-800`}>
        <Snowflake className="w-2.5 h-2.5" aria-hidden="true" />
        Needs Freezer
      </span>
    );
  }
  if (storage === "fridge") {
    return (
      <span className={`${base} bg-blue-50 text-blue-800`}>
        <Refrigerator className="w-2.5 h-2.5" aria-hidden="true" />
        Needs Fridge
      </span>
    );
  }
  if (needsFridgeAfterOpening(ingredient)) {
    return (
      <span
        className={`${base} bg-amber-50 text-amber-800`}
        title="Shelf-stable until opened — leftovers need a fridge. Single-serve sizes avoid this."
      >
        <Package className="w-2.5 h-2.5" aria-hidden="true" />
        Fridge once opened
      </span>
    );
  }
  return null;
}
