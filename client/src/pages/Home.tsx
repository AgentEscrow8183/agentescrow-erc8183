/* ==========================================================
   Home — AgentEscrow ERC-8183
   Design: Glassmorphism Cosmic — dark space aesthetic with
   frosted glass panels, cosmic gradients, and orbital animations.
   ========================================================== */

import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import OverviewSection from "@/components/OverviewSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import StateMachineSection from "@/components/StateMachineSection";
import RolesSection from "@/components/RolesSection";
import ExtensionsSection from "@/components/ExtensionsSection";
import SpecificationSection from "@/components/SpecificationSection";
import Footer from "@/components/Footer";
import AIChatWidget from "@/components/AIChatWidget";

export default function Home() {
  return (
    <div className="min-h-screen cosmic-bg">
      <Navbar />
      <main>
        <HeroSection />
        <OverviewSection />
        <HowItWorksSection />
        <StateMachineSection />
        <RolesSection />
        <ExtensionsSection />
        <SpecificationSection />
      </main>
      <Footer />
      {/* Floating AI Chat Widget */}
      <AIChatWidget />
    </div>
  );
}
