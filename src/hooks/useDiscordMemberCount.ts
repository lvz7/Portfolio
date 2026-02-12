import { useState, useEffect } from "react";

function roundDown(n: number, step = 10): string {
  const rounded = Math.floor(n / step) * step;
  return `${rounded}+`;
}

export function useDiscordMemberCount(guildId: string) {
  const [count, setCount] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`https://discord.com/api/guilds/${guildId}/widget.json`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data?.presence_count != null) {
          setCount(roundDown(data.presence_count));
        } else if (!cancelled && data?.members != null) {
          setCount(roundDown(data.members.length));
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [guildId]);

  return count;
}
