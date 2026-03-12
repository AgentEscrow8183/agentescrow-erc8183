/* ==========================================================
   Navbar — AgentEscrow ERC-8183
   Design: Glass navbar with cosmic theme, sticky on scroll
   Responsive: mobile-first, hamburger on <lg
   ========================================================== */

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

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

const navLinks = [
  { label: "Overview", href: "#overview" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "State Machine", href: "#state-machine" },
  { label: "Roles", href: "#roles" },
  { label: "Extensions", href: "#extensions" },
  { label: "Specification", href: "#specification" },
  { label: "Contract", href: "/contract", external: true },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 1024) setMobileOpen(false); };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    setTimeout(() => {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "backdrop-blur-xl bg-[oklch(0.08_0.025_265/0.95)] border-b border-white/[0.07] shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">

            {/* Logo */}
            <a
              href="#"
              className="flex items-center gap-2.5 group flex-shrink-0"
              onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            >
              <div
                className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden flex-shrink-0 transition-all duration-300"
                style={{
                  background: "oklch(0.1 0.03 265)",
                  boxShadow: "0 0 16px rgba(0,229,204,0.35)",
                }}
              >
                <img
                  src={LOGO_URL}
                  alt="AgentEscrow Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col leading-none">
                <span
                  className="text-white font-bold text-sm sm:text-base tracking-tight"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  AgentEscrow
                </span>
                <span className="text-[9px] sm:text-[10px] font-mono font-medium tracking-widest" style={{ color: "oklch(0.72 0.18 195)" }}>
                  ERC-8183
                </span>
              </div>
            </a>

            {/* Desktop Nav — visible on xl+ */}
            <nav className="hidden xl:flex items-center gap-0.5">
              {navLinks.map((link) => (
                link.external ? (
                  <a
                    key={link.href}
                    href={link.href}
                    className="px-3 py-1.5 rounded-lg text-[oklch(0.65_0.03_220)] hover:text-white hover:bg-white/[0.05] transition-all text-sm font-medium"
                    style={{ color: "oklch(0.72 0.18 195)" }}
                  >
                    {link.label}
                  </a>
                ) : (
                  <button
                    key={link.href}
                    onClick={() => handleNavClick(link.href)}
                    className="px-3 py-1.5 rounded-lg text-[oklch(0.65_0.03_220)] hover:text-white hover:bg-white/[0.05] transition-all text-sm font-medium"
                  >
                    {link.label}
                  </button>
                )
              ))}
            </nav>

            {/* Desktop CTA — visible on lg+ */}
            <div className="hidden lg:flex items-center gap-2">
              <a
                href="https://x.com/_agentescrow"
                target="_blank"
                rel="noopener noreferrer"
                title="@_agentescrow on X"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[oklch(0.6_0.03_220)] hover:text-white hover:bg-white/[0.06] transition-all"
              >
                <XIcon />
              </a>
              <a
                href="https://github.com/AgentEscrow8183/agentescrow-erc8183"
                target="_blank"
                rel="noopener noreferrer"
                title="AgentEscrow ERC-8183 on GitHub"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[oklch(0.6_0.03_220)] hover:text-white hover:bg-white/[0.06] transition-all"
              >
                <GithubIcon />
              </a>
              <div className="w-px h-5 bg-white/[0.1]" />
              <a
                href="https://ethereum-magicians.org/t/erc-8183-agentic-commerce/27902"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-lg border text-xs font-semibold transition-all whitespace-nowrap"
                style={{
                  background: "oklch(0.72 0.18 195 / 0.12)",
                  borderColor: "oklch(0.72 0.18 195 / 0.35)",
                  color: "oklch(0.85 0.18 195)",
                }}
              >
                Join Discussion
              </a>
              <a
                href="/register"
                className="px-3.5 py-2 rounded-lg border text-xs font-semibold transition-all whitespace-nowrap"
                style={{
                  background: "oklch(0.55 0.18 280 / 0.15)",
                  borderColor: "oklch(0.55 0.18 280 / 0.4)",
                  color: "oklch(0.8 0.15 280)",
                }}
              >
                Register
              </a>
              <a
                href="/dashboard"
                className="px-3.5 py-2 rounded-lg text-xs font-semibold text-black transition-all whitespace-nowrap hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #2dd4bf, #818cf8)" }}
              >
                Launch App
              </a>
            </div>

            {/* Mobile: social icons + hamburger */}
            <div className="flex lg:hidden items-center gap-1">
              <a
                href="https://x.com/_agentescrow"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[oklch(0.6_0.03_220)] hover:text-white transition-all"
              >
                <XIcon />
              </a>
              <a
                href="https://github.com/AgentEscrow8183/agentescrow-erc8183"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[oklch(0.6_0.03_220)] hover:text-white transition-all"
              >
                <GithubIcon />
              </a>
              <button
                className="w-9 h-9 rounded-lg flex items-center justify-center text-[oklch(0.7_0.03_220)] hover:text-white hover:bg-white/[0.05] transition-all ml-1"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            mobileOpen ? "max-h-[480px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div
            className="border-b border-white/[0.07]"
            style={{ background: "oklch(0.07 0.025 265 / 0.98)", backdropFilter: "blur(24px)" }}
          >
            <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className="text-left px-4 py-3 rounded-xl text-[oklch(0.65_0.03_220)] hover:text-white hover:bg-white/[0.05] transition-all text-sm font-medium"
                >
                  {link.label}
                </button>
              ))}
              <div className="mt-3 pt-3 border-t border-white/[0.06] flex flex-col gap-2">
                <a
                  href="/dashboard"
                  className="block w-full px-4 py-3 rounded-xl text-sm font-bold text-center transition-all text-black hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #2dd4bf, #818cf8)" }}
                >
                  🚀 Launch App
                </a>
                <a
                  href="/register"
                  className="block w-full px-4 py-3 rounded-xl text-sm font-semibold text-center transition-all"
                  style={{
                    background: "oklch(0.55 0.18 280 / 0.15)",
                    border: "1px solid oklch(0.55 0.18 280 / 0.4)",
                    color: "oklch(0.8 0.15 280)",
                  }}
                >
                  Register Profile
                </a>
                <a
                  href="https://ethereum-magicians.org/t/erc-8183-agentic-commerce/27902"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full px-4 py-3 rounded-xl text-sm font-semibold text-center transition-all"
                  style={{
                    background: "oklch(0.72 0.18 195 / 0.12)",
                    border: "1px solid oklch(0.72 0.18 195 / 0.3)",
                    color: "oklch(0.85 0.18 195)",
                  }}
                >
                  Join Discussion
                </a>
                <a
                  href="https://eips.ethereum.org/EIPS/eip-8183"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full px-4 py-2.5 text-sm text-center transition-colors"
                  style={{ color: "oklch(0.55 0.03 220)" }}
                >
                  Read EIP-8183 ↗
                </a>
                <a
                  href="https://github.com/AgentEscrow8183/agentescrow-erc8183"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full px-4 py-2.5 text-sm text-center transition-colors"
                  style={{ color: "oklch(0.55 0.03 220)" }}
                >
                  GitHub Repository ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
