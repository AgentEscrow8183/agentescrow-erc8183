import { motion } from "framer-motion";
import { Link, useParams } from "wouter";
import { Calendar, Tag, ArrowLeft, Clock, User, Rss, Map, Megaphone, GraduationCap, FlaskConical, BookOpen, Loader2, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Streamdown } from "streamdown";
import Navbar from "@/components/Navbar";

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

export default function BlogPost() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug ?? "";

  const { data: post, isLoading, error } = trpc.blog.getBySlug.useQuery({ slug }, { enabled: !!slug });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[oklch(0.06_0.015_260)] flex items-center justify-center">
        <Navbar />
        <Loader2 className="w-8 h-8 animate-spin text-[oklch(0.78_0.22_195)]" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-[oklch(0.06_0.015_260)]">
        <Navbar />
        <div className="flex flex-col items-center justify-center pt-40 px-4 text-center">
          <AlertCircle className="w-12 h-12 text-[oklch(0.65_0.22_20)] mb-4" />
          <h1 className="font-['Orbitron'] text-2xl font-bold text-[oklch(0.92_0.02_200)] mb-2">Post Not Found</h1>
          <p className="text-[oklch(0.55_0.04_220)] mb-6">This blog post doesn't exist or has been removed.</p>
          <Link href="/blog">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[oklch(0.78_0.22_195/0.4)] text-[oklch(0.78_0.22_195)] hover:bg-[oklch(0.78_0.22_195/0.1)] transition-colors font-mono text-sm">
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const cfg = CATEGORY_CONFIG[post.category as Category] ?? CATEGORY_CONFIG.update;
  const Icon = cfg.icon;
  const tags = post.tags ? post.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];

  return (
    <div className="min-h-screen bg-[oklch(0.06_0.015_260)]">
      <Navbar />

      {/* Cover Image */}
      {post.coverImage && (
        <div className="relative w-full h-64 sm:h-80 overflow-hidden">
          <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[oklch(0.06_0.015_260)]" />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 pt-28 pb-20">
        {/* Back */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
          <Link href="/blog">
            <button className="flex items-center gap-2 text-[oklch(0.55_0.04_220)] hover:text-[oklch(0.78_0.22_195)] transition-colors font-mono text-sm">
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </button>
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          {/* Category Badge */}
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono border mb-4"
            style={{ color: cfg.color, borderColor: `${cfg.color}44`, background: `${cfg.color}11` }}
          >
            <Icon className="w-3 h-3" />
            {cfg.label}
          </span>

          <h1 className="font-['Orbitron'] text-2xl sm:text-3xl lg:text-4xl font-bold text-[oklch(0.92_0.02_200)] leading-tight mb-4">
            {post.title}
          </h1>

          <p className="text-[oklch(0.65_0.04_220)] text-base leading-relaxed mb-6">
            {post.summary}
          </p>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-[oklch(0.45_0.03_240)] text-xs font-mono pb-6 border-b border-[oklch(0.2_0.03_260/0.5)]">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              {post.authorName}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(post.publishedAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {readTime(post.content)} min read
            </span>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-4">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono bg-[oklch(0.12_0.02_260)] text-[oklch(0.55_0.04_220)] border border-[oklch(0.25_0.03_260/0.5)]"
                >
                  <Tag className="w-2.5 h-2.5" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </motion.div>

        {/* Content */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="prose prose-invert prose-sm sm:prose-base max-w-none
            prose-headings:font-['Orbitron'] prose-headings:text-[oklch(0.92_0.02_200)]
            prose-p:text-[oklch(0.65_0.04_220)] prose-p:leading-relaxed
            prose-a:text-[oklch(0.78_0.22_195)] prose-a:no-underline hover:prose-a:underline
            prose-code:text-[oklch(0.78_0.22_195)] prose-code:bg-[oklch(0.12_0.02_260)] prose-code:px-1 prose-code:rounded
            prose-pre:bg-[oklch(0.1_0.015_260)] prose-pre:border prose-pre:border-[oklch(0.25_0.03_260/0.5)]
            prose-blockquote:border-l-[oklch(0.78_0.22_195)] prose-blockquote:text-[oklch(0.55_0.04_220)]
            prose-strong:text-[oklch(0.92_0.02_200)]
            prose-hr:border-[oklch(0.2_0.03_260/0.5)]
            prose-li:text-[oklch(0.65_0.04_220)]"
        >
          <Streamdown>{post.content}</Streamdown>
        </motion.article>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 pt-8 border-t border-[oklch(0.2_0.03_260/0.5)] flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <Link href="/blog">
            <button className="flex items-center gap-2 text-[oklch(0.55_0.04_220)] hover:text-[oklch(0.78_0.22_195)] transition-colors font-mono text-sm">
              <ArrowLeft className="w-4 h-4" />
              More Posts
            </button>
          </Link>
          <div className="flex items-center gap-3">
            <a
              href="https://x.com/_agentescrow"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[oklch(0.3_0.04_260/0.5)] text-[oklch(0.55_0.04_220)] hover:border-[oklch(0.78_0.22_195/0.4)] hover:text-[oklch(0.78_0.22_195)] transition-colors text-xs font-mono"
            >
              Share on X
            </a>
            <a
              href="https://github.com/AgentEscrow8183"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[oklch(0.3_0.04_260/0.5)] text-[oklch(0.55_0.04_220)] hover:border-[oklch(0.78_0.22_195/0.4)] hover:text-[oklch(0.78_0.22_195)] transition-colors text-xs font-mono"
            >
              GitHub
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
