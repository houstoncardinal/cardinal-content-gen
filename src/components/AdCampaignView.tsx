import { motion } from "framer-motion";
import {
  Target,
  DollarSign,
  Search,
  Ban,
  Users,
  Globe,
  Monitor,
  Clock,
  Sparkles,
  Copy,
  CheckCircle2,
  Layers,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";
import type { AdCampaign, AdConcept } from "@/lib/contentGenerator";

interface AdCampaignViewProps {
  campaign: AdCampaign;
}

export const AdCampaignView = ({ campaign }: AdCampaignViewProps) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">{campaign.name}</h2>
        <p className="text-sm text-muted-foreground mt-1">{campaign.objective}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ad Concepts */}
        <Section title="Ad Concepts" icon={Sparkles} className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {campaign.adConcepts.map((concept, i) => (
              <AdConceptCard key={i} concept={concept} index={i} />
            ))}
          </div>
        </Section>

        {/* Keywords */}
        <Section title="Suggested Keywords" icon={Search}>
          <div className="flex flex-wrap gap-2">
            {campaign.keywords.map((kw) => (
              <Badge key={kw} variant="secondary" className="text-xs">
                {kw}
              </Badge>
            ))}
          </div>
        </Section>

        {/* Negative Keywords */}
        <Section title="Negative Keywords" icon={Ban}>
          <div className="flex flex-wrap gap-2">
            {campaign.negativeKeywords.map((kw) => (
              <Badge key={kw} variant="outline" className="text-xs text-destructive border-destructive/20">
                -{kw}
              </Badge>
            ))}
          </div>
        </Section>

        {/* Targeting */}
        <Section title="Targeting" icon={Users}>
          <div className="space-y-3 text-sm">
            <InfoRow icon={Globe} label="Locations" value={campaign.targeting.locations.join(", ")} />
            <InfoRow icon={Users} label="Age Range" value={campaign.targeting.ageRange} />
            <InfoRow icon={Monitor} label="Devices" value={campaign.targeting.devices.join(", ")} />
            <InfoRow icon={Clock} label="Schedule" value={campaign.targeting.schedule} />
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">In-Market Audiences</p>
              <div className="flex flex-wrap gap-1">
                {campaign.targeting.inMarketAudiences.map((a) => (
                  <Badge key={a} variant="outline" className="text-xs">{a}</Badge>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* Budget */}
        <Section title="Budget & Estimates" icon={DollarSign}>
          <div className="space-y-3 text-sm">
            <InfoRow icon={DollarSign} label="Daily Budget" value={campaign.budget.dailyBudget} />
            <InfoRow icon={DollarSign} label="Monthly Budget" value={campaign.budget.monthlyBudget} />
            <InfoRow icon={Target} label="Suggested Bid" value={campaign.budget.suggestedBid} />
            <InfoRow icon={Target} label="Est. CPC" value={campaign.budget.estimatedCPC} />
            <InfoRow icon={Target} label="Est. Clicks/mo" value={campaign.budget.estimatedClicks} />
            <InfoRow icon={Target} label="Est. Impressions/mo" value={campaign.budget.estimatedImpressions} />
            <InfoRow icon={Star} label="Est. Conv. Rate" value={campaign.budget.estimatedConversionRate} />
          </div>
        </Section>

        {/* Ad Extensions */}
        <Section title="Ad Extensions" icon={Layers} className="lg:col-span-2">
          <div className="space-y-2">
            {campaign.adExtensions.map((ext, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                <span className="text-foreground">{ext}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Quality Score */}
        <Section title="Quality Score Factors" icon={Star} className="lg:col-span-2">
          <div className="space-y-2">
            {campaign.qualityScoreFactors.map((f, i) => (
              <p key={i} className="text-sm text-foreground">{f}</p>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
};

const Section = ({
  title,
  icon: Icon,
  children,
  className,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-card border border-border rounded-xl p-5 ${className || ""}`}
  >
    <div className="flex items-center gap-2 mb-4">
      <div className="w-7 h-7 rounded-md gradient-cardinal flex items-center justify-center">
        <Icon className="w-4 h-4 text-primary-foreground" />
      </div>
      <h3 className="font-semibold text-foreground">{title}</h3>
    </div>
    {children}
  </motion.div>
);

const InfoRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) => (
  <div className="flex items-start gap-2">
    <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
    <div>
      <span className="text-muted-foreground">{label}: </span>
      <span className="text-foreground font-medium">{value}</span>
    </div>
  </div>
);

const AdConceptCard = ({ concept, index }: { concept: AdConcept; index: number }) => {
  const [copied, setCopied] = useState(false);

  const copyAll = () => {
    const text = `${concept.headline1} | ${concept.headline2} | ${concept.headline3}\n\n${concept.description1}\n\n${concept.description2}\n\nCTA: ${concept.callToAction}\nURL: ${concept.finalUrl}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Ad copy copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-border rounded-lg p-4 bg-background space-y-3">
      <div className="flex items-center justify-between">
        <Badge className="gradient-cardinal text-primary-foreground text-xs border-0">
          Ad {index + 1}
        </Badge>
        <Button variant="ghost" size="sm" onClick={copyAll} className="text-xs gap-1">
          {copied ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>

      <div className="space-y-1">
        <p className="text-sm font-semibold text-info">{concept.headline1}</p>
        <p className="text-sm font-semibold text-info">{concept.headline2}</p>
        <p className="text-sm font-semibold text-info">{concept.headline3}</p>
      </div>

      <p className="text-xs text-success">{concept.displayUrl}</p>

      <p className="text-sm text-foreground leading-relaxed">{concept.description1}</p>
      <p className="text-sm text-muted-foreground leading-relaxed">{concept.description2}</p>

      <Button size="sm" className="w-full gradient-cardinal text-primary-foreground text-xs border-0 hover:opacity-90">
        {concept.callToAction}
      </Button>
    </div>
  );
};
