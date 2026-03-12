/* ==========================================================
   Footer — AgentEscrow ERC-8183
   Design: Dark footer with links and cosmic gradient divider
   Responsive: stacked on mobile, 4-col on lg+
   ========================================================== */

import { ExternalLink } from "lucide-react";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663364387669/fEjhcY4s7LeuDVrQJHn5VB/ae-icon-v4-QFJAJsj8FMjz5GGVfkXy5E.webp";

const XIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const links = {
  Protocol: [
    { label: "EIP-8183 Specification", href: "https://eips.ethereum.org/EIPS/eip-8183", external: true },
    { label: "GitHub Repository", href: "https://github.com/AgentEscrow8183/agentescrow-erc8183", external: true },
    { label: "Release v0.1.0", href: "https://github.com/AgentEscrow8183/agentescrow-erc8183/releases/tag/v0.1.0", external: true },
    { label: "Discussion Forum", href: "https://ethereum-magicians.org/t/erc-8183-agentic-commerce/27902", external: true },
  ],
  Authors: [
    { label: "@dcrapis (Davide Crapis)", href: "https://github.com/dcrapis", external: true },
    { label: "@ai-virtual-b (Bryan Lim)", href: "https://github.com/ai-virtual-b", external: true },
    { label: "@twx-virtuals (Tay Weixiong)", href: "https://github.com/twx-virtuals", external: true },
    { label: "@Zuhwa (Chooi Zuhwa)", href: "https://github.com/Zuhwa", external: true },
  ],
  Related: [
    { label: "ERC-8004 (Trustless Agents)", href: "https://eips.ethereum.org/EIPS/eip-8004", external: true },
    { label: "ERC-2771 (Meta-Transactions)", href: "https://eips.ethereum.org/EIPS/eip-2771", external: true },
    { label: "ERC-2612 (Permit)", href: "https://eips.ethereum.org/EIPS/eip-2612", external: true },
    { label: "Virtuals Protocol", href: "https://virtuals.io", external: true },
  ],
};

export default function Footer() {
  return (
    <footer className="relative border-t border-white/[0.06]">
      {/* Gradient divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.72_0.18_195/0.4)] to-transparent" />
      {/* Ambient glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 sm:w-96 h-32 sm:h-48 rounded-full bg-[oklch(0.55_0.22_290/0.05)] blur-3xl pointer-events-none" />

      <div className="container relative z-10 py-12 sm:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 mb-10 sm:mb-12">
          {/* Brand — full width on mobile */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl overflow-hidden ring-1 ring-[oklch(0.72_0.18_195/0.3)] bg-[oklch(0.1_0.03_265)]">
                <img src={LOGO_URL} alt="AgentEscrow Logo" className="w-full h-full object-contain p-0.5" />
              </div>
              <div>
                <div className="text-white font-bold text-base" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  AgentEscrow
                </div>
                <div className="text-[10px] text-[oklch(0.72_0.18_195)] font-mono tracking-widest">ERC-8183</div>
              </div>
            </div>
            <p className="text-sm text-[oklch(0.55_0.03_220)] leading-relaxed mb-4">
              The open, permissionless standard for agent commerce applications with escrow and
              evaluator attestation on Ethereum.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[oklch(0.72_0.18_195/0.1)] border border-[oklch(0.72_0.18_195/0.2)] text-xs text-[oklch(0.72_0.18_195)] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-[oklch(0.78_0.18_75)]" />
                Draft
              </span>
              <span className="text-xs text-[oklch(0.45_0.03_220)] font-mono">2026-02-25</span>
            </div>
          </div>

          {/* Links */}
          {(Object.entries(links) as [string, { label: string; href: string; external: boolean }[]][]).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-xs font-semibold text-[oklch(0.55_0.03_220)] uppercase tracking-wider mb-3 sm:mb-4">
                {category}
              </h4>
              <ul className="flex flex-col gap-2 sm:gap-2.5">
                {items.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      target={item.external ? "_blank" : undefined}
                      rel={item.external ? "noopener noreferrer" : undefined}
                      className="flex items-center gap-1.5 text-xs sm:text-sm text-[oklch(0.6_0.03_220)] hover:text-[oklch(0.85_0.18_195)] transition-colors group"
                    >
                      <span className="leading-snug">{item.label}</span>
                      {item.external && (
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-6 sm:pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[oklch(0.45_0.03_220)] font-mono text-center sm:text-left">
            ERC-8183 is licensed under{" "}
            <a
              href="https://creativecommons.org/publicdomain/zero/1.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[oklch(0.6_0.03_220)] hover:text-[oklch(0.72_0.18_195)] transition-colors"
            >
              CC0 (Public Domain)
            </a>
          </p>
          <div className="flex items-center gap-3">
            <a
              href="https://x.com/_agentescrow"
              target="_blank"
              rel="noopener noreferrer"
              title="@_agentescrow on X"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[oklch(0.5_0.03_220)] hover:text-white hover:bg-white/[0.05] transition-all"
            >
              <XIcon />
            </a>
            <a
              href="https://github.com/AgentEscrow8183/agentescrow-erc8183"
              target="_blank"
              rel="noopener noreferrer"
              title="AgentEscrow ERC-8183 Repository on GitHub"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[oklch(0.5_0.03_220)] hover:text-white hover:bg-white/[0.05] transition-all"
            >
              <GithubIcon />
            </a>
            <div className="w-px h-4 bg-white/[0.08]" />
            <span className="text-xs text-[oklch(0.35_0.03_220)] font-mono hidden sm:block">
              Ethereum Improvement Proposals
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
