import { useState, useMemo } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import design1 from "@/assets/gallery/design-1.png";
import design2 from "@/assets/gallery/design-2.gif";
import design3 from "@/assets/gallery/design-3.png";
import design4 from "@/assets/gallery/design-4.png";
import design5 from "@/assets/gallery/design-5.png";
import design6 from "@/assets/gallery/design-6.png";
import design7 from "@/assets/gallery/design-7.png";
import design8 from "@/assets/gallery/design-8.png";
import design9 from "@/assets/gallery/design-9.png";
import design10 from "@/assets/gallery/design-10.png";
import design11 from "@/assets/gallery/gallery-11.png";
import design12 from "@/assets/gallery/gallery-12.png";
import design13 from "@/assets/gallery/gallery-13.png";
import design14 from "@/assets/gallery/gallery-14.png";
import design15 from "@/assets/gallery/gallery-15.png";
import design16 from "@/assets/gallery/gallery-16.png";

type Category = "All" | "PFPs" | "Logos" | "Banners" | "Thumbnails" | "Animations";

const categories: Category[] = ["All", "PFPs", "Logos", "Banners", "Thumbnails", "Animations"];

const designs = [
  { src: design1, alt: "3000 Robux Design", category: "Thumbnails" },
  { src: design2, alt: "Winter LGVRP Animation", category: "Animations" },
  { src: design3, alt: "Special Request Design", category: "Banners" },
  { src: design4, alt: "Outagamie County Sheriff's Office", category: "Logos" },
  { src: design5, alt: "Roadmap Design", category: "Server Visuals" },
  { src: design6, alt: "GVTM Design", category: "Logos" },
  { src: design7, alt: "Greenville Trading Marketplace", category: "Banners" },
  { src: design8, alt: "LYRP Logo Design", category: "Logos" },
  { src: design9, alt: "LYRP Banner Design", category: "Banners" },
  { src: design10, alt: "Crossover LGVRP Design", category: "Banners" },
  { src: design11, alt: "LYRP Logo Alt", category: "Logos" },
  { src: design12, alt: "GVRP Session Release", category: "Thumbnails" },
  { src: design13, alt: "WGVRP Banner", category: "Banners" },
  { src: design14, alt: "Ruralville Session Concluded", category: "Thumbnails" },
  { src: design15, alt: "Porsche 63 Design", category: "PFPs" },
  { src: design16, alt: "BMW Race Banner", category: "Banners" },
] as const;

export default function GallerySection() {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState<Category>("All");

  const filtered = useMemo(
    () => (active === "All" ? designs : designs.filter((d) => d.category === active)),
    [active],
  );

  return (
    <section id="gallery" className="border-t border-border">
      <div className="container py-16 md:py-20">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Some of my work
          </h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Here's a few of my favorites. Swipe through or filter by type.
          </p>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
          className="mt-6"
        >
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                aria-pressed={active === cat}
                onClick={() => setActive(cat)}
                className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                  active === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-card/60 text-muted-foreground border border-border/70 hover:bg-card hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
          className="mt-8"
        >
          <Carousel
            key={active}
            opts={{
              align: "start",
              loop: filtered.length > 1,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4 items-stretch">
              <AnimatePresence mode="popLayout">
                {filtered.map((design, index) => (
                  <CarouselItem key={`${active}-${index}`} className="pl-4 basis-auto shrink-0">
                    <motion.div
                      layout={reduceMotion ? undefined : true}
                      initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={reduceMotion ? undefined : { opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.25 }}
                      className="w-fit overflow-hidden rounded-2xl border border-border/70 bg-card/40 shadow-elevated transition-transform duration-300 hover:scale-[1.02]"
                    >
                      <div className="flex h-64 items-center justify-center md:h-72">
                        <img
                          src={design.src}
                          alt={design.alt}
                          loading="lazy"
                          className="h-full w-auto shrink-0"
                        />
                      </div>
                    </motion.div>
                  </CarouselItem>
                ))}
              </AnimatePresence>
            </CarouselContent>
            {filtered.length > 0 && (
              <div className="mt-6 flex items-center justify-center gap-4">
                <CarouselPrevious className="static translate-y-0 bg-card/70 border-border hover:bg-card" />
                <CarouselNext className="static translate-y-0 bg-card/70 border-border hover:bg-card" />
              </div>
            )}
          </Carousel>

          {filtered.length === 0 && (
            <p className="mt-8 text-center text-sm text-muted-foreground">No designs in this category yet.</p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
