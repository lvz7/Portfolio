import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

function roundDown(n: number, step = 10): string {
  const rounded = Math.floor(n / step) * step;
  return `${rounded}+`;
}

export interface DiscordCounts {
  online: string;
  members: string | null;
}

export function useDiscordMemberCount(guildId: string) {
  const [counts, setCounts] = useState<DiscordCounts | null>(null);

  useEffect(() => {
    let cancelled = false;

    supabase.functions
      .invoke("discord-members", { body: { guild_id: guildId } })
      .then(({ data, error }) => {
        if (cancelled || error || !data) return;
        setCounts({
          online: data.online != null ? roundDown(data.online) : "0+",
          members: data.members != null ? roundDown(data.members) : null,
        });
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [guildId]);

  return counts;
}
