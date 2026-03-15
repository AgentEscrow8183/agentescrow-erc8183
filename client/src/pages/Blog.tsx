import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Calendar, Tag, ArrowRight, Rss, BookOpen, Megaphone, Map, GraduationCap, FlaskConical, Plus, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import CreateBlogPostModal from "@/components/CreateBlogPostModal";

const CATEGORY_CONFIG = {
  update: { label: "Protocol Update", icon: Rss, color: "oklch(0.78 0.22 195)" },
  roadmap: { label: "Roadmap", icon: Map, color: "oklch(0.78 0.22 280)" },
  announcement: { label: "Announcement", icon: Megaphone, color: "oklch(0.78 0.22 60)" },
  tutorial: { label: "Tutorial", icon: GraduationCap, color: "oklch(0.78 0.22 140)" },
  research: { label: "Research", icon: FlaskConical, color: "oklch(0.78 0.22 20)" },
} as const;

type Category = keyof typeof CATEGORY_CONFIG;

function formatDate(d: Date | string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function readTime(content: string) {
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default function Blog() {
  const { user, isAuthenticated } = useAuth();
  const [activeCategory, setActiveCategory] = useState<Category | "all">("all");
  const [showCreate, setShowCreate] = useState(false);

  const { data: posts, isLoading, refetch } = trpc.blog.list.useQuery({
    category: activeCategory === "all" ? undefined : activeCategory,
  });

  // Admin check: wallet-based — any connected wallet can create posts for now
  // In production, check against an admin wallet address list
  const isAdmin = isAuthenticated;

  return (
    <div className="min-h-screen bg-[oklch(0.06_0.015_260)]">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-12 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-64 h-64 rounded-full bg-[oklch(0.78_0.22_195/0.04)] blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full bg-[oklch(0.78_0.22_280/0.04)] blur-3xl" />
        </div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[oklch(0.78_0.22_195/0.3)] bg-[oklch(0.78_0.22_195/0.05)] text-[oklch(0.78_0.22_195)] text-sm font-mono mb-6">
              <BookOpen className="w-3.5 h-3.5" />
              PROTOCOL UPDATES & ANNOUNCEMENTS
            </div>
            <h1 className="font-['Orbitron'] text-4xl sm:text-5xl font-bold text-[oklch(0.92_0.02_200)] mb-4">
              AGENT<span className="text-[oklch(0.78_0.22_195)]">ESCROW</span> BLOG
            </h1>
            <p className="text-[oklch(0.65_0.04_220)] text-lg max-w-2xl mx-auto">
              Stay up to date with protocol developments, roadmap milestones, research insights, and community announcements.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters + Create Button */}
      <section className="px-4 pb-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {(["all", "update", "roadmap", "announcement", "tutorial", "research"] as const).map((cat) => {
              const isAll = cat === "all";
              const cfg = isAll ? null : CATEGORY_CONFIG[cat];
              const Icon = cfg?.icon ?? BookOpen;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono border transition-all ${
                    activeCategory === cat
                      ? "border-[oklch(0.78_0.22_195/0.6)] bg-[oklch(0.78_0.22_195/0.12)] text-[oklch(0.78_0.22_195)]"
                      : "border-[oklch(0.3_0.04_260/0.5)] bg-transparent text-[oklch(0.55_0.04_220)] hover:border-[oklch(0.78_0.22_195/0.3)] hover:text-[oklch(0.78_0.22_195)]"
                  }`}
                >
                  {isAll ? <BookOpen className="w-3 h-3" /> : <Icon className="w-3 h-3" />}
                  {isAll ? "All Posts" : cfg!.label}
                </button>
              );
            })}
          </div>
          {isAdmin && (
            <Button
              onClick={() => setShowCreate(true)}
              size="sm"
              className="bg-[oklch(0.78_0.22_195/0.15)] border border-[oklch(0.78_0.22_195/0.4)] text-[oklch(0.78_0.22_195)] hover:bg-[oklch(0.78_0.22_195/0.25)] shrink-0"
            >
              <Plus className="w-4 h-4 mr-1" />
              New Post
            </Button>
          )}
        </div>
      </section>

      {/* Posts Grid */}
      <section className="px-4 pb-24">
        <div className="max-w-5xl mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[oklch(0.78_0.22_195)]" />
            </div>
          ) : !posts || posts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <BookOpen className="w-12 h-12 text-[oklch(0.35_0.04_260)] mx-auto mb-4" />
              <p className="text-[oklch(0.55_0.04_220)] font-mono">No posts published yet.</p>
              {isAdmin && (
                <Button
                  onClick={() => setShowCreate(true)}
                  className="mt-4 bg-[oklch(0.78_0.22_195/0.15)] border border-[oklch(0.78_0.22_195/0.4)] text-[oklch(0.78_0.22_195)]"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Create First Post
                </Button>
              )}
            </motion.div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {posts.map((post, i) => {
                  const cfg = CATEGORY_CONFIG[post.category as Category] ?? CATEGORY_CONFIG.update;
                  const Icon = cfg.icon;
                  const tags = post.tags ? post.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
                  return (
                    <motion.div
                      key={post.slug}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link href={`/blog/${post.slug}`}>
                        <div className="group h-full flex flex-col rounded-xl border border-[oklch(0.3_0.04_260/0.4)] bg-[oklch(0.09_0.015_260/0.8)] hover:border-[oklch(0.78_0.22_195/0.4)] hover:bg-[oklch(0.09_0.015_260)] transition-all duration-300 overflow-hidden cursor-pointer">
                          {/* Cover Image or Gradient */}
                          <div className="relative h-40 overflow-hidden">
                            {post.coverImage ? (
                              <img
                                src={post.coverImage}
                                alt={post.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div
                                className="w-full h-full flex items-center justify-center"
                                style={{ background: `linear-gradient(135deg, oklch(0.1 0.02 260), oklch(0.12 0.04 280))` }}
                              >
                                <Icon className="w-12 h-12 opacity-20" style={{ color: cfg.color }} />
                              </div>
                            )}
                            <div className="absolute top-3 left-3">
                              <span
                                className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-mono border"
                                style={{
                                  color: cfg.color,
                                  borderColor: `${cfg.color}44`,
                                  background: `${cfg.color}11`,
                                }}
                              >
                                <Icon className="w-3 h-3" />
                                {cfg.label}
                              </span>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex flex-col flex-1 p-5">
                            <h2 className="font-['Orbitron'] text-sm font-bold text-[oklch(0.92_0.02_200)] group-hover:text-[oklch(0.78_0.22_195)] transition-colors line-clamp-2 mb-2">
                              {post.title}
                            </h2>
                            <p className="text-[oklch(0.55_0.04_220)] text-xs leading-relaxed line-clamp-3 flex-1 mb-4">
                              {post.summary}
                            </p>

                            {/* Tags */}
                            {tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-4">
                                {tags.slice(0, 3).map((tag) => (
                                  <span
                                    key={tag}
                                    className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-mono bg-[oklch(0.15_0.02_260)] text-[oklch(0.55_0.04_220)] border border-[oklch(0.25_0.03_260/0.5)]"
                                  >
                                    <Tag className="w-2 h-2" />
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-3 border-t border-[oklch(0.2_0.03_260/0.5)]">
                              <div className="flex items-center gap-1.5 text-[oklch(0.45_0.03_240)] text-[10px] font-mono">
                                <Calendar className="w-3 h-3" />
                                {formatDate(post.publishedAt)}
                              </div>
                              <div className="flex items-center gap-1 text-[oklch(0.78_0.22_195)] text-[10px] font-mono group-hover:gap-2 transition-all">
                                Read {readTime(post.content)} min
                                <ArrowRight className="w-3 h-3" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </section>

      {/* Create Post Modal */}
      {showCreate && (
        <CreateBlogPostModal
          onClose={() => setShowCreate(false)}
          onSuccess={() => {
            setShowCreate(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}
