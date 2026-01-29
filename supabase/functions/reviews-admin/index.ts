// Lovable Cloud function: approve/list design reviews & view contact submissions

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-key",
};

type ActionBody =
  | { action: "list_pending" }
  | { action: "approve"; id: string }
  | { action: "reject"; id: string }
  | { action: "list_contacts" }
  | { action: "mark_read"; id: string };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const adminKey = req.headers.get("x-admin-key") ?? "";
    const expected = Deno.env.get("REVIEW_ADMIN_KEY") ?? "";
    if (!expected || adminKey !== expected) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    const url = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(url, serviceKey);

    const body = (await req.json().catch(() => ({}))) as Partial<ActionBody>;

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
