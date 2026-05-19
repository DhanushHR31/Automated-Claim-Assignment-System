// @ts-nocheck
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages = [], context } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured in Supabase Secrets");

    const systemPrompt = `You are ClaimAssign AI Assistant — a helpful, concise assistant for an insurance claim management system.
You help managers and field agents with:
- Understanding claim details, statuses, and workflows
- Agent assignment recommendations and scoring
- Navigation and location guidance
- Insurance document requirements
- Performance metrics interpretation
- General insurance claim process questions

Context about the current page: ${context || "general"}

Keep answers brief and actionable. Use bullet points when listing multiple items. If asked about specific data you don't have, suggest where to find it in the app.`;

    const contents = messages.map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        system_instruction: { parts: [{ text: systemPrompt }] },
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Unknown error" }));
      return new Response(JSON.stringify({ error: error.message || "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const reader = response.body?.getReader();

    if (!reader) throw new Error("Response body is empty");

    (async () => {
      const decoder = new TextDecoder();
      const encoder = new TextEncoder();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          
          // Gemini stream is a JSON array that grows: [obj1, obj2, ...]
          // But it can also be sent in chunks. 
          // For a simple implementation, we'll try to find full JSON objects.
          // However, for standard SSE translation:
          try {
            // A very simple regex-based extraction for streaming chunks
            const matches = buffer.matchAll(/"text":\s*"((?:[^"\\]|\\.)*)"/g);
            for (const match of matches) {
              const text = JSON.parse(`"${match[1]}"`); // Unescape string
              const sseData = `data: ${JSON.stringify({ choices: [{ delta: { content: text } }] })}\n\n`;
              await writer.write(encoder.encode(sseData));
            }
            // Clear the buffer of parts we've already processed (simplified)
            const lastIdx = buffer.lastIndexOf("}");
            if (lastIdx !== -1) buffer = buffer.slice(lastIdx + 1);
          } catch (e) {
            // Wait for more data
          }
        }
        await writer.write(encoder.encode("data: [DONE]\n\n"));
      } catch (err) {
        console.error("Streaming error:", err);
      } finally {
        writer.close();
      }
    })();

    return new Response(readable, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-assistant error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
