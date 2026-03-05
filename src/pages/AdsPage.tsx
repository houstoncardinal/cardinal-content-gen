import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { DomainInput } from "@/components/DomainInput";
import { AdCampaignView } from "@/components/AdCampaignView";
import { generateAdsWithAI } from "@/lib/aiService";
import { generateAdCampaign, type AdCampaign } from "@/lib/contentGenerator";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Target } from "lucide-react";
import { Button } from "@/components/ui/button";

const AdsPage = () => {
  const [campaign, setCampaign] = useState<AdCampaign | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async (domain: string) => {
    setIsLoading(true);
    try {
      const data = await generateAdsWithAI(domain);
      setCampaign(data);
      toast.success(`AI-powered ad campaign generated for ${domain}!`);
    } catch (err: any) {
      console.error("AI ads generation failed, using templates:", err);
      toast.error(err.message || "AI generation failed. Using smart templates.");
      const data = generateAdCampaign(domain);
      setCampaign(data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        {!campaign && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 rounded-2xl bg-info flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Target className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Google Ads Campaign Generator</h1>
            <p className="text-muted-foreground max-w-lg mx-auto mb-8">
              Create high-converting Google ad campaigns powered by OpenAI GPT-4o with ready-to-publish concepts, targeting, keywords, budgets, and more.
            </p>
            <DomainInput onSubmit={handleGenerate} isLoading={isLoading} />
          </motion.div>
        )}

        {campaign && (
          <>
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => setCampaign(null)}
                className="text-sm"
              >
                ← Generate New Campaign
              </Button>
            </div>
            <AdCampaignView campaign={campaign} />
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default AdsPage;
