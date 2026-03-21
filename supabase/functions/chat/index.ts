import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are the Benefit Bridge AI Assistant. You help users understand government welfare schemes, check their eligibility, and guide them through the application process. 

Key knowledge:
- PM Kisan: ₹6,000/year for farmers. Needs Aadhaar, income certificate, land record.
- Ayushman Bharat: ₹5 lakh health insurance. Needs Aadhaar, income cert, ration card.
- PM Awas Yojana: Housing subsidy up to ₹2.5 lakh. Needs Aadhaar, income cert, address proof.
- Sukanya Samriddhi: Girl child savings, 7.6% interest. Needs Aadhaar, birth certificate.
- PM Ujjwala: Free LPG for BPL women. Needs Aadhaar, BPL card, ration card.
- MGNREGA: 100 days employment. Needs Aadhaar, job card, address proof.
- PM Mudra: Loans up to ₹10 lakh. Needs Aadhaar, business plan, address proof.
- National Scholarship: Up to ₹50,000/year. Needs Aadhaar, income cert, marksheet.

Guide users to upload documents in their Wallet for automatic eligibility checking. Be concise, helpful, and friendly.`,
          },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
