"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import { ArrowLeft, Clock, User, Calendar } from "lucide-react";

const POSTS: Record<string, {
  category: string;
  title: string;
  author: string;
  date: string;
  readTime: string;
  color: string;
  bg: string;
  intro: string;
  sections: { heading: string; body: string }[];
}> = {
  "top-tech-picks": {
    category: "Technology",
    title: "Top Tech Picks for 2025",
    author: "Souqona Team",
    date: "May 5, 2025",
    readTime: "4 min read",
    color: "#4F46E5",
    bg: "#EEF2FF",
    intro: "From ultra-thin laptops to noise-cancelling headphones — here are the gadgets worth your money this year. We tested dozens of products so you don't have to.",
    sections: [
      {
        heading: "1. Ultra-Thin Laptops",
        body: "The latest generation of ultra-thin laptops packs serious performance into incredibly slim frames. Whether you're a student, a creative professional, or a remote worker, there's a model that fits your workflow. Look for at least 16GB RAM and a fast NVMe SSD for a smooth experience in 2025.",
      },
      {
        heading: "2. Noise-Cancelling Headphones",
        body: "Active noise cancellation has reached a new level of quality this year. The best models now block out almost all background noise while delivering rich, detailed audio. Battery life has improved too — expect 30–40 hours on a single charge from top picks.",
      },
      {
        heading: "3. Wireless Earbuds",
        body: "True wireless earbuds continue to dominate. The best ones now offer spatial audio, adaptive EQ, and seamless device switching. They've become essential for commuters and gym-goers alike.",
      },
      {
        heading: "4. Smart Home Devices",
        body: "Smart speakers, displays, and plugs have never been more affordable. Setting up a connected home in 2025 is straightforward — most devices work across ecosystems and can be controlled from a single app.",
      },
      {
        heading: "Our Verdict",
        body: "Technology in 2025 is more accessible than ever. Whether you're upgrading a key device or trying smart home tech for the first time, there's never been a better moment to invest. Browse our full Tech category on Souqona to find the best deals.",
      },
    ],
  },
  "home-refresh-guide": {
    category: "Home & Living",
    title: "How to Refresh Your Home on a Budget",
    author: "Souqona Team",
    date: "April 22, 2025",
    readTime: "5 min read",
    color: "#16A34A",
    bg: "#F0FDF4",
    intro: "Small changes, big impact. You don't need a full renovation to give your home a fresh new feel. We've rounded up the best affordable upgrades you can order today.",
    sections: [
      {
        heading: "Start with Soft Furnishings",
        body: "New cushion covers, a throw blanket, or a simple rug can transform a room instantly. These are the lowest-cost, highest-impact changes you can make. Stick to two or three complementary colours for a cohesive look.",
      },
      {
        heading: "Lighting Makes the Difference",
        body: "Swap harsh overhead bulbs for warm-toned LED bulbs or add a floor lamp in a dark corner. Layered lighting — ambient, task, and accent — makes any room feel more inviting. Smart bulbs let you adjust colour temperature throughout the day.",
      },
      {
        heading: "Declutter Before You Decorate",
        body: "Before buying anything new, remove what you don't need. A decluttered space immediately feels larger and more peaceful. Once cleared, even a single new item — a plant, a vase, a framed print — has much more visual impact.",
      },
      {
        heading: "Plants Are Your Best Friend",
        body: "Indoor plants add life, colour, and improve air quality. Low-maintenance options like pothos, snake plants, and ZZ plants thrive even with minimal care. A collection of three plants in different sizes creates a natural focal point.",
      },
      {
        heading: "Update Your Walls",
        body: "You don't need to repaint — affordable art prints, gallery wall kits, or even a statement mirror can completely change the feel of a room. Position art at eye level and group pieces for maximum effect.",
      },
    ],
  },
  "spring-fashion-trends": {
    category: "Fashion",
    title: "Spring Fashion Trends You'll Actually Wear",
    author: "Souqona Team",
    date: "April 10, 2025",
    readTime: "3 min read",
    color: "#DB2777",
    bg: "#FDF4FF",
    intro: "No runway required. Our style guide covers everyday looks that are both comfortable and on-trend this spring.",
    sections: [
      {
        heading: "Relaxed Linen Everything",
        body: "Linen shirts, trousers, and co-ords are the unofficial uniform of spring 2025. The fabric breathes beautifully in warm weather and only looks better slightly wrinkled. Neutral tones — sand, ecru, soft white — are the most versatile starting point.",
      },
      {
        heading: "Wide-Leg Trousers",
        body: "Wide-leg trousers have fully replaced slim cuts as the go-to silhouette. They're comfortable, flattering on most body types, and pair well with everything from fitted tees to structured blazers. A high waist version elongates the leg.",
      },
      {
        heading: "Quiet Luxury Accessories",
        body: "Minimalist leather goods — simple totes, clean-lined belts, understated watches — continue to dominate. The focus is on quality materials and timeless shapes rather than logos or ornamentation.",
      },
      {
        heading: "Bold Colour Blocking",
        body: "For those who want to stand out, colour blocking is back in a big way. Pair two contrasting solid tones — think rust and cobalt, or sage and tangerine — for a head-turning look that's surprisingly easy to pull off.",
      },
      {
        heading: "Comfortable Footwear",
        body: "Chunky loafers, sport sandals, and ballet flats are sharing the spotlight this season. Comfort has officially joined style as a non-negotiable — and the best picks manage to deliver both without compromise.",
      },
    ],
  },
  "smart-shopping-tips": {
    category: "Shopping Tips",
    title: "5 Smart Shopping Tips to Save More",
    author: "Souqona Team",
    date: "March 28, 2025",
    readTime: "3 min read",
    color: "#FF5533",
    bg: "#FFF1F0",
    intro: "How to make the most of filters, price alerts, and category deals on Souqona — and shop smarter every time.",
    sections: [
      {
        heading: "1. Use Category Filters",
        body: "Browsing a broad category is overwhelming. Use the left-hand filters on the Products page to narrow by category and price range. You'll find what you need faster and spend less time scrolling past irrelevant items.",
      },
      {
        heading: "2. Sort by Price: Low to High",
        body: "When you're hunting for a deal, always sort by price ascending first. This surfaces the most affordable options immediately and gives you a clear picture of the market range before committing to a purchase.",
      },
      {
        heading: "3. Check the Deals Page Regularly",
        body: "Our Deals page shows every product currently marked down. New discounts are added regularly, so it's worth checking before any planned purchase. Bookmark it for quick access.",
      },
      {
        heading: "4. Look for the Compare-At Price",
        body: "Products showing both a current price and a strikethrough 'was' price are actively discounted. The percentage saving is displayed on the product card — larger percentages appear at the top of sorted results.",
      },
      {
        heading: "5. Free Shipping Threshold",
        body: "Orders over ₪200 qualify for free shipping automatically. If you're close to the threshold, adding one small item can be more economical than paying the delivery fee. Check your cart total before checking out.",
      },
    ],
  },
  "fitness-gear-guide": {
    category: "Sports & Fitness",
    title: "Build Your Home Gym Without Breaking the Bank",
    author: "Souqona Team",
    date: "March 14, 2025",
    readTime: "6 min read",
    color: "#0284C7",
    bg: "#F0F9FF",
    intro: "You don't need a fancy gym membership. Here's the essential gear to get fit from home — on any budget.",
    sections: [
      {
        heading: "Start with Resistance Bands",
        body: "A set of resistance bands is the single best value purchase for home fitness. They're compact, versatile, and can provide enough resistance to challenge any fitness level. A full set covering light, medium, and heavy resistance costs less than a single month's gym membership.",
      },
      {
        heading: "Adjustable Dumbbells",
        body: "A pair of adjustable dumbbells replaces an entire rack of fixed weights. They take up minimal space and allow you to progress gradually as you get stronger. This is the highest-priority hardware investment for a home gym.",
      },
      {
        heading: "A Quality Exercise Mat",
        body: "A thick yoga or exercise mat protects your joints during floor work and provides a dedicated workout zone. Look for at least 6mm thickness for comfort on hard floors. A mat also helps mentally — rolling it out signals it's time to train.",
      },
      {
        heading: "Pull-Up Bar",
        body: "A doorframe pull-up bar is one of the most effective and affordable pieces of equipment available. Pull-ups and chin-ups target your back, biceps, and core simultaneously. Most models fit standard door frames and require no tools to install.",
      },
      {
        heading: "Jump Rope",
        body: "A good jump rope is the most underrated cardio tool in existence. Ten minutes of skipping is equivalent to a short run in terms of calories burned. It's cheap, portable, and requires zero space when stored.",
      },
      {
        heading: "Building Your Routine",
        body: "Start with three sessions per week combining resistance and cardio work. Consistency beats intensity — showing up regularly with basic equipment will always outperform sporadic sessions with expensive machines. Browse our Sports & Fitness category for the best deals on all the items above.",
      },
    ],
  },
  "kitchen-essentials": {
    category: "Kitchen",
    title: "Kitchen Essentials Every Home Cook Needs",
    author: "Souqona Team",
    date: "February 28, 2025",
    readTime: "4 min read",
    color: "#D97706",
    bg: "#FFF7ED",
    intro: "Upgrade your cooking setup with these must-have tools — from knife sets to smart appliances. You don't need a professional kitchen to cook like a pro.",
    sections: [
      {
        heading: "A Proper Chef's Knife",
        body: "One good knife beats a block of mediocre ones. An 8-inch chef's knife will handle 90% of prep work — chopping, slicing, dicing. Look for full-tang construction and a comfortable handle. Keep it sharp and it will outlast any gadget in your kitchen.",
      },
      {
        heading: "Cast Iron Skillet",
        body: "A cast iron skillet is virtually indestructible and gets better with use. It transitions seamlessly from stovetop to oven, retains heat beautifully, and can sear a steak better than almost any other pan. Seasoned properly, it's naturally non-stick.",
      },
      {
        heading: "Instant-Read Thermometer",
        body: "A digital thermometer removes all guesswork from cooking meat, bread, and confectionery. It's one of the cheapest tools in a professional kitchen and one of the most impactful for home cooks. No more cutting into chicken to check if it's done.",
      },
      {
        heading: "Bench Scraper",
        body: "The bench scraper is the most underrated kitchen tool. Use it to transfer chopped vegetables, clean your work surface, portion dough, and scrape up anything stuck to the counter. Once you own one, you'll wonder how you managed without it.",
      },
      {
        heading: "A Stand Blender",
        body: "A powerful blender opens up soups, smoothies, sauces, and more. Modern mid-range models are nearly as capable as professional-grade blenders at a fraction of the cost. It's a once-a-decade purchase worth doing properly.",
      },
    ],
  },
};

export default function BlogPostPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const post = POSTS[slug];

  if (!post) {
    return (
      <div className="min-h-screen bg-[#F7F4EF] flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24">
          <p className="text-6xl font-black text-gray-200 mb-4">404</p>
          <p className="text-xl font-bold text-[#0F1F3D] mb-2">Post not found</p>
          <p className="text-gray-500 text-sm mb-8">This article doesn't exist or may have been moved.</p>
          <Link href="/blog">
            <button className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white rounded-xl hover:brightness-110 transition"
              style={{ background: "#FF5533" }}>
              <ArrowLeft className="w-4 h-4" /> Back to Blog
            </button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F4EF] flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-3xl mx-auto px-6 py-14">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-[#FF5533] transition mb-6">
                <ArrowLeft className="w-4 h-4" /> Back to Blog
              </Link>
              <span
                className="inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4"
                style={{ background: post.bg, color: post.color }}
              >
                {post.category}
              </span>
              <h1 className="text-4xl md:text-5xl font-black text-[#0F1F3D] leading-tight mb-4">{post.title}</h1>
              <p className="text-gray-500 text-lg leading-relaxed mb-6">{post.intro}</p>
              <div className="flex items-center gap-5 text-sm text-gray-400">
                <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />{post.author}</span>
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{post.date}</span>
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{post.readTime}</span>
              </div>
            </motion.div>
          </div>
          {/* Colour bar */}
          <div className="h-1 w-full" style={{ background: post.color }} />
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-6 py-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 md:p-10 space-y-8"
          >
            {post.sections.map(({ heading, body }, i) => (
              <motion.div
                key={heading}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                viewport={{ once: true }}
              >
                <h2 className="text-base font-black text-[#0F1F3D] mb-2">{heading}</h2>
                <p className="text-sm text-gray-600 leading-relaxed">{body}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Back link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-10 text-center"
          >
            <Link href="/blog">
              <button className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white rounded-xl hover:brightness-110 transition"
                style={{ background: "#0F1F3D" }}>
                <ArrowLeft className="w-4 h-4" /> Back to Blog
              </button>
            </Link>
          </motion.div>
        </div>
      </main>

      <Footer />
      <ChatWidget />
    </div>
  );
}
