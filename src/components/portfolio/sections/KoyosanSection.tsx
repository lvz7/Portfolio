import { useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Car, Gamepad2, Map, Play, Users } from "lucide-react";
import { FaDiscord, FaTiktok } from "react-icons/fa";
import { SiRoblox } from "react-icons/si";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import koyosanBanner from "@/assets/koyosan-banner.png";
import koyosanLogo from "@/assets/koyosan-logo.png";

const bullets = [
  { icon: Map, title: "Map Building", desc: "Crafting immersive Japanese environments and detailed cityscapes." },
  { icon: Car, title: "Driving Experience", desc: "Smooth driving mechanics in a beautiful Roblox world." },
  { icon: Users, title: "Roleplay Community", desc: "Building an engaging community for driving and roleplay enthusiasts." },
] as const;

export default function KoyosanSection() {
  const reduceMotion = useReducedMotion();
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlay = useCallback(() => {
    setPlaying(true);
    // Small delay so the video element mounts first
    setTimeout(() => {
      videoRef.current?.play();
    }, 50);
  }, []);

  const handleEnded = useCallback(() => {
    setPlaying(false);
  }, []);

  return (
    <section id="koyosan" className="border-t border-border">
      <div className="container py-16 md:py-20">
        {/* Banner / Trailer */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative mb-10 overflow-hidden rounded-3xl border border-[hsl(var(--brand-koyosan-muted))] shadow-[var(--shadow-glow-koyosan)]"
        >
          <AnimatePresence mode="wait">
            {!playing ? (
              <motion.div
                key="banner"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="relative cursor-pointer group"
                onClick={handlePlay}
              >
                <img
                  src={koyosanBanner}
                  alt="Koyosan, Japan Banner"
                  className="w-full object-contain"
                />
                <div className="absolute bottom-4 right-4 flex items-center gap-2 cursor-pointer group" onClick={handlePlay}>
                  <span className="text-sm font-medium text-white drop-shadow-md">Trailer</span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--brand-koyosan))] shadow-[var(--shadow-glow-koyosan)] group-hover:scale-110 transition-transform">
                    <Play className="h-4 w-4 text-white ml-0.5" fill="white" />
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="video"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <video
                  ref={videoRef}
                  src="/videos/koyosan-trailer.mov"
                  controls
                  playsInline
                  onEnded={handleEnded}
                  className="w-full"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-start">
          <div>
            <div className="flex items-center gap-4">
              <img
                src={koyosanLogo}
                alt="Koyosan Logo"
                className="h-16 w-16 rounded-full border-2 border-[hsl(var(--brand-koyosan))] shadow-[var(--shadow-glow-koyosan)] bg-white object-cover"
              />
              <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">Koyosan, Japan</h2>
            </div>
            <p className="mt-3 text-muted-foreground">
              A driving and roleplay game set in Japan — I'm a Map Builder & Co-Owner, crafting immersive experiences on Roblox.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {["Driving", "Roleplay", "Roblox", "Map Building"].map((t) => (
                <Badge 
                  key={t} 
                  className="bg-[hsl(var(--brand-koyosan-muted))] text-[hsl(var(--brand-koyosan))] border-[hsl(var(--brand-koyosan)/0.3)]" 
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
                className="bg-[hsl(var(--brand-koyosan))] text-white shadow-[var(--shadow-glow-koyosan)] hover:brightness-110 before:bg-[radial-gradient(ellipse_at_center,hsl(var(--brand-koyosan)/0.6),transparent_70%)]"
              >
                <a href="https://discord.gg/6ZQKPjTgaR" target="_blank" rel="noopener noreferrer">
                  <FaDiscord className="h-4 w-4" />
                  Join Discord
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="bg-card/60 text-foreground shadow-elevated backdrop-blur-md border-[hsl(var(--brand-koyosan)/0.4)] hover:bg-card/75 before:bg-[radial-gradient(ellipse_at_center,hsl(var(--brand-koyosan)/0.4),transparent_70%)]"
              >
                <a href="https://www.roblox.com/communities/34391984/Koya-Studios#!/about" target="_blank" rel="noopener noreferrer">
                  <SiRoblox className="h-4 w-4" />
                  Roblox Community
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="bg-card/60 text-foreground shadow-elevated backdrop-blur-md border-[hsl(var(--brand-koyosan)/0.4)] hover:bg-card/75 before:bg-[radial-gradient(ellipse_at_center,hsl(var(--brand-koyosan)/0.4),transparent_70%)]"
              >
                <a href="https://www.tiktok.com/@koyasanjapan" target="_blank" rel="noopener noreferrer">
                  <FaTiktok className="h-4 w-4" />
                  TikTok
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
                className="rounded-3xl border border-[hsl(var(--brand-koyosan-muted))] bg-card/70 p-6 shadow-elevated backdrop-blur-md"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[hsl(var(--brand-koyosan))] shadow-[var(--shadow-glow-koyosan)]">
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
