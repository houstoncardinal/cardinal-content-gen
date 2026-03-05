import { motion } from "framer-motion";
import { Image, Upload, Sparkles, Palette } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

const GraphicsPage = () => {
  const [logo, setLogo] = useState<string | null>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setLogo(reader.result as string);
        toast.success("Logo uploaded successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="w-16 h-16 rounded-2xl bg-success flex items-center justify-center mx-auto mb-6">
            <Image className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Graphics Studio</h1>
          <p className="text-muted-foreground max-w-lg mx-auto mb-8">
            Generate enterprise-level branded graphics for your social media posts. Upload your client's logo to apply consistent branding.
          </p>

          {/* Logo upload */}
          <div className="max-w-md mx-auto space-y-6">
            <div className="border-2 border-dashed border-border rounded-xl p-8 bg-card hover:border-cardinal/30 transition-colors">
              {logo ? (
                <div className="space-y-4">
                  <img
                    src={logo}
                    alt="Uploaded logo"
                    className="w-24 h-24 object-contain mx-auto"
                  />
                  <p className="text-sm text-success font-medium">Logo uploaded</p>
                  <label className="inline-block cursor-pointer">
                    <span className="text-sm text-cardinal hover:underline">Change logo</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  </label>
                </div>
              ) : (
                <label className="cursor-pointer space-y-3 block">
                  <Upload className="w-10 h-10 text-muted-foreground mx-auto" />
                  <p className="text-sm font-medium text-foreground">Upload Client Logo</p>
                  <p className="text-xs text-muted-foreground">PNG, SVG, or JPG up to 5MB</p>
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                </label>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FeatureCard icon={Sparkles} title="AI-Powered" desc="Smart layouts & compositions" />
              <FeatureCard icon={Palette} title="Brand Consistent" desc="Auto-apply brand colors & logo" />
            </div>

            <div className="bg-accent/50 rounded-xl p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">💡 How it works</p>
              <p>Generate graphics from the Content Calendar page — each post has a "Generate Graphic" button that creates branded visuals.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
};

const FeatureCard = ({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
}) => (
  <div className="bg-card border border-border rounded-lg p-4 text-left">
    <Icon className="w-5 h-5 text-cardinal mb-2" />
    <p className="text-sm font-medium text-foreground">{title}</p>
    <p className="text-xs text-muted-foreground">{desc}</p>
  </div>
);

export default GraphicsPage;
