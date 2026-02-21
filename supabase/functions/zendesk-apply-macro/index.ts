import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { ticketId, macroContent, zendeskSubdomain, zendeskEmail, zendeskToken } = await req.json();

    if (!ticketId || !macroContent || !zendeskSubdomain || !zendeskEmail || !zendeskToken) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: ticketId, macroContent, zendeskSubdomain, zendeskEmail, zendeskToken" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Apply macro as a comment on the ticket
    const zendeskUrl = `https://${zendeskSubdomain}.zendesk.com/api/v2/tickets/${ticketId}.json`;
    const credentials = btoa(`${zendeskEmail}/token:${zendeskToken}`);

    const zendeskRes = await fetch(zendeskUrl, {
      method: "PUT",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ticket: {
          comment: {
            body: macroContent,
            public: true,
          },
        },
      }),
    });

    if (!zendeskRes.ok) {
      const errorBody = await zendeskRes.text();
      return new Response(
        JSON.stringify({ error: "Zendesk API error", details: errorBody }),
        { status: zendeskRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await zendeskRes.json();
    return new Response(JSON.stringify({ success: true, ticket: result.ticket }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
