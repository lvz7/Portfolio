import { motion, useReducedMotion } from "framer-motion";
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

const designs = [
  { src: design1, alt: "3000 Robux Design" },
  { src: design2, alt: "Winter LGVRP Animation" },
  { src: design3, alt: "Special Request Design" },
  { src: design4, alt: "Outagamie County Sheriff's Office" },
  { src: design5, alt: "Roadmap Design" },
  { src: design6, alt: "GVTM Design" },
  { src: design7, alt: "Greenville Trading Marketplace" },
  { src: design8, alt: "LYRP Logo Design" },
  { src: design9, alt: "LYRP Banner Design" },
  { src: design10, alt: "Crossover LGVRP Design" },
];

export default function GallerySection() {
  const reduceMotion = useReducedMotion();

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
            My Best Designs
          </h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            A showcase of my favorite work. Swipe to see more!
          </p>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
          className="mt-10"
        >
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4 items-stretch">
              {designs.map((design, index) => (
                <CarouselItem key={index} className="pl-4 basis-auto shrink-0">
                  <div className="w-fit overflow-hidden rounded-2xl border border-border/70 bg-card/40 shadow-elevated transition-transform duration-300 hover:scale-[1.02]">
                    <div className="flex h-64 items-center justify-center md:h-72">
                      <img
                        src={design.src}
                        alt={design.alt}
                        loading="lazy"
                        className="h-full w-auto shrink-0"
                      />
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="mt-6 flex items-center justify-center gap-4">
              <CarouselPrevious className="static translate-y-0 bg-card/70 border-border hover:bg-card" />
              <CarouselNext className="static translate-y-0 bg-card/70 border-border hover:bg-card" />
            </div>
          </Carousel>
        </motion.div>
      </div>
    </section>
  );
}
