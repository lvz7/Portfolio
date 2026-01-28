import { Button } from "@/components/ui/button";
import { motion, useReducedMotion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { FaDiscord } from "react-icons/fa";
import luziStudiosLogo from "@/assets/luzi-studios-logo.png";
import luziStudiosBanner from "@/assets/luzi-studios-banner.png";

export default function LuziStudiosSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="studio" className="border-t border-border">
      <div className="container py-16 md:py-20">
        {/* Banner */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-10 overflow-hidden rounded-3xl border border-[hsl(var(--brand-studio-muted))] shadow-[var(--shadow-glow-studio)]"
        >
          <img
            src={luziStudiosBanner}
            alt="Luzi Studios Banner"
            className="w-full object-contain"
          />
        </motion.div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
          <img
            src={luziStudiosLogo}
            alt="Luzi Studios Logo"
            className="h-20 w-20 rounded-full border-2 border-[hsl(var(--brand-studio))] shadow-[var(--shadow-glow-studio)]"
          />
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">Luzi Studios</h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              A simple hub for commissions — purchase designs and join the Discord to stay updated.
            </p>
          </div>
        </div>

        <motion.article
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20% 0px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mt-10 group rounded-3xl border border-[hsl(var(--brand-studio-muted))] bg-card/70 p-6 shadow-elevated backdrop-blur-md"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[hsl(var(--brand-studio))] shadow-[var(--shadow-glow-studio)]">
              <ExternalLink className="h-5 w-5 text-white" />
            </div>
            <span className="rounded-full border border-[hsl(var(--brand-studio)/0.3)] bg-background/40 px-3 py-1 text-xs text-muted-foreground">
              discord server
            </span>
          </div>

          <h3 className="mt-5 font-display text-lg font-semibold">Join the Discord</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Get announcements, examples, and commission slots. Connect with the community!
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button
              asChild
              variant="default"
              className="bg-[hsl(var(--brand-studio))] text-white shadow-[var(--shadow-glow-studio)] hover:brightness-110"
            >
              <a href="https://discord.gg/Z9ABvJRYW7" target="_blank" rel="noopener noreferrer">
                <FaDiscord className="h-4 w-4" />
                Join Luzi Studios Discord
              </a>
            </Button>
          </div>
        </motion.article>
      </div>
    </section>
  );
}
