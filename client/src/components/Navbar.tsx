import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Zap } from "lucide-react";
import NotificationBell from "./NotificationBell";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/contract", label: "Contract" },
  { href: "/register", label: "Register" },
];

export default function Navbar() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[oklch(0.78_0.22_195/0.15)] bg-[oklch(0.07_0.015_260/0.9)] backdrop-blur-md">
      <div className="container flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded border border-[oklch(0.78_0.22_195/0.5)] bg-[oklch(0.78_0.22_195/0.1)] flex items-center justify-center glow-cyan">
            <Zap className="w-4 h-4 text-[oklch(0.78_0.22_195)]" />
          </div>
          <span className="font-['Orbitron'] font-bold text-sm tracking-wider text-[oklch(0.92_0.02_200)] group-hover:text-[oklch(0.78_0.22_195)] transition-colors">
            AGENT<span className="text-[oklch(0.78_0.22_195)]">ESCROW</span>
          </span>
          <span className="hidden sm:block text-xs font-mono text-[oklch(0.55_0.04_220)] border border-[oklch(0.55_0.04_220/0.3)] px-1.5 py-0.5 rounded">
            ERC-8183
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium tracking-wide transition-colors ${
                location === link.href
                  ? "text-[oklch(0.78_0.22_195)] text-glow-cyan"
                  : "text-[oklch(0.55_0.04_220)] hover:text-[oklch(0.92_0.02_200)]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <NotificationBell />
          <ConnectButton
            accountStatus="avatar"
            chainStatus="icon"
            showBalance={false}
          />
          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 text-[oklch(0.55_0.04_220)] hover:text-[oklch(0.92_0.02_200)]"
            onClick={() => setMobileOpen(!mobileOpen)}
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
            className="md:hidden border-t border-[oklch(0.78_0.22_195/0.15)] bg-[oklch(0.07_0.015_260/0.95)]"
          >
            <div className="container py-4 flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`text-sm font-medium py-2 transition-colors ${
                    location === link.href
                      ? "text-[oklch(0.78_0.22_195)]"
                      : "text-[oklch(0.55_0.04_220)]"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
