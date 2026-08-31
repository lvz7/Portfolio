import { useState, useEffect } from "react";

export interface RobloxCounts {
  playing: number;
  visits: number | null;
}

interface RobloxState {
  counts: RobloxCounts | null;
  error: boolean;
  loading: boolean;
}

/**
 * Fetches live player count for a Roblox game.
 * Pass the Universe ID (not the place ID). Find it via:
 *   https://apis.roblox.com/universes/v1/places/<PLACE_ID>/universe
 */
export function useRobloxPlayers(universeId: string): RobloxState {
  const [state, setState] = useState<RobloxState>({ counts: null, error: false, loading: true });

  useEffect(() => {
    if (!universeId || universeId === "0") {
      setState({ counts: null, error: false, loading: false });
      return;
    }
    let cancelled = false;

    const fetchCount = () => {
      fetch(`https://games.roblox.com/v1/games?universeIds=${universeId}`)
        .then((r) => {
          if (!r.ok) throw new Error(`Roblox API ${r.status}`);
          return r.json();
        })
        .then((json) => {
          if (cancelled) return;
          const game = json?.data?.[0];
          if (game) {
            setState({
              counts: {
                playing: game.playing ?? 0,
                visits: game.visits ?? null,
              },
              error: false,
              loading: false,
            });
          } else {
            setState({ counts: null, error: true, loading: false });
          }
        })
        .catch(() => {
          if (cancelled) return;
          setState((s) => ({ ...s, error: true, loading: false }));
        });
    };

    fetchCount();
    const t = setInterval(fetchCount, 60_000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [universeId]);

  return state;
}

