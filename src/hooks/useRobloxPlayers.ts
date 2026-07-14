import { useState, useEffect } from "react";

export interface RobloxCounts {
  playing: number;
  visits: number | null;
}

/**
 * Fetches live player count for a Roblox game.
 * Pass the Universe ID (not the place ID). Find it via:
 *   https://apis.roblox.com/universes/v1/places/<PLACE_ID>/universe
 */
export function useRobloxPlayers(universeId: string) {
  const [counts, setCounts] = useState<RobloxCounts | null>(null);

  useEffect(() => {
    if (!universeId || universeId === "0") return;
    let cancelled = false;

    const fetchCount = () => {
      fetch(`https://games.roblox.com/v1/games?universeIds=${universeId}`)
        .then((r) => r.json())
        .then((json) => {
          if (cancelled) return;
          const game = json?.data?.[0];
          if (game) {
            setCounts({
              playing: game.playing ?? 0,
              visits: game.visits ?? null,
            });
          }
        })
        .catch(() => {});
    };

    fetchCount();
    const t = setInterval(fetchCount, 60_000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [universeId]);

  return counts;
}
