import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brush, Image as ImageIcon, Layout, Palette } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const services = [
  {
    icon: Brush,
    title: "Profile Pictures",
    desc: "Clean icons, mascots, and stylized portraits that read well at small sizes.",
    tags: ["High contrast", "Readable", "Fast"],
  },
  {
    icon: Layout,
    title: "Banners & Headers",
    desc: "Social + server banners with depth, lighting, and a strong focal point.",
    tags: ["Layered", "Glow", "Brand"],
  },
  {
    icon: ImageIcon,
    title: "Thumbnails",
    desc: "Punchy layouts that stand out in a feed and match your vibe.",
    tags: ["Bold type", "Composition", "Clarity"],
  },
  {
    icon: Palette,
    title: "Server Visuals",
    desc: "UI style direction and assets for roleplay servers (icons, panels, splash screens).",
    tags: ["Systems", "Consistency", "Polish"],
  },
] as const;

export default function ServicesSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="services" className="border-t border-border">
      <div className="container py-16 md:py-20">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">Services</h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              I keep things clean, colorful, and readable — whether it’s a profile icon or a full banner kit.
            </p>
          </div>

          <Button
            asChild
            variant="outline"
            className="mt-4 bg-card/60 text-foreground shadow-elevated backdrop-blur-md border-border hover:bg-card/75 md:mt-0"
          >
            <a href="#contact">Ask for pricing</a>
          </Button>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {services.map((s, idx) => (
            <motion.article
              key={s.title}
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-20% 0px" }}
              transition={{ duration: 0.5, ease: "easeOut", delay: idx * 0.04 }}
              className="group rounded-3xl border border-border/70 bg-card/70 p-6 shadow-elevated backdrop-blur-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-hero shadow-glow transition-transform group-hover:-translate-y-0.5">
                  <s.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="rounded-full border border-border/70 bg-background/40 px-3 py-1 text-xs text-muted-foreground">
                  commissions
                </span>
              </div>

              <h3 className="mt-5 font-display text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {s.tags.map((t) => (
                  <Badge key={t} variant="secondary" className="bg-secondary/70">
                    {t}
                  </Badge>
                ))}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
