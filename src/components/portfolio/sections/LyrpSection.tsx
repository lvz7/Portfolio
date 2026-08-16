import { Badge } from "@/components/ui/badge";
import { motion, useReducedMotion } from "framer-motion";
import lyrpBanner from "@/assets/lyrp-banner.png";
import lyrpLogo from "@/assets/lyrp-logo.png";

export default function LyrpSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="lyrp" className="border-t border-border">
      <div className="container py-10 md:py-14">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="rounded-3xl border border-border/70 bg-card/60 p-5 md:p-6 shadow-elevated backdrop-blur-md"
        >
          <div className="grid gap-5 md:grid-cols-[220px_1fr] md:items-center">
            <div className="overflow-hidden rounded-2xl border border-border/60 shadow-[var(--shadow-glow-lyrp)]">
              <img src={lyrpBanner} alt="Luzi's YSO Roleplay banner" className="w-full object-cover" />
            </div>

            <div>
              <div className="flex items-center gap-3">
                <img
                  src={lyrpLogo}
                  alt="Luzi's YSO Roleplay logo"
                  className="h-10 w-10 rounded-full border-2 border-[hsl(var(--brand-lyrp))] shadow-[var(--shadow-glow-lyrp)] object-cover"
                />
                <div>
                  <h2 className="font-display text-xl font-semibold tracking-tight md:text-2xl">
                    Luzi's YSO Roleplay
                  </h2>
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground/60">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                    600+ members · archived
                  </span>
                </div>
              </div>

              <p className="mt-3 text-sm text-muted-foreground">
                My Young Street Ontario roleplay server. It peaked at{" "}
                <span className="text-foreground">600 members</span> before I closed it down.
              </p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {["Roleplay", "Community", "Owner"].map((t) => (
                  <Badge key={t} className="bg-secondary/70 text-xs" variant="secondary">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
