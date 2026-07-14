import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Car, Shield, Users } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { SiRoblox } from "react-icons/si";
import hydroxBanner from "@/assets/hydrox-banner.png";
import hydroxLogo from "@/assets/hydrox-logo.png";
import { useRobloxPlayers } from "@/hooks/useRobloxPlayers";

// TODO: replace with the real Hydrox Sandbox: UK V3 Universe ID
const HYDROX_UNIVERSE_ID = "0";

const bullets = [
  { icon: Shield, title: "Admin", desc: "I moderate and help keep things running smooth in the sandbox." },
  { icon: Car, title: "Car nerd stuff", desc: "It's a driving sandbox — customise, cruise, mess around." },
  { icon: Users, title: "Growing community", desc: "Active player base with regular updates." },
] as const;

export default function HydroxSection() {
  const reduceMotion = useReducedMotion();
  const counts = useRobloxPlayers(HYDROX_UNIVERSE_ID);

  return (
    <section id="hydrox" className="border-t border-border bg-white text-slate-900">
      <div className="container py-16 md:py-20">
        {/* Banner */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-10 overflow-hidden rounded-3xl border border-slate-200 shadow-[0_18px_60px_-18px_rgba(15,23,42,0.2)]"
        >
          <img
            src={hydroxBanner}
            alt="Hydrox Sandbox Banner"
            className="w-full object-cover"
          />
        </motion.div>

        <div className="grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-start">
          <div>
            <div className="flex items-center gap-4">
              <img
                src={hydroxLogo}
                alt="Hydrox Logo"
                className="h-16 w-16 rounded-full border-2 border-slate-900 object-cover"
              />
              <div>
                <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl text-slate-900">Hydrox Community</h2>
                {counts && (
                  <span className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {counts.playing} playing now
                  </span>
                )}
              </div>
            </div>
            <p className="mt-3 text-slate-600">
              A driving/car sandbox on Roblox — I'm admin on <span className="text-slate-900 font-medium">Hydrox Sandbox: UK V3</span>. Cars, cruises, and a solid community.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {["Roblox", "Cars", "Sandbox", "Admin"].map((t) => (
                <Badge key={t} className="bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200" variant="secondary">
                  {t}
                </Badge>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                asChild
                variant="default"
                className="bg-slate-900 text-white hover:bg-slate-800"
              >
                <a href="https://www.roblox.com/games/?Keyword=Hydrox%20Sandbox" target="_blank" rel="noopener noreferrer">
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
                className="rounded-3xl border border-slate-200 bg-slate-50 p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-900">
                    <b.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-display text-lg font-semibold text-slate-900">{b.title}</div>
                    <p className="mt-1 text-sm text-slate-600">{b.desc}</p>
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
