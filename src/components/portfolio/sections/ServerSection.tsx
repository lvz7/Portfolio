import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Code2, Users, Wrench } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const bullets = [
  { icon: Users, title: "Community-first", desc: "Rules, roles, onboarding — smooth experiences matter." },
  { icon: Wrench, title: "Systems & tuning", desc: "Iteration, balancing, and quality-of-life improvements." },
  { icon: Code2, title: "Development", desc: "I love building and improving server features." },
] as const;

export default function ServerSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="greenville" className="border-t border-border">
      <div className="container py-16 md:py-20">
        <div className="grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-start">
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">Greenville Roleplay</h2>
            <p className="mt-2 text-muted-foreground">
              I run a Greenville roleplay server and I’m always building new systems and improving the experience.
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
                className="bg-hero text-primary-foreground shadow-glow hover:shadow-elevated hover:brightness-110"
              >
                <a href="#contact">Help me build</a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="bg-card/60 text-foreground shadow-elevated backdrop-blur-md border-border hover:bg-card/75"
              >
                <a href="#contact">Join / get link</a>
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
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-hero shadow-glow">
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
