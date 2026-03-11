import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Code2, Users, Wrench } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { FaDiscord } from "react-icons/fa";
import { SiTiktok, SiYoutube } from "react-icons/si";
import ruralvilleBanner from "@/assets/ruralville-banner.png";
import ruralvilleLogo from "@/assets/ruralville-logo.png";
import { useDiscordMemberCount } from "@/hooks/useDiscordMemberCount";

const bullets = [
  { icon: Users, title: "Community-first", desc: "Rules, roles, onboarding — smooth experiences matter." },
  { icon: Wrench, title: "Systems & tuning", desc: "Iteration, balancing, and quality-of-life improvements." },
  { icon: Code2, title: "Development", desc: "I love building and improving server features." },
] as const;

export default function ServerSection() {
  const reduceMotion = useReducedMotion();
  const memberCount = useDiscordMemberCount("1325044969743974521");

  return (
    <section id="lgvrp" className="border-t border-border">
      <div className="container py-16 md:py-20">
        {/* Banner */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-10 overflow-hidden rounded-3xl border border-border/70 shadow-[var(--shadow-glow-ruralville)]"
        >
          <img
            src={ruralvilleBanner}
            alt="Ruralville Banner"
            className="w-full object-contain"
          />
        </motion.div>

        <div className="grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-start">
          <div>
            <div className="flex items-center gap-4">
              <img
                src={ruralvilleLogo}
                alt="Ruralville Logo"
                className="h-16 w-16 rounded-full border-2 border-[hsl(var(--brand-ruralville))] shadow-[var(--shadow-glow-ruralville)]"
              />
              <div>
                <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">Ruralville</h2>
                {memberCount && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground/50 mt-0.5">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {memberCount.online} online
                  </span>
                )}
              </div>
            </div>
            <p className="mt-3 text-muted-foreground">
              I run Ruralville and I'm always building new systems and improving the experience.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {["Roleplay", "Community", "Development"].map((t) => (
                <Badge key={t} className="bg-secondary/70" variant="secondary">
                  {t}
                </Badge>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                asChild
                variant="default"
                className="bg-[hsl(var(--brand-ruralville))] text-primary-foreground shadow-[var(--shadow-glow-ruralville)] hover:shadow-elevated hover:brightness-110"
              >
                <a href="https://discord.gg/rural" target="_blank" rel="noopener noreferrer">
                  <FaDiscord className="h-4 w-4" />
                  Join Discord
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="bg-card/60 text-foreground shadow-elevated backdrop-blur-md border-border hover:bg-card/75"
              >
                <a href="https://www.tiktok.com/@ruralville" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  <SiTiktok className="h-4 w-4" />
                  TikTok
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="bg-card/60 text-foreground shadow-elevated backdrop-blur-md border-border hover:bg-card/75"
              >
                <a href="https://www.youtube.com/@luzisgvrp" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  <SiYoutube className="h-4 w-4" />
                  YouTube
                </a>
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
                className="rounded-3xl border border-border/70 bg-card/70 p-6 shadow-elevated backdrop-blur-md"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[hsl(var(--brand-ruralville))] shadow-[var(--shadow-glow-ruralville)]">
                    <b.icon className="h-5 w-5 text-primary-foreground" />
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
