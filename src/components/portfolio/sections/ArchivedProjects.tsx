import { Badge } from "@/components/ui/badge";
import { motion, useReducedMotion } from "framer-motion";
import ruralvilleLogo from "@/assets/ruralville-logo.png";
import lyrpLogo from "@/assets/lyrp-logo.png";

const archives = [
  {
    id: "lgvrp",
    name: "Ruralville",
    stat: "400+ members",
    role: "Owner",
    desc: "Owned it while it was active. We hit 400+ members before winding it down.",
    logo: ruralvilleLogo,
    logoAlt: "Ruralville Logo",
    accent: "[hsl(var(--brand-ruralville))]",
    shadow: "var(--shadow-glow-ruralville)",
  },
  {
    id: "lyrp",
    name: "Luzi's YSO Roleplay",
    stat: "600+ members",
    role: "Owner",
    desc: "My Young Street Ontario roleplay server. Peaked at 600 members before I closed it.",
    logo: lyrpLogo,
    logoAlt: "Luzi's YSO Roleplay Logo",
    accent: "[hsl(var(--brand-lyrp))]",
    shadow: "var(--shadow-glow-lyrp)",
  },
] as const;

export default function ArchivedProjects() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="archive" className="border-t border-border">
      <div className="container py-10 md:py-14">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <h2 className="font-display text-xl font-semibold tracking-tight md:text-2xl">Past projects</h2>
          <p className="mt-1 text-sm text-muted-foreground">Servers I built and later moved on from.</p>
        </motion.div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {archives.map((a, idx) => (
            <motion.article
              key={a.id}
              id={a.id}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 0.45, ease: "easeOut", delay: idx * 0.05 }}
              className="rounded-3xl border border-border/70 bg-card/60 p-5 shadow-elevated backdrop-blur-md"
            >
              <div className="flex items-center gap-3">
                <img
                  src={a.logo}
                  alt={a.logoAlt}
                  className={`h-11 w-11 rounded-full border-2 border-${a.accent} shadow-[${a.shadow}] object-cover`}
                />
                <div>
                  <h3 className="font-display text-base font-semibold tracking-tight">{a.name}</h3>
                  <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                    {a.stat} · archived
                  </span>
                </div>
              </div>

              <p className="mt-3 text-sm text-muted-foreground">{a.desc}</p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {["Roleplay", "Community", a.role].map((t) => (
                  <Badge key={t} className="bg-secondary/70 text-xs" variant="secondary">
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
