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

const FN_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/roblox-players`;

/**
 * Fetches the live player count for a Roblox game through our backend proxy
 * (the Roblox API itself blocks browser requests with CORS).
 * Pass the Universe ID, not the place ID.
 */
export function useRobloxPlayers(universeId: string): RobloxState {
  const [state, setState] = useState<RobloxState>({ counts: null, error: false, loading: true });

  useEffect(() => {
    if (!universeId || universeId === "0") {
      setState({ counts: null, error: false, loading: false });
      return;
    }
    let cancelled = false;

    const fetchCount = async () => {
      try {
        const res = await fetch(`${FN_BASE}?universeId=${encodeURIComponent(universeId)}`);
        if (!res.ok) throw new Error(String(res.status));
        const json = await res.json();
        if (cancelled) return;
        setState({
          counts: { playing: json.playing ?? 0, visits: json.visits ?? null },
          error: false,
          loading: false,
        });
      } catch {
        if (cancelled) return;
        setState((s) => ({ ...s, error: true, loading: false }));
      }
    };

    void fetchCount();
    const t = setInterval(() => void fetchCount(), 60_000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [universeId]);

  return state;
}
