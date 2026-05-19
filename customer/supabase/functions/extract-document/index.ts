import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageBase64, documentType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const prompts: Record<string, string> = {
      aadhaar: `Extract all information from this Aadhaar card image. Return a JSON object with these fields:
        - full_name (string)
        - aadhaar_number (string, 12 digits with spaces)
        - date_of_birth (string, DD/MM/YYYY)
        - gender (string: Male/Female/Other)
        - address (string, full address)
        - phone (string, if visible)
        Only return the JSON object, no other text.`,
      pan: `Extract all information from this PAN card image. Return a JSON object with these fields:
        - full_name (string)
        - pan_number (string, 10 characters)
        - father_name (string)
        - date_of_birth (string, DD/MM/YYYY)
        Only return the JSON object, no other text.`,
      income_certificate: `Extract all information from this Income Certificate. Return a JSON object with these fields:
        - certificate_number (string)
        - holder_name (string)
        - annual_income (number)
        - income_year (string, e.g. "2024-2025")
        - issuing_authority (string)
        Only return the JSON object, no other text.`,
      ration_card: `Extract all information from this Ration Card. Return a JSON object with these fields:
        - card_number (string)
        - head_of_family (string)
        - family_members (array of objects with: name, age, relation)
        - address (string)
        - card_type (string: APL/BPL/AAY)
        Only return the JSON object, no other text.`,
      bank_details: `Extract all information from this bank document (passbook/cheque/statement). Return a JSON object with these fields:
        - account_holder_name (string)
        - account_number (string)
        - ifsc_code (string)
        - bank_name (string)
        - branch_name (string)
        Only return the JSON object, no other text.`,
    };

    const systemPrompt = prompts[documentType] || "Extract all text and data from this document image. Return as JSON.";

    const messages = [
      { role: "system", content: "You are a document data extraction expert. Always respond with valid JSON only, no markdown formatting or code blocks." },
      {
        role: "user",
        content: [
          { type: "text", text: systemPrompt },
          { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
        ],
      },
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI extraction failed");
    }

    const result = await response.json();
    let content = result.choices?.[0]?.message?.content || "{}";
    
    // Clean up markdown code blocks if present
    content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let extracted;
    try {
      extracted = JSON.parse(content);
    } catch {
      extracted = { raw_text: content };
    }

    return new Response(JSON.stringify({ extracted }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("extract-document error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
