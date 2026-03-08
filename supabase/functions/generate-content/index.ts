import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function scrapeWebsite(domain: string): Promise<string> {
  const urls = [
    `https://${domain}`,
    `https://www.${domain}`,
  ];

  for (const url of urls) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; CardinalGenAI/1.0; +https://cardinalgenai.com)",
          "Accept": "text/html,application/xhtml+xml",
        },
        signal: controller.signal,
        redirect: "follow",
      });
      clearTimeout(timeout);

      if (!res.ok) continue;
      const html = await res.text();

      // Extract meaningful text content
      const cleaned = html
        // Remove scripts, styles, SVGs
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<svg[\s\S]*?<\/svg>/gi, "")
        .replace(/<nav[\s\S]*?<\/nav>/gi, "")
        // Extract meta description
        .replace(/.*/, "");

      // Get meta description
      const metaDesc = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)?.[1] || "";
      // Get meta keywords
      const metaKeywords = html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']+)["']/i)?.[1] || "";
      // Get title
      const pageTitle = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || "";
      // Get OG data
      const ogType = html.match(/<meta[^>]*property=["']og:type["'][^>]*content=["']([^"']+)["']/i)?.[1] || "";
      const ogSiteName = html.match(/<meta[^>]*property=["']og:site_name["'][^>]*content=["']([^"']+)["']/i)?.[1] || "";

      // Extract all visible text
      const textContent = cleaned
        .replace(/<[^>]+>/g, " ")
        .replace(/&[a-zA-Z]+;/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 6000);

      // Extract heading structure
      const headings = [...html.matchAll(/<h[1-3][^>]*>([^<]+)<\/h[1-3]>/gi)]
        .map(m => m[1].trim())
        .filter(h => h.length > 2)
        .slice(0, 20);

      // Extract links text for nav/services
      const linkTexts = [...html.matchAll(/<a[^>]*>([^<]{3,40})<\/a>/gi)]
        .map(m => m[1].trim())
        .filter((v, i, a) => a.indexOf(v) === i)
        .slice(0, 30);

      // Look for pricing signals
      const hasPricing = /pric(e|ing)|plan|subscription|\$\d|€\d|£\d/i.test(html);
      // Look for product signals
      const hasProducts = /product|shop|cart|add to bag|buy now|store/i.test(html);
      // Look for service signals
      const hasServices = /service|solution|consulting|agency|we help|we provide/i.test(html);
      // Look for healthcare signals
      const isHealthcare = /health|medical|patient|clinic|doctor|therapy|wellness/i.test(html);
      // Look for tech signals
      const isTech = /software|saas|api|platform|app|cloud|data|ai|machine learning/i.test(html);
      // Look for ecommerce
      const isEcommerce = /shop|store|cart|checkout|product|catalog/i.test(html);

      const businessSignals = [];
      if (hasPricing) businessSignals.push("HAS_PRICING_PAGE");
      if (hasProducts) businessSignals.push("SELLS_PRODUCTS");
      if (hasServices) businessSignals.push("OFFERS_SERVICES");
      if (isHealthcare) businessSignals.push("HEALTHCARE_INDUSTRY");
      if (isTech) businessSignals.push("TECHNOLOGY_COMPANY");
      if (isEcommerce) businessSignals.push("ECOMMERCE");

      return `
=== WEBSITE ANALYSIS FOR ${domain} ===
PAGE TITLE: ${pageTitle}
SITE NAME: ${ogSiteName}
META DESCRIPTION: ${metaDesc}
META KEYWORDS: ${metaKeywords}
OG TYPE: ${ogType}
BUSINESS SIGNALS: ${businessSignals.join(", ") || "GENERAL_BUSINESS"}
KEY HEADINGS: ${headings.join(" | ")}
NAVIGATION/LINKS: ${linkTexts.join(", ")}
MAIN CONTENT (excerpt): ${textContent.slice(0, 4000)}
=== END ANALYSIS ===`;
    } catch (e) {
      console.log(`Failed to fetch ${url}:`, e instanceof Error ? e.message : e);
      continue;
    }
  }
  return `Could not scrape ${domain}. Generate content based on domain name inference only.`;
}

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

    // Clean the domain
    const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, "").replace(/\/+$/, "");
    console.log(`Scraping website: ${cleanDomain}`);

    // Step 1: Scrape and analyze the website
    const websiteAnalysis = await scrapeWebsite(cleanDomain);
    console.log(`Website analysis complete. Length: ${websiteAnalysis.length} chars`);

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    const systemPrompt = `You are an elite social media strategist and content marketing expert. You create Google E-E-A-T compliant, SEO-optimized content calendars for businesses. Today's date is ${todayStr}.

CRITICAL: You have been provided a DEEP ANALYSIS of the company's actual website. Use this to understand:
1. What the company ACTUALLY does (not guesses)
2. Their specific products, services, and offerings
3. Their industry and niche
4. Their pricing model (if visible)
5. Whether they are B2B or B2C
6. Their target audience
7. Their brand voice and messaging style
8. Key differentiators and value propositions

Use ALL of this intelligence to create hyper-relevant, industry-specific content.

RULES:
- Generate exactly 30 days of content starting from today (${todayStr})
- Skip Sundays for a lighter schedule
- Each post must demonstrate E-E-A-T signals (Experience, Expertise, Authoritativeness, Trustworthiness)
- Include SEO-optimized captions with strategic hashtags specific to THEIR industry
- Vary platforms: instagram, facebook, linkedin, twitter
- Vary content types: image, carousel, video, text
- Make captions compelling, professional, and conversion-focused
- Reference their ACTUAL services/products in posts - be specific
- Include relevant industry hashtags and SEO keywords
- Each post should have a unique angle and value proposition
- Content should position the company as an authority in their specific niche

Return ONLY valid JSON with this exact structure (no markdown, no code blocks):
{
  "companyAnalysis": {
    "businessType": "e.g. SaaS, Healthcare, E-commerce, Agency",
    "industry": "specific industry",
    "targetAudience": "who they serve",
    "keyServices": ["service1", "service2"],
    "valueProposition": "their main value prop"
  },
  "posts": [
    {
      "date": "YYYY-MM-DD",
      "dayOfWeek": "Monday",
      "platform": "instagram",
      "type": "image",
      "title": "Post Title",
      "caption": "Full caption with emojis and call to action referencing their actual services",
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
          {
            role: "user",
            content: `Here is the DEEP WEBSITE ANALYSIS of the company "${cleanDomain}":\n\n${websiteAnalysis}\n\nBased on this thorough analysis of their actual website, generate a highly targeted 30-day content calendar that references their specific services, products, industry terminology, and target audience. Every post should feel like it was crafted by someone who deeply understands this specific business.`,
          },
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

    return new Response(JSON.stringify({
      calendar: parsed,
      domain: cleanDomain,
      generatedAt: todayStr,
      companyAnalysis: parsed.companyAnalysis || null,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-content error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
