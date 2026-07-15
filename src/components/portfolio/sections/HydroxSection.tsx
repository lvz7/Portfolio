import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Car, Shield, Users } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { SiRoblox } from "react-icons/si";
import hydroxBanner from "@/assets/hydrox-banner.png";
import hydroxLogo from "@/assets/hydrox-logo.png";
import { useRobloxPlayers } from "@/hooks/useRobloxPlayers";

const HYDROX_UNIVERSE_ID = "4336634424";
const ROBLOX_URL = "https://www.roblox.com/games/12315904188/Hydrox-Sandbox-UK-V3";

const bullets = [
  { icon: Shield, title: "Admin", desc: "I moderate and help keep things running smooth in the sandbox." },
  { icon: Car, title: "Car nerd stuff", desc: "It's a driving sandbox — customise, cruise, mess around." },
  { icon: Users, title: "Growing community", desc: "Active player base with regular updates." },
] as const;

export default function HydroxSection() {
  const reduceMotion = useReducedMotion();
  const counts = useRobloxPlayers(HYDROX_UNIVERSE_ID);

  return (
    <section id="hydrox" className="border-t border-border">
      <div className="container py-16 md:py-20">
        {/* Play callout — first thing users see */}
        <motion.a
          href={ROBLOX_URL}
          target="_blank"
          rel="noopener noreferrer"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="group mb-8 flex items-center justify-between gap-4 rounded-3xl border border-white/40 bg-card/70 p-5 shadow-[var(--shadow-glow)] backdrop-blur-md transition-transform hover:scale-[1.01] md:p-6"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white shadow-[0_18px_60px_-18px_rgba(255,255,255,0.6)]">
              <SiRoblox className="h-7 w-7 text-slate-900" />
            </div>
            <div>
              <div className="font-display text-lg font-semibold md:text-xl">Play Hydrox Sandbox: UK V3 on Roblox</div>
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                Launch the sandbox experience.
                {counts && (
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {counts.playing} playing now
                  </span>
                )}
              </div>
            </div>
          </div>
          <Button
            variant="default"
            className="hidden bg-white text-slate-900 hover:brightness-110 sm:inline-flex before:bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.6),transparent_70%)]"
            asChild
          >
            <span>Play now</span>
          </Button>
        </motion.a>

        {/* Banner */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-10 overflow-hidden rounded-3xl border border-white/30 shadow-[0_18px_60px_-18px_rgba(255,255,255,0.35)]"
        >
          <img src={hydroxBanner} alt="Hydrox Sandbox Banner" className="w-full object-cover" />
        </motion.div>

        <div className="grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-start">
          <div>
            <div className="flex items-center gap-4">
              <img
                src={hydroxLogo}
                alt="Hydrox Logo"
                className="h-16 w-16 rounded-full border-2 border-white object-cover"
              />
              <div>
                <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">Hydrox Community</h2>
                {counts && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {counts.playing} playing now
                  </span>
                )}
              </div>
            </div>
            <p className="mt-3 text-muted-foreground">
              A driving/car sandbox on Roblox — I'm admin on <span className="text-foreground font-medium">Hydrox Sandbox: UK V3</span>. Cars, cruises, and a solid community.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {["Roblox", "Cars", "Sandbox", "Admin"].map((t) => (
                <Badge key={t} className="bg-white/10 text-foreground border border-white/30" variant="secondary">
                  {t}
                </Badge>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                asChild
                variant="default"
                className="bg-white text-slate-900 hover:brightness-110 before:bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.6),transparent_70%)]"
              >
                <a href={ROBLOX_URL} target="_blank" rel="noopener noreferrer">
                  <SiRoblox className="h-4 w-4" />
                  Play on Roblox
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
                className="rounded-3xl border border-white/20 bg-card/70 p-6 shadow-elevated backdrop-blur-md"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white">
                    <b.icon className="h-5 w-5 text-slate-900" />
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
