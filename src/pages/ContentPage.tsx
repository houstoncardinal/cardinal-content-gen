import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { DomainInput } from "@/components/DomainInput";
import { ContentCalendar } from "@/components/ContentCalendar";
import { generateContentCalendar, type ContentCalendarData, type ContentPost } from "@/lib/contentGenerator";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Calendar, Sparkles } from "lucide-react";

const ContentPage = () => {
  const [calendarData, setCalendarData] = useState<ContentCalendarData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = (domain: string) => {
    setIsLoading(true);
    // Simulate generation delay
    setTimeout(() => {
      const data = generateContentCalendar(domain);
      setCalendarData(data);
      setIsLoading(false);
      toast.success(`Content calendar generated for ${domain}!`);
    }, 1500);
  };

  const handleGenerateGraphic = (post: ContentPost) => {
    toast.success(`Graphic generation queued for "${post.title}"`, {
      description: "Connect to Lovable Cloud to enable AI graphic generation.",
    });
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
              Enter a company domain to generate a 30-day E-E-A-T compliant, SEO-optimized content schedule with posts organized by week and day.
            </p>
            <DomainInput onSubmit={handleGenerate} isLoading={isLoading} />
          </motion.div>
        )}

        {calendarData && (
          <ContentCalendar data={calendarData} onGenerateGraphic={handleGenerateGraphic} />
        )}
      </div>
    </AppLayout>
  );
};

export default ContentPage;
