import GlowField from "@/components/portfolio/components/GlowField";
import { Button } from "@/components/ui/button";
import { ArrowRight, Brush, Code2, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import luziPfp from "@/assets/luzi-pfp.png";
import lgvrpLogo from "@/assets/lgvrp-logo.png";
import lyrpLogo from "@/assets/lyrp-logo.png";
import koyosanLogo from "@/assets/koyosan-logo.png";

const chips = [
  { icon: Brush, label: "Profile pics" },
  { icon: Sparkles, label: "Banners" },
  { icon: Code2, label: "Server dev" },
] as const;

export default function HeroSection() {
  const reduceMotion = useReducedMotion();

  return (
    <GlowField className="glow-field">
      <div className="container relative py-16 md:py-24">
        <div className="grid items-center gap-10 md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="flex items-center gap-3"
            >
              <img
                src={luziPfp}
                alt="Luzi"
                className="h-12 w-12 rounded-full border-2 border-primary shadow-glow object-cover"
              />
              <p className="text-sm text-muted-foreground">
                Hi, I'm <span className="text-foreground font-medium">Luzi</span> — I make designs and build roleplay servers.
              </p>
            </motion.div>

            <motion.h1
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: "easeOut", delay: 0.05 }}
              className="mt-4 font-display text-4xl font-semibold tracking-tight md:text-6xl"
            >
              Clean visuals.
              <br />
              Fast turnarounds.
              <br />
              <span className="text-muted-foreground">Servers that feel alive.</span>
            </motion.h1>

            <motion.p
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
              className="mt-5 max-w-xl text-base text-muted-foreground md:text-lg"
            >
              I design profile pictures and banners, and I love developing and improving communities — especially my
              LGVRP and LYRP servers.
            </motion.p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button
                asChild
                variant="default"
                size="lg"
                className="bg-hero text-primary-foreground shadow-glow hover:shadow-elevated hover:brightness-110"
              >
                <a href="#contact">
                  Let's work <ArrowRight />
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="bg-card/60 text-foreground shadow-elevated backdrop-blur-md border-border hover:bg-card/75"
              >
                <a href="#services">See services</a>
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {chips.map((c) => (
                <span
                  key={c.label}
                  className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/60 px-3 py-1.5 text-sm text-muted-foreground shadow-elevated"
                >
                  <c.icon className="h-4 w-4" />
                  {c.label}
                </span>
              ))}
            </div>
          </div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.08 }}
            className="relative"
          >
            <div className="rounded-3xl border border-border/70 bg-card/70 p-6 shadow-elevated backdrop-blur-md">
                <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Currently building</div>
                  <div className="mt-1 font-display text-lg font-semibold">LGVRP, LYRP & Koyosan</div>
                </div>
                <div className="flex -space-x-3">
                  <img
                    src={lgvrpLogo}
                    alt="LGVRP"
                    className="h-12 w-12 rounded-full border-2 border-primary shadow-glow object-cover"
                  />
                  <img
                    src={lyrpLogo}
                    alt="LYRP"
                    className="h-12 w-12 rounded-full border-2 border-[hsl(var(--brand-lyrp))] shadow-[var(--shadow-glow-lyrp)] object-cover"
                  />
                  <img
                    src={koyosanLogo}
                    alt="Koyosan"
                    className="h-12 w-12 rounded-full border-2 border-[hsl(var(--brand-koyosan))] shadow-[var(--shadow-glow-koyosan)] object-cover bg-white"
                  />
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                {[
                  { k: "Design style", v: "Clean + flashy" },
                  { k: "Delivery", v: "Fast & friendly" },
                  { k: "Focus", v: "Community + systems" },
                ].map((row) => (
                  <div
                    key={row.k}
                    className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/40 px-4 py-3"
                  >
                    <span className="text-sm text-muted-foreground">{row.k}</span>
                    <span className="text-sm font-medium">{row.v}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-border/60 bg-background/40 p-4">
                <p className="text-sm text-muted-foreground">
                 Are you in the need of a new Banner, Profile Picture, etc.? Come have a look!
                </p>
              </div>
            </div>

            <div
              className="pointer-events-none absolute -right-6 -top-6 hidden h-24 w-24 rounded-3xl bg-hero opacity-70 blur-xl md:block"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -bottom-10 -left-8 hidden h-28 w-28 rounded-3xl bg-hero opacity-60 blur-xl md:block"
              aria-hidden
            />
          </motion.div>
        </div>
      </div>
    </GlowField>
  );
}
