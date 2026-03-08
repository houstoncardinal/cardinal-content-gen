import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function scrapeWebsite(domain: string): Promise<string> {
  const urls = [`https://${domain}`, `https://www.${domain}`];

  for (const url of urls) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; CardinalGenAI/1.0)",
          "Accept": "text/html,application/xhtml+xml",
        },
        signal: controller.signal,
        redirect: "follow",
      });
      clearTimeout(timeout);
      if (!res.ok) continue;

      const html = await res.text();
      const cleaned = html
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<svg[\s\S]*?<\/svg>/gi, "");

      const metaDesc = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)?.[1] || "";
      const pageTitle = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || "";
      const ogSiteName = html.match(/<meta[^>]*property=["']og:site_name["'][^>]*content=["']([^"']+)["']/i)?.[1] || "";

      const textContent = cleaned.replace(/<[^>]+>/g, " ").replace(/&[a-zA-Z]+;/g, " ").replace(/\s+/g, " ").trim().slice(0, 5000);
      const headings = [...html.matchAll(/<h[1-3][^>]*>([^<]+)<\/h[1-3]>/gi)].map(m => m[1].trim()).filter(h => h.length > 2).slice(0, 20);

      const hasPricing = /pric(e|ing)|plan|subscription|\$\d/i.test(html);
      const hasProducts = /product|shop|cart|buy now|store/i.test(html);
      const hasServices = /service|solution|consulting|agency|we help/i.test(html);

      const signals = [];
      if (hasPricing) signals.push("HAS_PRICING");
      if (hasProducts) signals.push("SELLS_PRODUCTS");
      if (hasServices) signals.push("OFFERS_SERVICES");

      return `
=== WEBSITE ANALYSIS: ${domain} ===
TITLE: ${pageTitle}
SITE NAME: ${ogSiteName}
DESCRIPTION: ${metaDesc}
SIGNALS: ${signals.join(", ") || "GENERAL"}
HEADINGS: ${headings.join(" | ")}
CONTENT: ${textContent.slice(0, 4000)}
=== END ===`;
    } catch (e) {
      console.log(`Failed to fetch ${url}:`, e instanceof Error ? e.message : e);
    }
  }
  return `Could not scrape ${domain}. Infer from domain name only.`;
}

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

    const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, "").replace(/\/+$/, "");
    console.log(`Scraping for ads: ${cleanDomain}`);
    const websiteAnalysis = await scrapeWebsite(cleanDomain);
    console.log(`Analysis complete: ${websiteAnalysis.length} chars`);

    const systemPrompt = `You are a world-class Google Ads strategist. You have been given a DEEP ANALYSIS of a company's actual website. Use this to create a hyper-targeted, high-converting Google Ads campaign.

CRITICAL: Use the website analysis to understand:
1. Their EXACT products/services (reference them specifically in ad copy)
2. Their pricing model and price points
3. Their target market and audience
4. Their competitive advantages and USPs
5. Industry-specific keywords they actually use
6. Their brand voice and messaging

Return ONLY valid JSON (no markdown) with this structure:
{
  "name": "Campaign Name",
  "objective": "Campaign objective based on their actual business goals",
  "companyInsight": "Brief summary of what the analysis revealed about this business",
  "adConcepts": [
    {
      "headline1": "Max 30 chars - reference their actual services",
      "headline2": "Max 30 chars",
      "headline3": "Max 30 chars",
      "description1": "Max 90 chars compelling ad copy using their actual value props",
      "description2": "Max 90 chars supporting copy",
      "displayUrl": "domain.com/relevant-path",
      "finalUrl": "https://domain.com/landing",
      "callToAction": "CTA text"
    }
  ],
  "targeting": {
    "locations": ["Relevant locations based on their market"],
    "ageRange": "Based on their audience",
    "genderSplit": "Based on their audience",
    "interests": ["Specific interests relevant to their niche"],
    "inMarketAudiences": ["Specific in-market audiences"],
    "customIntentKeywords": ["Based on their actual website keywords"],
    "devices": ["Desktop (X%)", "Mobile (X%)", "Tablet (X%)"],
    "schedule": "Optimal schedule for their business type"
  },
  "budget": {
    "dailyBudget": "$X - $X based on their industry CPC",
    "monthlyBudget": "$X - $X",
    "suggestedBid": "$X - $X",
    "estimatedCPC": "$X avg for their industry",
    "estimatedClicks": "X - X/month",
    "estimatedImpressions": "X - X/month",
    "estimatedConversionRate": "X% - X% (industry benchmark)"
  },
  "keywords": ["keywords from their actual website content"],
  "negativeKeywords": ["negative keywords specific to their industry"],
  "adExtensions": ["Extensions relevant to their business type"],
  "qualityScoreFactors": ["Factors specific to their business"]
}

Generate 4-5 ad concepts. Include 20+ keywords from their actual site content and 15+ negative keywords. Be data-driven and industry-specific.`;

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
          {
            role: "user",
            content: `Here is the DEEP WEBSITE ANALYSIS:\n\n${websiteAnalysis}\n\nCreate a comprehensive, high-converting Google Ads campaign based on this company's actual offerings, messaging, and target market. Every ad concept should reference their real services and value propositions.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 5000,
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
