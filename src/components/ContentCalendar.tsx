import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
  Calendar,
  Image,
  ChevronDown,
  ChevronUp,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  CheckCircle2,
  Hash,
  Search,
  Shield,
  Loader2,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ContentCalendarData, ContentPost } from "@/lib/contentGenerator";

const platformIcons: Record<string, React.ElementType> = {
  instagram: Instagram,
  facebook: Facebook,
  linkedin: Linkedin,
  twitter: Twitter,
};

const platformColors: Record<string, string> = {
  instagram: "bg-pink-500/10 text-pink-600 border-pink-200",
  facebook: "bg-blue-500/10 text-blue-600 border-blue-200",
  linkedin: "bg-sky-500/10 text-sky-600 border-sky-200",
  twitter: "bg-slate-500/10 text-slate-600 border-slate-200",
};

interface ContentCalendarProps {
  data: ContentCalendarData;
  onGenerateGraphic: (post: ContentPost) => void;
  generatingGraphics?: Set<string>;
  graphicUrls?: Record<string, string>;
}

export const ContentCalendar = ({
  data,
  onGenerateGraphic,
  generatingGraphics = new Set(),
  graphicUrls = {},
}: ContentCalendarProps) => {
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set([1]));

  const toggleWeek = (weekNumber: number) => {
    const next = new Set(expandedWeeks);
    if (next.has(weekNumber)) next.delete(weekNumber);
    else next.add(weekNumber);
    setExpandedWeeks(next);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">30-Day Content Calendar</h2>
          <p className="text-sm text-muted-foreground mt-1">
            <Calendar className="inline w-4 h-4 mr-1" />
            Generated on {format(data.generatedAt, "MMMM d, yyyy")} for{" "}
            <span className="font-semibold text-cardinal">{data.domain}</span>
          </p>
        </div>
        <Badge variant="outline" className="text-xs border-cardinal/30 text-cardinal">
          {data.posts.length} posts planned
        </Badge>
      </div>

      {/* Weeks */}
      <div className="space-y-3">
        {data.weeks.map((week) => (
          <motion.div
            key={week.weekNumber}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: week.weekNumber * 0.1 }}
            className="bg-card border border-border rounded-xl overflow-hidden shadow-sm"
          >
            <button
              onClick={() => toggleWeek(week.weekNumber)}
              className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg gradient-cardinal flex items-center justify-center text-primary-foreground text-sm font-bold">
                  W{week.weekNumber}
                </div>
                <div className="text-left">
                  <p className="font-semibold text-foreground text-sm">
                    Week {week.weekNumber}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(week.startDate, "MMM d")} – {format(week.endDate, "MMM d, yyyy")}
                    <span className="ml-2">• {week.posts.length} posts</span>
                  </p>
                </div>
              </div>
              {expandedWeeks.has(week.weekNumber) ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </button>

            <AnimatePresence>
              {expandedWeeks.has(week.weekNumber) && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 pt-0 space-y-3">
                    {week.posts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        onGenerateGraphic={() => onGenerateGraphic(post)}
                        isGenerating={generatingGraphics.has(post.id)}
                        graphicUrl={graphicUrls[post.id]}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const PostCard = ({
  post,
  onGenerateGraphic,
  isGenerating,
  graphicUrl,
}: {
  post: ContentPost;
  onGenerateGraphic: () => void;
  isGenerating?: boolean;
  graphicUrl?: string;
}) => {
  const PlatformIcon = platformIcons[post.platform] || Instagram;

  return (
    <motion.div
      layout
      className="border border-border rounded-lg p-4 bg-background hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono font-medium text-muted-foreground">
              {format(post.date, "EEE, MMM d")}
            </span>
            <Badge
              variant="outline"
              className={cn("text-xs", platformColors[post.platform])}
            >
              <PlatformIcon className="w-3 h-3 mr-1" />
              {post.platform}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {post.type}
            </Badge>
          </div>
          <h4 className="font-semibold text-foreground text-sm">{post.title}</h4>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
            {post.caption}
          </p>
        </div>

        <Button
          size="sm"
          onClick={onGenerateGraphic}
          disabled={isGenerating}
          className={cn(
            "flex-shrink-0 gap-1.5 text-xs",
            post.graphicGenerated
              ? "bg-success/10 text-success border border-success/20 hover:bg-success/20"
              : "gradient-cardinal text-primary-foreground shadow-cardinal hover:opacity-90"
          )}
          variant={post.graphicGenerated ? "outline" : "default"}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Generating...
            </>
          ) : post.graphicGenerated ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              Generated
            </>
          ) : (
            <>
              <Image className="w-3.5 h-3.5" />
              Generate Graphic
            </>
          )}
        </Button>
      </div>

      {/* Generated graphic preview */}
      {graphicUrl && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-3 pt-3 border-t border-border"
        >
          <div className="relative rounded-lg overflow-hidden bg-muted">
            <img
              src={graphicUrl}
              alt={`Generated graphic for ${post.title}`}
              className="w-full max-h-64 object-cover rounded-lg"
            />
            <a
              href={graphicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm rounded-md p-1.5 hover:bg-background transition-colors"
            >
              <Download className="w-4 h-4 text-foreground" />
            </a>
          </div>
        </motion.div>
      )}

      <div className="mt-3 pt-3 border-t border-border flex flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-1 text-muted-foreground">
          <Hash className="w-3 h-3" />
          {post.hashtags.slice(0, 3).join(" ")}
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Search className="w-3 h-3" />
          SEO: {post.seoKeywords.slice(0, 2).join(", ")}
        </div>
        <div className="flex items-center gap-1 text-info">
          <Shield className="w-3 h-3" />
          {post.eeatSignal.split(":")[0]}
        </div>
      </div>
    </motion.div>
  );
};
