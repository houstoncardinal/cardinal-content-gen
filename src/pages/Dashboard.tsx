import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Calendar, Target, Image, ArrowRight, Flame, Clock } from "lucide-react";
import { format } from "date-fns";
import { AppLayout } from "@/components/AppLayout";

const tools = [
  {
    title: "Content Calendar",
    description: "Generate a 30-day E-E-A-T compliant content schedule with SEO-optimized posts.",
    icon: Calendar,
    path: "/content",
    gradient: "gradient-cardinal",
  },
  {
    title: "Google Ads Campaigns",
    description: "Create high-converting ad concepts with targeting, keywords, and budget suggestions.",
    icon: Target,
    path: "/ads",
    gradient: "bg-info",
  },
  {
    title: "Graphics Studio",
    description: "Generate enterprise-level branded graphics for every post with logo integration.",
    icon: Image,
    path: "/graphics",
    gradient: "bg-success",
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const now = new Date();

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl gradient-cardinal p-8 shadow-cardinal"
        >
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-6 h-6 text-primary-foreground" />
              <h1 className="text-3xl font-bold text-primary-foreground">Cardinal Gen AI</h1>
            </div>
            <p className="text-primary-foreground/80 text-lg max-w-xl">
              Enterprise-grade content generation and marketing intelligence platform.
            </p>
            <div className="flex items-center gap-2 mt-4 text-primary-foreground/70 text-sm">
              <Clock className="w-4 h-4" />
              {format(now, "EEEE, MMMM d, yyyy • h:mm a")}
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-foreground/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-primary-foreground/5 rounded-full translate-y-1/2" />
        </motion.div>

        {/* Tool cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tools.map((tool, i) => (
            <motion.button
              key={tool.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.1 }}
              onClick={() => navigate(tool.path)}
              className="group text-left bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:border-cardinal/30 transition-all"
            >
              <div className={`w-12 h-12 rounded-xl ${tool.gradient} flex items-center justify-center mb-4 shadow-sm`}>
                <tool.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-foreground text-lg mb-2">{tool.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {tool.description}
              </p>
              <div className="flex items-center gap-1 text-cardinal text-sm font-medium group-hover:gap-2 transition-all">
                Get started <ArrowRight className="w-4 h-4" />
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
