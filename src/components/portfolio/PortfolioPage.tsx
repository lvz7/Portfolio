import SiteHeader from "@/components/portfolio/SiteHeader";
import HeroSection from "@/components/portfolio/sections/HeroSection";
import ServicesSection from "@/components/portfolio/sections/ServicesSection";
import ServerSection from "@/components/portfolio/sections/ServerSection";
import ContactSection from "@/components/portfolio/sections/ContactSection";

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
        <ServerSection />
        <ContactSection />
      </main>

      <footer className="border-t border-border">
        <div className="container py-8">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Luzi. Designs • Development • Communities
          </p>
        </div>
      </footer>
    </div>
  );
}
