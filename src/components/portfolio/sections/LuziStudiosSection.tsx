import { Button } from "@/components/ui/button";
import { motion, useReducedMotion } from "framer-motion";
import { CreditCard, ExternalLink, ShoppingBag } from "lucide-react";

export default function LuziStudiosSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="studio" className="border-t border-border">
      <div className="container py-16 md:py-20">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">Luzi Studios</h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              A simple hub for commissions — purchase designs and join the Discord to stay updated.
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          <motion.article
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20% 0px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="group rounded-3xl border border-border/70 bg-card/70 p-6 shadow-elevated backdrop-blur-md"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-hero shadow-glow">
                <ShoppingBag className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="rounded-full border border-border/70 bg-background/40 px-3 py-1 text-xs text-muted-foreground">
                design purchase
              </span>
            </div>

            <h3 className="mt-5 font-display text-lg font-semibold">My Design Shop</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Add your storefront link here (Ko-fi, SellNow, Stripe link, etc.). People can buy PFPs, banners, and packs.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button
                asChild
                variant="default"
                className="bg-hero text-primary-foreground shadow-glow hover:shadow-elevated hover:brightness-110"
              >
                <a href="#contact">
                  Purchase / Request <CreditCard />
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="bg-card/60 text-foreground shadow-elevated backdrop-blur-md border-border hover:bg-card/75"
              >
                <a href="#services">
                  See what’s included <ExternalLink />
                </a>
              </Button>
            </div>
          </motion.article>

          <motion.article
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20% 0px" }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.06 }}
            className="group rounded-3xl border border-border/70 bg-card/70 p-6 shadow-elevated backdrop-blur-md"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-hero shadow-glow">
                <ExternalLink className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="rounded-full border border-border/70 bg-background/40 px-3 py-1 text-xs text-muted-foreground">
                discord server
              </span>
            </div>

            <h3 className="mt-5 font-display text-lg font-semibold">Join the Discord</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Get announcements, examples, and commission slots. Drop your invite link and I’ll wire it up.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button
                asChild
                variant="default"
                className="bg-hero text-primary-foreground shadow-glow hover:shadow-elevated hover:brightness-110"
              >
                <a href="#contact">Get invite</a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="bg-card/60 text-foreground shadow-elevated backdrop-blur-md border-border hover:bg-card/75"
              >
                <a href="#greenville">LGVRP</a>
              </Button>
            </div>
          </motion.article>
        </div>
      </div>
    </section>
  );
}
