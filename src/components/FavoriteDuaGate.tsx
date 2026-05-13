import { useEffect } from "react";
import { useFavoriteDuaStore } from "@/store/favoriteDuaStore";

export function FavoriteDuaGate() {
  const hydrateFavorites = useFavoriteDuaStore((state) => state.hydrateFavorites);

  useEffect(() => {
    void hydrateFavorites();
  }, [hydrateFavorites]);

  return null;
}
