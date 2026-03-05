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
      return new Response(JSON.stringify({ error: "OpenAI API key not configured." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { domain } = await req.json();
    if (!domain || typeof domain !== "string" || domain.length > 200) {
      return new Response(JSON.stringify({ error: "Invalid domain" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You are a world-class Google Ads strategist who creates high-converting ad campaigns. Generate a comprehensive, ready-to-publish Google Ads campaign.

Return ONLY valid JSON (no markdown) with this structure:
{
  "name": "Campaign Name",
  "objective": "Campaign objective description",
  "adConcepts": [
    {
      "headline1": "Max 30 chars",
      "headline2": "Max 30 chars",
      "headline3": "Max 30 chars",
      "description1": "Max 90 chars compelling ad copy",
      "description2": "Max 90 chars supporting copy",
      "displayUrl": "domain.com/path",
      "finalUrl": "https://domain.com/landing",
      "callToAction": "CTA text"
    }
  ],
  "targeting": {
    "locations": ["Country1", "Country2"],
    "ageRange": "25-54",
    "genderSplit": "All genders",
    "interests": ["Interest1", "Interest2"],
    "inMarketAudiences": ["Audience1", "Audience2"],
    "customIntentKeywords": ["keyword1", "keyword2"],
    "devices": ["Desktop (60%)", "Mobile (35%)", "Tablet (5%)"],
    "schedule": "Mon-Fri 8AM-8PM"
  },
  "budget": {
    "dailyBudget": "$50 - $150",
    "monthlyBudget": "$1,500 - $4,500",
    "suggestedBid": "$2.50 - $8.00",
    "estimatedCPC": "$3.50 avg",
    "estimatedClicks": "430 - 1,290/month",
    "estimatedImpressions": "15,000 - 45,000/month",
    "estimatedConversionRate": "3.5% - 5.2%"
  },
  "keywords": ["keyword1", "keyword2"],
  "negativeKeywords": ["negative1", "negative2"],
  "adExtensions": ["Extension description 1"],
  "qualityScoreFactors": ["Factor 1"]
}

Generate 3-5 ad concepts. Include 15-20 keywords and 10-15 negative keywords. Be specific and data-driven.`;

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
          { role: "user", content: `Create a comprehensive Google Ads campaign for: ${domain}. Analyze the domain to understand the business and create highly targeted, conversion-optimized ads.` },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI error:", response.status, errText);
      return new Response(JSON.stringify({ error: "Failed to generate ad campaign." }), {
        status: response.status === 429 ? 429 : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    let parsed;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse:", content);
      return new Response(JSON.stringify({ error: "Failed to parse AI response" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ campaign: { id: `campaign-${Date.now()}`, ...parsed } }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-ads error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
