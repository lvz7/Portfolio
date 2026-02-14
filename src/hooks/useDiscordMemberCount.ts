import { useState, useEffect } from "react";

function roundDown(n: number, step = 10): string {
  const rounded = Math.floor(n / step) * step;
  return `${rounded}+`;
}

export interface DiscordCounts {
  online: string;
}

export function useDiscordMemberCount(guildId: string) {
  const [counts, setCounts] = useState<DiscordCounts | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(`https://discord.com/api/guilds/${guildId}/widget.json`)
      .then((res) => {
        if (!res.ok) throw new Error("widget disabled");
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setCounts({
          online: data.presence_count != null ? roundDown(data.presence_count) : "0+",
        });
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [guildId]);

  return counts;
}
