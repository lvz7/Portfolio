const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const DISCORD_BOT_TOKEN = Deno.env.get("DISCORD_BOT_TOKEN");
  if (!DISCORD_BOT_TOKEN) {
    return new Response(JSON.stringify({ error: "Bot token not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let guildId: string | null = null;
  const url = new URL(req.url);
  guildId = url.searchParams.get("guild_id");

  if (!guildId && req.method === "POST") {
    try {
      const body = await req.json();
      guildId = body.guild_id ?? null;
    } catch { /* ignore */ }
  }

  if (!guildId) {
    return new Response(JSON.stringify({ error: "guild_id required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const guildRes = await fetch(`https://discord.com/api/v10/guilds/${guildId}?with_counts=true`, {
      headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` },
    });

    if (!guildRes.ok) {
      const err = await guildRes.text();
      console.error("Discord API error:", guildRes.status, err);
      return new Response(JSON.stringify({ error: "Failed to fetch guild" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const guild = await guildRes.json();

    return new Response(JSON.stringify({
      members: guild.approximate_member_count ?? null,
      online: guild.approximate_presence_count ?? null,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
