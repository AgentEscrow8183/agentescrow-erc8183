/* ==========================================================
   HeroSection — AgentEscrow ERC-8183
   Design: Full-viewport cosmic hero with animated particles,
   gradient text, and floating state badges
   Responsive: mobile-first, stacked on small screens
   ========================================================== */

import { useEffect, useRef } from "react";
import { ArrowRight, FileText, Shield, Zap, Users } from "lucide-react";

const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663364387669/fEjhcY4s7LeuDVrQJHn5VB/hero-bg-3gcBYyWuhJG8skYSNcwKd7.webp";
const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663364387669/fEjhcY4s7LeuDVrQJHn5VB/ae-icon-v4-QFJAJsj8FMjz5GGVfkXy5E.webp";

const stateBadges = [
  { label: "Open", color: "state-open" },
  { label: "Funded", color: "state-funded" },
  { label: "Submitted", color: "state-submitted" },
  { label: "Completed", color: "state-completed" },
  { label: "Rejected", color: "state-rejected" },
  { label: "Expired", color: "state-expired" },
];

const stats = [
  { value: "4", label: "Job States", icon: <Zap className="w-4 h-4" /> },
  { value: "3", label: "Core Roles", icon: <Users className="w-4 h-4" /> },
  { value: "7", label: "Core Functions", icon: <FileText className="w-4 h-4" /> },
  { value: "100%", label: "Trustless", icon: <Shield className="w-4 h-4" /> },
];

export default function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles: { x: number; y: number; vx: number; vy: number; r: number; alpha: number }[] = [];
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.5 + 0.1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(114, 232, 218, ${p.alpha})`;
        ctx.fill();
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(114, 232, 218, ${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${HERO_BG})` }} />
      <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.08_0.025_265/0.55)] via-[oklch(0.08_0.025_265/0.45)] to-[oklch(0.08_0.025_265)]" />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 container pt-20 sm:pt-24 pb-12 sm:pb-16">
        <div className="max-w-4xl mx-auto text-center px-2">

          {/* Logo mark + badge row */}
          <div className="flex flex-col items-center gap-4 mb-6 sm:mb-8">
            {/* Logo */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden ring-2 ring-[oklch(0.72_0.18_195/0.4)] shadow-[0_0_30px_rgba(114,232,218,0.4)] bg-[oklch(0.1_0.03_265)]">
              <img src={LOGO_URL} alt="AgentEscrow Logo" className="w-full h-full object-contain p-1" />
            </div>
            {/* Status badge */}
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-[oklch(0.72_0.18_195/0.1)] border border-[oklch(0.72_0.18_195/0.25)]">
              <span className="w-2 h-2 rounded-full bg-[oklch(0.72_0.18_195)] pulse-glow flex-shrink-0" />
              <span className="text-[10px] sm:text-xs font-semibold text-[oklch(0.85_0.18_195)] tracking-widest uppercase font-mono">
                Draft · Standards Track: ERC · 2026-02-25
              </span>
            </div>
          </div>

          {/* Title */}
          <h1
            className="text-4xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-4 sm:mb-6"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <span className="text-white">Agent</span>
            <span className="gradient-text-teal">Escrow</span>
            <br />
            <span className="text-white text-2xl sm:text-4xl lg:text-5xl font-semibold">
              Agentic Commerce Protocol
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-[oklch(0.7_0.03_220)] max-w-2xl mx-auto mb-6 sm:mb-8 leading-relaxed px-2">
            The open, permissionless standard for AI agent commerce — trustless escrow with
            evaluator attestation programmed directly into Ethereum smart contracts.
          </p>

          {/* State badges */}
          <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-8 sm:mb-10">
            {stateBadges.map((badge) => (
              <span
                key={badge.label}
                className={`${badge.color} px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold font-mono tracking-wider`}
              >
                {badge.label}
              </span>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col xs:flex-row flex-wrap gap-3 justify-center mb-10 sm:mb-16 px-2">
            <a
              href="https://eips.ethereum.org/EIPS/eip-8183"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[oklch(0.72_0.18_195)] text-[oklch(0.08_0.025_265)] font-bold text-sm hover:bg-[oklch(0.78_0.18_195)] transition-all shadow-[0_0_30px_rgba(114,232,218,0.3)] hover:shadow-[0_0_40px_rgba(114,232,218,0.5)] w-full xs:w-auto"
            >
              Read EIP-8183
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="https://github.com/AgentEscrow8183/agentescrow-erc8183"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl glass-card text-white font-semibold text-sm hover:bg-white/[0.07] transition-all border border-white/[0.12] w-full xs:w-auto"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current flex-shrink-0"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
              GitHub
            </a>
            <a
              href="https://x.com/_agentescrow"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl glass-card text-[oklch(0.7_0.03_220)] font-semibold text-sm hover:bg-white/[0.07] hover:text-white transition-all border border-white/[0.12] w-full xs:w-auto"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current flex-shrink-0"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              @_agentescrow
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="glass-card p-3 sm:p-4 text-center">
                <div className="flex justify-center mb-1.5 sm:mb-2 text-[oklch(0.72_0.18_195)]">
                  {stat.icon}
                </div>
                <div
                  className="text-xl sm:text-2xl font-bold gradient-text-teal mb-0.5 sm:mb-1"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {stat.value}
                </div>
                <div className="text-[10px] sm:text-xs text-[oklch(0.6_0.03_220)]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator — hidden on very small screens */}
      <div className="hidden sm:flex absolute bottom-6 left-1/2 -translate-x-1/2 flex-col items-center gap-2 text-[oklch(0.5_0.03_220)]">
        <span className="text-xs tracking-widest uppercase font-mono">Scroll</span>
        <div className="w-px h-10 bg-gradient-to-b from-[oklch(0.72_0.18_195/0.5)] to-transparent" />
      </div>
    </section>
  );
}
