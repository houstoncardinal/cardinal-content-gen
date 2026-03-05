import { supabase } from "@/integrations/supabase/client";
import type { ContentCalendarData, ContentPost, AdCampaign } from "./contentGenerator";

export async function generateContentWithAI(domain: string): Promise<ContentCalendarData> {
  const { data, error } = await supabase.functions.invoke("generate-content", {
    body: { domain },
  });

  if (error) throw new Error(error.message || "Failed to generate content");
  if (data?.error) throw new Error(data.error);

  const calendar = data.calendar;
  const generatedAt = new Date(data.generatedAt);

  const posts: ContentPost[] = calendar.posts.map((p: any, i: number) => ({
    id: `post-${i}`,
    date: new Date(p.date),
    dayOfWeek: p.dayOfWeek,
    platform: p.platform,
    type: p.type,
    title: p.title,
    caption: p.caption,
    hashtags: p.hashtags || [],
    seoKeywords: p.seoKeywords || [],
    eeatSignal: p.eeatSignal || "",
    graphicGenerated: false,
    week: Math.floor(i / 7) + 1,
  }));

  // Group by weeks
  const weekMap = new Map<number, ContentPost[]>();
  posts.forEach((post) => {
    const w = post.week;
    if (!weekMap.has(w)) weekMap.set(w, []);
    weekMap.get(w)!.push(post);
  });

  const weeks = Array.from(weekMap.entries()).map(([weekNumber, weekPosts]) => ({
    weekNumber,
    startDate: weekPosts[0].date,
    endDate: weekPosts[weekPosts.length - 1].date,
    posts: weekPosts,
  }));

  return { domain, generatedAt, posts, weeks };
}

export async function generateAdsWithAI(domain: string): Promise<AdCampaign> {
  const { data, error } = await supabase.functions.invoke("generate-ads", {
    body: { domain },
  });

  if (error) throw new Error(error.message || "Failed to generate ad campaign");
  if (data?.error) throw new Error(data.error);

  return data.campaign;
}

export async function generateGraphicWithAI(params: {
  title: string;
  caption: string;
  platform: string;
  type: string;
  brandName?: string;
  logoUrl?: string;
}): Promise<{ imageUrl: string; revisedPrompt?: string }> {
  const { data, error } = await supabase.functions.invoke("generate-graphic", {
    body: params,
  });

  if (error) throw new Error(error.message || "Failed to generate graphic");
  if (data?.error) throw new Error(data.error);

  return { imageUrl: data.imageUrl, revisedPrompt: data.revisedPrompt };
}
