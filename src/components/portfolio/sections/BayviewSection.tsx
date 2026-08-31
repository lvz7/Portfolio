import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Car, Map, Shield, Users } from "lucide-react";
import { SiRoblox } from "react-icons/si";
import { motion, useReducedMotion } from "framer-motion";
import bayviewBanner from "@/assets/bayview-banner.png";
import bayviewLogo from "@/assets/bayview-logo.png";

const ROBLOX_URL = "https://www.roblox.com/games/99709766196624/Bayview-County";

const bullets = [
  { icon: Shield, title: "Moderator", desc: "I help moderate the server and keep things running smooth." },
  { icon: Map, title: "Open-world map", desc: "A big, detailed map inspired by Greenville with its own original locations." },
  { icon: Car, title: "Customizable vehicles", desc: "Loads of cars to drive and make your own." },
  { icon: Users, title: "Interactive jobs & RP", desc: "Jobs, systems, and roleplay experiences built into the world." },
] as const;

export default function BayviewSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="bayview" className="border-t border-border">
      <div className="container py-16 md:py-20">
        {/* Header + play callout */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        >
          <div className="flex items-center gap-4">
            <img
              src={bayviewLogo}
              alt="Bayview County Logo"
              className="h-16 w-16 rounded-full border-2 border-[hsl(var(--brand-bayview))] object-cover shadow-[0_18px_60px_-18px_hsl(var(--brand-bayview)/0.6)]"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">Bayview County, USA</h2>
                <Badge
                  className="bg-[hsl(var(--brand-bayview-muted))] text-[hsl(var(--brand-bayview))] border border-[hsl(var(--brand-bayview)/0.3)]"
                  variant="secondary"
                >
                  Moderator
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">Realistic Roblox driving & roleplay.</p>
            </div>
          </div>

          <Button
            asChild
            variant="default"
            className="w-full bg-[hsl(var(--brand-bayview))] text-white hover:brightness-110 md:w-auto before:bg-[radial-gradient(ellipse_at_center,hsl(var(--brand-bayview)/0.6),transparent_70%)]"
          >
            <a href={ROBLOX_URL} target="_blank" rel="noopener noreferrer">
              <SiRoblox className="h-4 w-4" />
              Play on Roblox
            </a>
          </Button>
        </motion.div>

        {/* Banner: full width, map-focus feel */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-10 overflow-hidden rounded-3xl border border-[hsl(var(--brand-bayview)/0.35)] shadow-[0_18px_60px_-18px_hsl(var(--brand-bayview)/0.5)]"
        >
          <img src={bayviewBanner} alt="Bayview County Banner" className="w-full object-cover" />
        </motion.div>

        <div className="grid gap-10 md:grid-cols-[1fr_1fr] md:items-start">
          <div>
            <p className="text-muted-foreground">
              Bayview County is a realistic Roblox driving and roleplay game inspired by Greenville. It features a large open-world map, interactive jobs, customizable vehicles, and immersive roleplay experiences. While inspired by Greenville, Bayview County has grown into its own unique experience with original locations, gameplay systems, and identity.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {["Roblox", "Driving", "Roleplay", "Moderator"].map((t) => (
                <Badge
                  key={t}
                  className="bg-[hsl(var(--brand-bayview-muted))] text-[hsl(var(--brand-bayview))] border border-[hsl(var(--brand-bayview)/0.3)]"
                  variant="secondary"
                >
                  {t}
                </Badge>
              ))}
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
                className="rounded-3xl border border-[hsl(var(--brand-bayview)/0.3)] bg-card/70 p-6 shadow-elevated backdrop-blur-md"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[hsl(var(--brand-bayview))]">
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
