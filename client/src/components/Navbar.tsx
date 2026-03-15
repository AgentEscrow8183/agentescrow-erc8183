import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, BarChart2, LayoutDashboard, Code2, UserCircle, Home, Github, Twitter, BookOpen, Newspaper } from "lucide-react";
import NotificationBell from "./NotificationBell";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663367353410/AiMHYdbcTQcw9MdrNdMT2X/logo-agentescrow_432019ee.jpeg";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/blog", label: "Blog", icon: Newspaper },
  { href: "/docs", label: "Docs", icon: BookOpen },
  { href: "/contract", label: "Contract", icon: Code2 },
  { href: "/register", label: "Register", icon: UserCircle },
];

export default function Navbar() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[oklch(0.78_0.22_195/0.15)] bg-[oklch(0.07_0.015_260/0.92)] backdrop-blur-md">
      <div className="container flex items-center justify-between h-16 px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-[oklch(0.78_0.22_195/0.5)] glow-cyan shrink-0">
            <img
              src={LOGO_URL}
              alt="AgentEscrow Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-['Orbitron'] font-bold text-sm tracking-wider text-[oklch(0.92_0.02_200)] group-hover:text-[oklch(0.78_0.22_195)] transition-colors whitespace-nowrap">
              AGENT<span className="text-[oklch(0.78_0.22_195)]">ESCROW</span>
            </span>
            <span className="hidden sm:block text-[10px] font-mono text-[oklch(0.55_0.04_220)] border border-[oklch(0.55_0.04_220/0.3)] px-1.5 py-0.5 rounded">
              ERC-8183
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium tracking-wide transition-all ${
                location === link.href
                  ? "text-[oklch(0.78_0.22_195)] bg-[oklch(0.78_0.22_195/0.08)]"
                  : "text-[oklch(0.55_0.04_220)] hover:text-[oklch(0.92_0.02_200)] hover:bg-[oklch(0.78_0.22_195/0.04)]"
              }`}
            >
              <link.icon className="w-3.5 h-3.5" />
              {link.label}
            </Link>
          ))}
        </div>

        {/* Social links - desktop */}
        <div className="hidden lg:flex items-center gap-1 mr-1">
          <a
            href="https://x.com/_agentescrow"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-[oklch(0.55_0.04_220)] hover:text-[oklch(0.78_0.22_195)] transition-colors rounded hover:bg-[oklch(0.78_0.22_195/0.06)]"
            title="Follow on X"
          >
            <Twitter className="w-4 h-4" />
          </a>
          <a
            href="https://github.com/AgentEscrow8183"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-[oklch(0.55_0.04_220)] hover:text-[oklch(0.78_0.22_195)] transition-colors rounded hover:bg-[oklch(0.78_0.22_195/0.06)]"
            title="GitHub"
          >
            <Github className="w-4 h-4" />
          </a>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 shrink-0">
          <NotificationBell />
          <div className="hidden sm:block">
            <ConnectButton
              accountStatus="avatar"
              chainStatus="none"
              showBalance={false}
            />
          </div>
          <div className="sm:hidden">
            <ConnectButton
              accountStatus="avatar"
              chainStatus="none"
              showBalance={false}
              label="Connect"
            />
          </div>
          {/* Mobile menu toggle */}
          <button
            className="lg:hidden p-2 text-[oklch(0.55_0.04_220)] hover:text-[oklch(0.92_0.02_200)] rounded hover:bg-[oklch(0.78_0.22_195/0.08)] transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-t border-[oklch(0.78_0.22_195/0.15)] bg-[oklch(0.07_0.015_260/0.98)]"
          >
            <div className="container px-4 py-3 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    location === link.href
                      ? "text-[oklch(0.78_0.22_195)] bg-[oklch(0.78_0.22_195/0.1)] border border-[oklch(0.78_0.22_195/0.2)]"
                      : "text-[oklch(0.65_0.04_220)] hover:text-[oklch(0.92_0.02_200)] hover:bg-[oklch(0.78_0.22_195/0.05)]"
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}
              {/* Social links in mobile menu */}
              <div className="flex items-center gap-2 px-4 pt-3 mt-1 border-t border-[oklch(0.78_0.22_195/0.1)]">
                <a
                  href="https://x.com/_agentescrow"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[oklch(0.65_0.04_220)] hover:text-[oklch(0.78_0.22_195)] hover:bg-[oklch(0.78_0.22_195/0.05)] transition-all"
                >
                  <Twitter className="w-4 h-4" />
                  <span>@_agentescrow</span>
                </a>
                <a
                  href="https://github.com/AgentEscrow8183"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[oklch(0.65_0.04_220)] hover:text-[oklch(0.78_0.22_195)] hover:bg-[oklch(0.78_0.22_195/0.05)] transition-all"
                >
                  <Github className="w-4 h-4" />
                  <span>GitHub</span>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
