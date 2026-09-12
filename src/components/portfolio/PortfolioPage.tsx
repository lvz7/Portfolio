import SiteHeader from "@/components/portfolio/SiteHeader";
import HeroSection from "@/components/portfolio/sections/HeroSection";
import ServicesSection from "@/components/portfolio/sections/ServicesSection";
import GallerySection from "@/components/portfolio/sections/GallerySection";
import LuziStudiosSection from "@/components/portfolio/sections/LuziStudiosSection";
import ArchivedProjects from "@/components/portfolio/sections/ArchivedProjects";
import HydroxSection from "@/components/portfolio/sections/HydroxSection";
import BayviewSection from "@/components/portfolio/sections/BayviewSection";

import ReviewsSection from "@/components/portfolio/sections/ReviewsSection";
import ContactSection from "@/components/portfolio/sections/ContactSection";
import { Lock } from "lucide-react";
export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-card focus:px-3 focus:py-2 focus:text-foreground"
      >
        Skip to content
      </a>

      <SiteHeader />
      <main id="main">
        <HeroSection />
        <ServicesSection />
        <GallerySection />
        <LuziStudiosSection />
        <HydroxSection />
        <BayviewSection />
        
        <ArchivedProjects />
        <ReviewsSection />
        <ContactSection />
      </main>

      <footer className="border-t border-border">
        <div className="container py-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Luzi. Designs • Development • Communities
          </p>
          <a
            href="https://luzi-creative-hub.lovable.app/admin"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors"
            aria-label="Admin panel"
          >
            <Lock className="h-3 w-3" />
            Admin
          </a>
        </div>
      </footer>
    </div>
  );
}

