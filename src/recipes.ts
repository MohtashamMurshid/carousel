import { DEFAULT_HANDLE, RECIPE_SLIDES } from "./fixtures";
import { normalizePayload } from "./lib";
import type { DeckPayload, RecipeId } from "./types";

export function buildRecipe(id: RecipeId): DeckPayload {
  switch (id) {
    case "wide-pan":
      return normalizePayload({
        p: 2,
        h: DEFAULT_HANDLE,
        s: RECIPE_SLIDES.map((slide) => ({ ...slide })),
      });
    default: {
      const _never: never = id;
      return _never;
    }
  }
}
