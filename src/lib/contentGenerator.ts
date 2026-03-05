import { addDays, format, startOfWeek, getDay } from "date-fns";

export interface ContentPost {
  id: string;
  date: Date;
  dayOfWeek: string;
  platform: "instagram" | "facebook" | "linkedin" | "twitter";
  type: "image" | "carousel" | "video" | "text";
  title: string;
  caption: string;
  hashtags: string[];
  seoKeywords: string[];
  eeatSignal: string;
  graphicGenerated: boolean;
  week: number;
}

export interface ContentCalendarData {
  domain: string;
  generatedAt: Date;
  posts: ContentPost[];
  weeks: { weekNumber: number; startDate: Date; endDate: Date; posts: ContentPost[] }[];
}

const platforms = ["instagram", "facebook", "linkedin", "twitter"] as const;
const types = ["image", "carousel", "video", "text"] as const;

const eeatSignals = [
  "Experience: Share first-hand client success story",
  "Expertise: Industry data & analysis",
  "Authoritativeness: Cite industry reports",
  "Trustworthiness: Client testimonial",
  "Experience: Behind-the-scenes process",
  "Expertise: How-to educational content",
  "Authoritativeness: Partner collaboration",
  "Trustworthiness: Transparent business practice",
];

const contentTemplates = [
  { title: "Industry Insights", caption: "🔍 Deep dive into the latest trends shaping {industry}. Here's what you need to know to stay ahead of the competition." },
  { title: "Client Success Story", caption: "⭐ See how we helped transform {domain}'s digital presence. Real results, real impact." },
  { title: "Expert Tips", caption: "💡 Top strategies for {industry} growth. Save this for later!" },
  { title: "Behind the Scenes", caption: "🎬 A look at how we craft world-class solutions at {domain}." },
  { title: "Educational Carousel", caption: "📚 Swipe through to learn the fundamentals of {topic}. Knowledge is power!" },
  { title: "Community Engagement", caption: "🤝 We believe in building relationships, not just brands. What's your take on {topic}?" },
  { title: "Product Spotlight", caption: "🚀 Introducing new capabilities that set {domain} apart in {industry}." },
  { title: "Weekly Recap", caption: "📊 This week's highlights and key takeaways from {domain}." },
  { title: "Thought Leadership", caption: "🎯 Our perspective on where {industry} is heading in 2026 and beyond." },
  { title: "FAQ Session", caption: "❓ Your top questions about {topic}, answered by our experts." },
  { title: "Motivational Monday", caption: "💪 Start your week with purpose. Here's how {domain} approaches challenges." },
  { title: "Team Feature", caption: "👥 Meet the people behind {domain}. Expertise you can trust." },
  { title: "Data Visualization", caption: "📈 The numbers speak for themselves. See the impact of strategic {topic}." },
  { title: "Tutorial Post", caption: "🛠️ Step-by-step guide to {topic}. Follow along and level up!" },
  { title: "Trending Topic", caption: "🔥 {topic} is trending for a reason. Here's our expert analysis." },
];

const topics = [
  "digital marketing", "brand strategy", "SEO optimization", "content marketing",
  "social media growth", "lead generation", "conversion optimization", "email marketing",
  "video marketing", "influencer partnerships", "data analytics", "customer experience",
  "market research", "competitive analysis", "brand storytelling",
];

const hashtagSets = [
  ["#Marketing", "#DigitalMarketing", "#GrowthHacking", "#SEO"],
  ["#BrandStrategy", "#ContentMarketing", "#SocialMedia", "#BusinessGrowth"],
  ["#LeadGen", "#MarketingTips", "#B2B", "#Innovation"],
  ["#ThoughtLeadership", "#Industry", "#Trends", "#ExpertInsights"],
  ["#CustomerSuccess", "#Results", "#ROI", "#Strategy"],
];

export function generateContentCalendar(domain: string): ContentCalendarData {
  const today = new Date();
  const posts: ContentPost[] = [];

  for (let day = 0; day < 30; day++) {
    const date = addDays(today, day);
    const dayOfWeek = format(date, "EEEE");

    // Skip Sundays for lighter schedule
    if (getDay(date) === 0) continue;

    const template = contentTemplates[day % contentTemplates.length];
    const topic = topics[day % topics.length];
    const industry = domain.replace(/\.(com|org|net|io)$/i, "").replace(/^www\./i, "");

    posts.push({
      id: `post-${day}`,
      date,
      dayOfWeek,
      platform: platforms[day % platforms.length],
      type: types[day % types.length],
      title: template.title,
      caption: template.caption
        .replace(/{domain}/g, domain)
        .replace(/{industry}/g, industry)
        .replace(/{topic}/g, topic),
      hashtags: hashtagSets[day % hashtagSets.length],
      seoKeywords: [topic, industry, "marketing", dayOfWeek.toLowerCase()],
      eeatSignal: eeatSignals[day % eeatSignals.length],
      graphicGenerated: false,
      week: Math.floor(day / 7) + 1,
    });
  }

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

  return { domain, generatedAt: today, posts, weeks };
}

export interface AdCampaign {
  id: string;
  name: string;
  objective: string;
  adConcepts: AdConcept[];
  targeting: TargetingInfo;
  budget: BudgetSuggestion;
  keywords: string[];
  negativeKeywords: string[];
  adExtensions: string[];
  qualityScoreFactors: string[];
}

export interface AdConcept {
  headline1: string;
  headline2: string;
  headline3: string;
  description1: string;
  description2: string;
  displayUrl: string;
  finalUrl: string;
  callToAction: string;
}

export interface TargetingInfo {
  locations: string[];
  ageRange: string;
  genderSplit: string;
  interests: string[];
  inMarketAudiences: string[];
  customIntentKeywords: string[];
  devices: string[];
  schedule: string;
}

export interface BudgetSuggestion {
  dailyBudget: string;
  monthlyBudget: string;
  suggestedBid: string;
  estimatedCPC: string;
  estimatedClicks: string;
  estimatedImpressions: string;
  estimatedConversionRate: string;
}

export function generateAdCampaign(domain: string): AdCampaign {
  const brand = domain.replace(/\.(com|org|net|io)$/i, "").replace(/^www\./i, "");
  const brandCap = brand.charAt(0).toUpperCase() + brand.slice(1);

  return {
    id: `campaign-${Date.now()}`,
    name: `${brandCap} - Brand Awareness & Lead Gen`,
    objective: "Maximize conversions while building brand awareness",
    adConcepts: [
      {
        headline1: `${brandCap} - Trusted Solutions`,
        headline2: "Get Results That Matter",
        headline3: "Free Consultation Today",
        description1: `Discover why leading businesses choose ${brandCap}. Industry-leading solutions backed by proven results. Get started today.`,
        description2: `Transform your business with ${brandCap}'s award-winning platform. Join 10,000+ satisfied customers. Schedule your demo now.`,
        displayUrl: `${domain}/solutions`,
        finalUrl: `https://${domain}/get-started`,
        callToAction: "Get Started Free",
      },
      {
        headline1: `Why Choose ${brandCap}?`,
        headline2: "Award-Winning Platform",
        headline3: "See Pricing & Plans",
        description1: `${brandCap} delivers measurable ROI for businesses of all sizes. See our case studies and customer success stories.`,
        description2: `Flexible plans starting at competitive rates. No long-term contracts. Cancel anytime. Start your free trial today.`,
        displayUrl: `${domain}/pricing`,
        finalUrl: `https://${domain}/pricing`,
        callToAction: "View Plans",
      },
      {
        headline1: `${brandCap} vs Competitors`,
        headline2: "#1 Rated by Industry Experts",
        headline3: "Switch & Save 30%",
        description1: `See why ${brandCap} is rated #1 in customer satisfaction. Compare features, pricing, and results side by side.`,
        description2: `Make the switch to ${brandCap} and save up to 30% on your current solution. Migration support included at no extra cost.`,
        displayUrl: `${domain}/compare`,
        finalUrl: `https://${domain}/comparison`,
        callToAction: "Compare Now",
      },
    ],
    targeting: {
      locations: ["United States", "United Kingdom", "Canada", "Australia"],
      ageRange: "25-54",
      genderSplit: "All genders",
      interests: ["Business services", "Technology", "Entrepreneurship", "Marketing"],
      inMarketAudiences: [
        "Business software & services",
        "CRM software",
        "Marketing services",
        "Enterprise solutions",
      ],
      customIntentKeywords: [
        `${brand} alternatives`,
        `best ${brand} solutions`,
        `${brand} reviews`,
        "business growth tools",
      ],
      devices: ["Desktop (60%)", "Mobile (35%)", "Tablet (5%)"],
      schedule: "Mon-Fri 8AM-8PM, Sat 9AM-5PM (target timezone)",
    },
    budget: {
      dailyBudget: "$50 - $150",
      monthlyBudget: "$1,500 - $4,500",
      suggestedBid: "$2.50 - $8.00",
      estimatedCPC: "$3.50 avg",
      estimatedClicks: "430 - 1,290/month",
      estimatedImpressions: "15,000 - 45,000/month",
      estimatedConversionRate: "3.5% - 5.2%",
    },
    keywords: [
      `${brand}`,
      `${brand} services`,
      `${brand} solutions`,
      `best ${brand} alternative`,
      "business growth platform",
      "marketing automation tool",
      "lead generation software",
      "enterprise solutions",
      "digital transformation",
      "business intelligence tools",
      `${brand} pricing`,
      `${brand} reviews`,
      "top marketing platforms",
      "conversion optimization tool",
      "customer engagement platform",
    ],
    negativeKeywords: [
      "free",
      "cheap",
      "jobs",
      "careers",
      "salary",
      "internship",
      "tutorial",
      "course",
      "definition",
      "what is",
      "wikipedia",
      "reddit",
      "download",
      "crack",
      "pirate",
    ],
    adExtensions: [
      "Sitelinks: Solutions, Pricing, Case Studies, About Us, Contact",
      "Callout: 24/7 Support | Free Trial | No Setup Fees | Enterprise Grade",
      "Structured Snippets: Services — Marketing, Analytics, Automation, CRM",
      "Call Extension: +1 (800) XXX-XXXX",
      "Location Extension: Headquarters address",
      "Price Extension: Starter $49/mo, Pro $149/mo, Enterprise Custom",
    ],
    qualityScoreFactors: [
      "✅ Highly relevant ad copy matching keyword intent",
      "✅ Optimized landing page with fast load times",
      "✅ Strong CTR expected from compelling headlines",
      "✅ Mobile-optimized landing experience",
      "✅ Clear value proposition in ad text",
    ],
  };
}
