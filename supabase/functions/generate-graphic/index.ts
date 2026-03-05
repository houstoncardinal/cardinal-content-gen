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

    const { title, caption, platform, type, brandName, logoUrl } = await req.json();

    if (!title || !caption) {
      return new Response(JSON.stringify({ error: "Title and caption are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sizeMap: Record<string, string> = {
      instagram: "1024x1024",
      facebook: "1792x1024",
      linkedin: "1792x1024",
      twitter: "1792x1024",
    };
    const size = sizeMap[platform] || "1024x1024";

    const prompt = `Create a professional, enterprise-grade social media graphic for ${platform || "social media"}.

BRAND: ${brandName || "Professional Business"}
POST TITLE: ${title}
CONTENT: ${caption}
TYPE: ${type || "image"} post

DESIGN REQUIREMENTS:
- Clean, modern, professional design suitable for Fortune 500 companies
- Bold typography with clear hierarchy
- Use rich gradients and sophisticated color palettes
- Include visual elements that reinforce the message
- Leave space for a logo in the top-left or bottom-right corner
- Make text readable and impactful
- Use professional stock-photo quality imagery or abstract design elements
- Ensure brand consistency with premium feel
${logoUrl ? "- Include a placeholder area for the company logo" : ""}

Style: Premium corporate marketing material, editorial quality, high contrast, clean composition`;

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt,
        n: 1,
        size,
        quality: "hd",
        style: "vivid",
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("DALL-E error:", response.status, errText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "Failed to generate graphic." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const imageUrl = data.data?.[0]?.url;
    const revisedPrompt = data.data?.[0]?.revised_prompt;

    if (!imageUrl) {
      return new Response(JSON.stringify({ error: "No image generated" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ imageUrl, revisedPrompt }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-graphic error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
