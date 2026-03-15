import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, BookOpen } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type Category = "update" | "roadmap" | "announcement" | "tutorial" | "research";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateBlogPostModal({ onClose, onSuccess }: Props) {
  const [form, setForm] = useState({
    title: "",
    slug: "",
    summary: "",
    content: "",
    category: "update" as Category,
    tags: "",
    authorName: "AgentEscrow Team",
    coverImage: "",
    published: true,
  });

  const createPost = trpc.blog.create.useMutation({
    onSuccess: () => {
      toast.success("Blog post published successfully!");
      onSuccess();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create post");
    },
  });

  const handleTitleChange = (title: string) => {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 128);
    setForm((f) => ({ ...f, title, slug }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.slug || !form.summary || !form.content) {
      toast.error("Please fill in all required fields");
      return;
    }
    createPost.mutate(form);
  };

  const inputCls = "bg-[oklch(0.1_0.015_260)] border-[oklch(0.3_0.04_260/0.5)] text-[oklch(0.92_0.02_200)] placeholder:text-[oklch(0.4_0.03_240)] focus:border-[oklch(0.78_0.22_195/0.6)] focus:ring-0 font-mono text-sm";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-2xl my-8 rounded-xl border border-[oklch(0.78_0.22_195/0.3)] bg-[oklch(0.09_0.015_260)] shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-[oklch(0.2_0.03_260/0.5)]">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[oklch(0.78_0.22_195)]" />
              <h2 className="font-['Orbitron'] text-base font-bold text-[oklch(0.92_0.02_200)]">
                NEW BLOG POST
              </h2>
            </div>
            <button onClick={onClose} className="text-[oklch(0.55_0.04_220)] hover:text-[oklch(0.92_0.02_200)] transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label className="text-[oklch(0.65_0.04_220)] text-xs font-mono mb-1.5 block">Title *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="ERC-8183 v1.2 Released"
                  className={inputCls}
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <Label className="text-[oklch(0.65_0.04_220)] text-xs font-mono mb-1.5 block">Slug (auto-generated)</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  placeholder="erc-8183-v1-2-released"
                  className={inputCls}
                  required
                />
              </div>

              <div>
                <Label className="text-[oklch(0.65_0.04_220)] text-xs font-mono mb-1.5 block">Category *</Label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as Category }))}
                  className={`w-full h-9 rounded-md px-3 ${inputCls}`}
                >
                  <option value="update">Protocol Update</option>
                  <option value="roadmap">Roadmap</option>
                  <option value="announcement">Announcement</option>
                  <option value="tutorial">Tutorial</option>
                  <option value="research">Research</option>
                </select>
              </div>

              <div>
                <Label className="text-[oklch(0.65_0.04_220)] text-xs font-mono mb-1.5 block">Author Name</Label>
                <Input
                  value={form.authorName}
                  onChange={(e) => setForm((f) => ({ ...f, authorName: e.target.value }))}
                  placeholder="AgentEscrow Team"
                  className={inputCls}
                />
              </div>

              <div className="sm:col-span-2">
                <Label className="text-[oklch(0.65_0.04_220)] text-xs font-mono mb-1.5 block">Summary * (shown in card preview)</Label>
                <textarea
                  value={form.summary}
                  onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
                  placeholder="A brief summary of this post..."
                  rows={2}
                  className={`w-full rounded-md px-3 py-2 resize-none ${inputCls}`}
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <Label className="text-[oklch(0.65_0.04_220)] text-xs font-mono mb-1.5 block">Content * (Markdown supported)</Label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  placeholder="# Heading&#10;&#10;Write your post content here. **Markdown** is supported."
                  rows={10}
                  className={`w-full rounded-md px-3 py-2 resize-y ${inputCls}`}
                  required
                />
              </div>

              <div>
                <Label className="text-[oklch(0.65_0.04_220)] text-xs font-mono mb-1.5 block">Tags (comma separated)</Label>
                <Input
                  value={form.tags}
                  onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                  placeholder="erc-8183, escrow, web3"
                  className={inputCls}
                />
              </div>

              <div>
                <Label className="text-[oklch(0.65_0.04_220)] text-xs font-mono mb-1.5 block">Cover Image URL (optional)</Label>
                <Input
                  value={form.coverImage}
                  onChange={(e) => setForm((f) => ({ ...f, coverImage: e.target.value }))}
                  placeholder="https://cdn.example.com/cover.jpg"
                  className={inputCls}
                />
              </div>

              <div className="sm:col-span-2 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="published"
                  checked={form.published}
                  onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
                  className="w-4 h-4 accent-[oklch(0.78_0.22_195)]"
                />
                <Label htmlFor="published" className="text-[oklch(0.65_0.04_220)] text-sm font-mono cursor-pointer">
                  Publish immediately (uncheck to save as draft)
                </Label>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 border-[oklch(0.3_0.04_260/0.5)] text-[oklch(0.55_0.04_220)] hover:text-[oklch(0.92_0.02_200)]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createPost.isPending}
                className="flex-1 bg-[oklch(0.78_0.22_195/0.15)] border border-[oklch(0.78_0.22_195/0.4)] text-[oklch(0.78_0.22_195)] hover:bg-[oklch(0.78_0.22_195/0.25)]"
              >
                {createPost.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Publishing...</>
                ) : (
                  <><BookOpen className="w-4 h-4 mr-2" /> {form.published ? "Publish Post" : "Save Draft"}</>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
