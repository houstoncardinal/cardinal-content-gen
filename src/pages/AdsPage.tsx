import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { DomainInput } from "@/components/DomainInput";
import { AdCampaignView } from "@/components/AdCampaignView";
import { generateAdCampaign, type AdCampaign } from "@/lib/contentGenerator";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Target } from "lucide-react";

const AdsPage = () => {
  const [campaign, setCampaign] = useState<AdCampaign | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = (domain: string) => {
    setIsLoading(true);
    setTimeout(() => {
      const data = generateAdCampaign(domain);
      setCampaign(data);
      setIsLoading(false);
      toast.success(`Ad campaign generated for ${domain}!`);
    }, 1500);
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
              Create high-converting Google ad campaigns with ready-to-publish concepts, targeting, keywords, budgets, and more.
            </p>
            <DomainInput onSubmit={handleGenerate} isLoading={isLoading} />
          </motion.div>
        )}

        {campaign && <AdCampaignView campaign={campaign} />}
      </div>
    </AppLayout>
  );
};

export default AdsPage;
