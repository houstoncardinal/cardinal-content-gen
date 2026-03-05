import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "OpenAI API key not configured. Please add your OPENAI_API_KEY in project settings." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { domain } = await req.json();
    if (!domain || typeof domain !== "string" || domain.length > 200) {
      return new Response(JSON.stringify({ error: "Invalid domain" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    const systemPrompt = `You are an elite social media strategist and content marketing expert. You create Google E-E-A-T compliant, SEO-optimized content calendars for businesses. Today's date is ${todayStr}.

RULES:
- Generate exactly 30 days of content starting from today (${todayStr})
- Skip Sundays for a lighter schedule
- Each post must demonstrate E-E-A-T signals (Experience, Expertise, Authoritativeness, Trustworthiness)
- Include SEO-optimized captions with strategic hashtags
- Vary platforms: instagram, facebook, linkedin, twitter
- Vary content types: image, carousel, video, text
- Make captions compelling, professional, and conversion-focused
- Include relevant industry hashtags and SEO keywords
- Each post should have a unique angle and value proposition

Return ONLY valid JSON with this exact structure (no markdown, no code blocks):
{
  "posts": [
    {
      "date": "YYYY-MM-DD",
      "dayOfWeek": "Monday",
      "platform": "instagram",
      "type": "image",
      "title": "Post Title",
      "caption": "Full caption with emojis and call to action",
      "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4"],
      "seoKeywords": ["keyword1", "keyword2", "keyword3"],
      "eeatSignal": "Experience: Description of signal"
    }
  ]
}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generate a 30-day content calendar for the company: ${domain}. Research the domain name to understand their industry and create highly relevant, powerful content that will drive engagement, build authority, and generate leads.` },
        ],
        temperature: 0.8,
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI error:", response.status, errText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited by OpenAI. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "Failed to generate content. Check your OpenAI API key." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(JSON.stringify({ error: "No content generated" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse the JSON from the response, handling potential markdown wrapping
    let parsed;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", content);
      return new Response(JSON.stringify({ error: "Failed to parse AI response" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ calendar: parsed, domain, generatedAt: todayStr }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-content error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
