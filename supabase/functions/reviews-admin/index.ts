// Lovable Cloud function: approve/list design reviews & view contact submissions

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { classifyLogin, hasRealAccess } from "./access.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-key, x-admin-session",
};

const ALLOWED_IPS = ["85.0.237.66"];

type ActionBody =
  | { action: "login"; password: string }
  | { action: "list_logins" }
  | { action: "logout" }
  | { action: "list_pending" }
  | { action: "approve"; id: string }
  | { action: "reject"; id: string }
  | { action: "list_contacts" }
  | { action: "mark_read"; id: string }
  | { action: "reply"; id: string; reply: string }
  | { action: "check_ip" }
  | { action: "delete_review"; id: string };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
                     req.headers.get("cf-connecting-ip") ??
                     req.headers.get("x-real-ip") ?? "";

    const body = (await req.json().catch(() => ({}))) as Partial<ActionBody>;

    // IP-only actions (no admin key needed)
    if (body.action === "check_ip") {
      return new Response(JSON.stringify({ allowed: ALLOWED_IPS.includes(clientIp) }), {
        status: 200,
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    if (body.action === "reply") {
      if (!ALLOWED_IPS.includes(clientIp)) {
        return new Response(JSON.stringify({ error: "Unauthorized IP" }), {
          status: 403,
          headers: { ...corsHeaders, "content-type": "application/json" },
        });
      }
      const id = typeof (body as any)?.id === "string" ? (body as any).id : "";
      const replyText = typeof (body as any)?.reply === "string" ? (body as any).reply.trim() : "";
      if (!id || id.length > 80 || !replyText || replyText.length > 500) {
        return new Response(JSON.stringify({ error: "Invalid id or reply" }), {
          status: 400,
          headers: { ...corsHeaders, "content-type": "application/json" },
        });
      }

      const url = Deno.env.get("SUPABASE_URL");
      const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (!url || !serviceKey) throw new Error("Server configuration missing");
      const supa = createClient(url, serviceKey);
      const { error } = await supa.from("reviews").update({ reply: replyText }).eq("id", id);
      if (error) throw error;

      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    // Delete a review (IP-restricted)
    if (body.action === "delete_review") {
      if (!ALLOWED_IPS.includes(clientIp)) {
        return new Response(JSON.stringify({ error: "Unauthorized IP" }), {
          status: 403,
          headers: { ...corsHeaders, "content-type": "application/json" },
        });
      }
      const id = typeof (body as any)?.id === "string" ? (body as any).id : "";
      if (!id || id.length > 80) {
        return new Response(JSON.stringify({ error: "Invalid id" }), {
          status: 400,
          headers: { ...corsHeaders, "content-type": "application/json" },
        });
      }

      const url = Deno.env.get("SUPABASE_URL");
      const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (!url || !serviceKey) throw new Error("Server configuration missing");
      const supa = createClient(url, serviceKey);
      const { error } = await supa.from("reviews").delete().eq("id", id);
      if (error) throw error;

      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }
    const url = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !serviceKey) throw new Error("Server configuration missing");
    const supabase = createClient(url, serviceKey);
    const respond = (data: unknown, status = 200) => new Response(JSON.stringify(data), {
      status, headers: { ...corsHeaders, "content-type": "application/json", "Cache-Control": "no-store" },
    });
    const hash = async (token: string) => {
      const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
      return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
    };
    if (body.action === "login") {
      const { count, error: countError } = await supabase.from("admin_login_sessions")
        .select("id", { count: "exact", head: true }).eq("ip_address", clientIp || "Unknown")
        .gte("created_at", new Date(Date.now() - 15 * 60 * 1000).toISOString());
      if (countError) throw countError;
      if ((count ?? 0) >= 10) return respond({ error: "Too many attempts. Try again in 15 minutes." }, 429);
      const password = typeof body.password === "string" ? body.password : "";
      const mode = classifyLogin(password, Deno.env.get("ADMIN_PASSWORD") ?? "", Deno.env.get("ADMIN_DECOY_PASSWORD") ?? "");
      // Tokens use platform cryptographic randomness; only their hashes are stored.
      const token = mode === "real" ? crypto.randomUUID() + crypto.randomUUID() : null;
      const { error } = await supabase.from("admin_login_sessions").insert({
        ip_address: clientIp || "Unknown", login_kind: mode, token_hash: token ? await hash(token) : null,
      });
      if (error) throw error;
      if (mode === "failed") return respond({ error: "Invalid password" }, 401);
      return respond({ mode, token });
    }
    const token = req.headers.get("x-admin-session") ?? "";
    const { data: session, error: sessionError } = token ? await supabase.from("admin_login_sessions")
      .select("id,login_kind,expires_at").eq("token_hash", await hash(token)).maybeSingle() : { data: null, error: null };
    if (sessionError) throw sessionError;
    if (!hasRealAccess(session)) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    if (body.action === "logout" && session) {
      const { error } = await supabase.from("admin_login_sessions").update({ expires_at: new Date().toISOString(), token_hash: null }).eq("id", session.id);
      if (error) throw error;
      return respond({ ok: true });
    }
    if (body.action === "list_logins") {
      const { data, error } = await supabase.from("admin_login_sessions")
        .select("id,ip_address,login_kind,created_at,expires_at").order("created_at", { ascending: false }).limit(100);
      if (error) throw error;
      return respond({ logins: data ?? [] });
    }

    // List pending reviews
    if (body.action === "list_pending") {
      const { data, error } = await supabase
        .from("reviews")
        .select("id,name,rating,design,body,created_at")
        .eq("approved", false)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return new Response(JSON.stringify({ pending: data ?? [] }), {
        status: 200,
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    // Approve a review
    if (body.action === "approve") {
      const id = typeof (body as any)?.id === "string" ? (body as any).id : "";
      if (!id || id.length > 80) {
        return new Response(JSON.stringify({ error: "Invalid id" }), {
          status: 400,
          headers: { ...corsHeaders, "content-type": "application/json" },
        });
      }

      const { error } = await supabase.from("reviews").update({ approved: true }).eq("id", id);
      if (error) throw error;

      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    // Reject (delete) a review
    if (body.action === "reject") {
      const id = typeof (body as any)?.id === "string" ? (body as any).id : "";
      if (!id || id.length > 80) {
        return new Response(JSON.stringify({ error: "Invalid id" }), {
          status: 400,
          headers: { ...corsHeaders, "content-type": "application/json" },
        });
      }

      const { error } = await supabase.from("reviews").delete().eq("id", id);
      if (error) throw error;

      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    // List contact submissions
    if (body.action === "list_contacts") {
      const { data, error } = await supabase
        .from("contact_submissions")
        .select("id,name,contact,details,created_at,read")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return new Response(JSON.stringify({ contacts: data ?? [] }), {
        status: 200,
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    // Mark contact as read
    if (body.action === "mark_read") {
      const id = typeof (body as any)?.id === "string" ? (body as any).id : "";
      if (!id || id.length > 80) {
        return new Response(JSON.stringify({ error: "Invalid id" }), {
          status: 400,
          headers: { ...corsHeaders, "content-type": "application/json" },
        });
      }

      const { error } = await supabase.from("contact_submissions").update({ read: true }).eq("id", id);
      if (error) throw error;

      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error)?.message ?? "Server error" }), {
      status: 500,
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  }
});
