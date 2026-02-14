import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Code2, Users, Wrench } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { FaDiscord } from "react-icons/fa";
import lyrpBanner from "@/assets/lyrp-banner.png";
import lyrpLogo from "@/assets/lyrp-logo.png";
import { useDiscordMemberCount } from "@/hooks/useDiscordMemberCount";

const bullets = [
  { icon: Users, title: "Community-first", desc: "Rules, roles, onboarding — smooth experiences matter." },
  { icon: Wrench, title: "Systems & tuning", desc: "Iteration, balancing, and quality-of-life improvements." },
  { icon: Code2, title: "Development", desc: "I love building and improving server features." },
] as const;

export default function LYRPSection() {
  const reduceMotion = useReducedMotion();
  const memberCount = useDiscordMemberCount("1464600314882560299");

  return (
    <section id="lyrp" className="border-t border-border">
      <div className="container py-16 md:py-20">
        {/* Banner */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-10 overflow-hidden rounded-3xl border border-[hsl(var(--brand-lyrp-muted))] shadow-[var(--shadow-glow-lyrp)]"
        >
          <img
            src={lyrpBanner}
            alt="LYRP Banner"
            className="w-full object-contain"
          />
        </motion.div>

        <div className="grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-start">
          <div>
            <div className="flex items-center gap-4">
              <img
                src={lyrpLogo}
                alt="LYRP Logo"
                className="h-16 w-16 rounded-full border-2 border-[hsl(var(--brand-lyrp))] shadow-[var(--shadow-glow-lyrp)]"
              />
              <div>
                <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">LYRP</h2>
                {memberCount && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground/50 mt-0.5">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {memberCount.online} online
                  </span>
                )}
              </div>
            </div>
            <p className="mt-3 text-muted-foreground">
              Luzi's Young Street Ontario Roleplay — a Roblox roleplay server I'm building with passion.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {["Roleplay", "Community", "Roblox"].map((t) => (
                <Badge 
                  key={t} 
                  className="bg-[hsl(var(--brand-lyrp-muted))] text-[hsl(var(--brand-lyrp))] border-[hsl(var(--brand-lyrp)/0.3)]" 
                  variant="secondary"
                >
                  {t}
                </Badge>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                asChild
                variant="default"
                className="bg-[hsl(var(--brand-lyrp))] text-white shadow-[var(--shadow-glow-lyrp)] hover:brightness-110"
              >
                <a href="https://discord.gg/J4hwPPwSbP" target="_blank" rel="noopener noreferrer">
                  <FaDiscord className="h-4 w-4" />
                  Join Discord
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="bg-card/60 text-foreground shadow-elevated backdrop-blur-md border-[hsl(var(--brand-lyrp)/0.4)] hover:bg-card/75"
              >
                <a href="#contact">Help me build</a>
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            {bullets.map((b, idx) => (
              <motion.div
                key={b.title}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20% 0px" }}
                transition={{ duration: 0.45, ease: "easeOut", delay: idx * 0.05 }}
                className="rounded-3xl border border-[hsl(var(--brand-lyrp-muted))] bg-card/70 p-6 shadow-elevated backdrop-blur-md"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[hsl(var(--brand-lyrp))] shadow-[var(--shadow-glow-lyrp)]">
                    <b.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-display text-lg font-semibold">{b.title}</div>
                    <p className="mt-1 text-sm text-muted-foreground">{b.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
