import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { DomainInput } from "@/components/DomainInput";
import { ContentCalendar } from "@/components/ContentCalendar";
import { generateContentWithAI } from "@/lib/aiService";
import { generateContentCalendar, type ContentCalendarData, type ContentPost } from "@/lib/contentGenerator";
import { generateGraphicWithAI } from "@/lib/aiService";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

const ContentPage = () => {
  const [calendarData, setCalendarData] = useState<ContentCalendarData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [generatingGraphics, setGeneratingGraphics] = useState<Set<string>>(new Set());
  const [graphicUrls, setGraphicUrls] = useState<Record<string, string>>({});
  const [brandName, setBrandName] = useState("");

  const handleGenerate = async (domain: string) => {
    setIsLoading(true);
    setBrandName(domain.replace(/\.(com|org|net|io)$/i, "").replace(/^www\./i, ""));
    try {
      const data = await generateContentWithAI(domain);
      setCalendarData(data);
      toast.success(`AI-powered content calendar generated for ${domain}!`);
    } catch (err: any) {
      console.error("AI generation failed, using template fallback:", err);
      toast.error(err.message || "AI generation failed. Using smart templates instead.");
      // Fallback to template-based generation
      const data = generateContentCalendar(domain);
      setCalendarData(data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateGraphic = async (post: ContentPost) => {
    if (generatingGraphics.has(post.id)) return;

    setGeneratingGraphics((prev) => new Set(prev).add(post.id));
    toast.info(`Generating graphic for "${post.title}"...`, { duration: 10000 });

    try {
      const result = await generateGraphicWithAI({
        title: post.title,
        caption: post.caption,
        platform: post.platform,
        type: post.type,
        brandName,
      });

      setGraphicUrls((prev) => ({ ...prev, [post.id]: result.imageUrl }));

      if (calendarData) {
        const updated = {
          ...calendarData,
          posts: calendarData.posts.map((p) =>
            p.id === post.id ? { ...p, graphicGenerated: true } : p
          ),
          weeks: calendarData.weeks.map((w) => ({
            ...w,
            posts: w.posts.map((p) =>
              p.id === post.id ? { ...p, graphicGenerated: true } : p
            ),
          })),
        };
        setCalendarData(updated);
      }

      toast.success(`Graphic generated for "${post.title}"!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to generate graphic");
    } finally {
      setGeneratingGraphics((prev) => {
        const next = new Set(prev);
        next.delete(post.id);
        return next;
      });
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        {!calendarData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 rounded-2xl gradient-cardinal flex items-center justify-center mx-auto mb-6 shadow-cardinal">
              <Calendar className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Content Calendar Generator</h1>
            <p className="text-muted-foreground max-w-lg mx-auto mb-8">
              Enter a company domain to generate a 30-day E-E-A-T compliant, SEO-optimized content schedule powered by OpenAI GPT-4o.
            </p>
            <DomainInput onSubmit={handleGenerate} isLoading={isLoading} />
          </motion.div>
        )}

        {calendarData && (
          <>
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => setCalendarData(null)}
                className="text-sm"
              >
                ← Generate New Calendar
              </Button>
            </div>
            <ContentCalendar
              data={calendarData}
              onGenerateGraphic={handleGenerateGraphic}
              generatingGraphics={generatingGraphics}
              graphicUrls={graphicUrls}
            />
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default ContentPage;
