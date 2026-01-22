import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const links = [
  { label: "Services", href: "#services" },
  { label: "Luzi Studios", href: "#studio" },
  { label: "LGVRP", href: "#greenville" },
  { label: "Reviews", href: "#reviews" },
  { label: "Contact", href: "#contact" },
] as const;

function useActiveAnchor(ids: string[]) {
  const [active, setActive] = useState<string>(ids[0] ?? "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0));
        if (visible[0]?.target?.id) setActive(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: [0.1, 0.2, 0.4, 0.6] },
    );

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [ids]);

  return active;
}

export default function SiteHeader() {
  const ids = useMemo(() => ["services", "studio", "greenville", "reviews", "contact"], []);
  const active = useActiveAnchor(ids);
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/70 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <a href="#top" className="flex items-center gap-3">
          <div className="relative h-9 w-9 overflow-hidden rounded-xl bg-hero shadow-glow" aria-hidden>
            <div className="absolute inset-0 opacity-70" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-sm font-semibold tracking-wide">Luzi</div>
              <div className="text-xs text-muted-foreground">Designs • LGVRP • Server Dev</div>
          </div>
        </a>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-full px-3 py-2 text-sm transition-colors hover:bg-secondary",
                active === l.href.slice(1) ? "bg-secondary text-foreground" : "text-muted-foreground",
              )}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="default"
            size="sm"
            className="hidden bg-hero text-primary-foreground shadow-glow hover:shadow-elevated hover:brightness-110 sm:inline-flex"
          >
            <a href="#contact">Commission me</a>
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="bg-card/60 text-foreground shadow-elevated backdrop-blur-md border-border hover:bg-card/75 md:hidden"
            aria-label="Open menu"
            onClick={() => setOpen((v) => !v)}
          >
            <Menu />
          </Button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border/70 bg-background/70 md:hidden">
          <div className="container py-2">
            <div className="grid gap-1">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  {l.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
