import { useState } from "react";
import { motion } from "framer-motion";
import { Globe, ArrowRight, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DomainInputProps {
  onSubmit: (domain: string, logo?: File | null) => void;
  isLoading?: boolean;
}

export const DomainInput = ({ onSubmit, isLoading }: DomainInputProps) => {
  const [domain, setDomain] = useState("");
  const [logo, setLogo] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (domain.trim()) onSubmit(domain.trim(), logo);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="Enter company domain (e.g., acme.com)"
            className="pl-12 pr-4 h-14 text-base bg-card border-border rounded-xl shadow-sm focus:ring-2 focus:ring-cardinal/30"
          />
        </div>

        <div className="flex gap-3">
          <label className="flex-1 flex items-center gap-2 px-4 py-3 border border-dashed border-border rounded-xl cursor-pointer hover:border-cardinal/50 transition-colors bg-card">
            <Upload className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {logo ? logo.name : "Upload client logo (optional)"}
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setLogo(e.target.files?.[0] || null)}
            />
          </label>

          <Button
            type="submit"
            disabled={!domain.trim() || isLoading}
            className="h-auto px-6 gradient-cardinal text-primary-foreground shadow-cardinal hover:opacity-90 transition-opacity rounded-xl"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Generating...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Generate Plan
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};
