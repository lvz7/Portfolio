import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ChevronDown, Menu } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import luziPfp from "@/assets/luzi-pfp.png";

const navGroups = [
  {
    label: "Work",
    items: [
      { label: "Services", href: "#services" },
      { label: "Gallery", href: "#gallery" },
      { label: "Reviews", href: "#reviews" },
    ],
  },
  {
    label: "Projects",
    items: [
      { label: "Hydrox Community", href: "#hydrox" },
      { label: "Bayview County", href: "#bayview" },
      { label: "Koyosan", href: "#koyosan" },
    ],
  },
  {
    label: "Archive",
    items: [
      { label: "Ruralville", href: "#lgvrp" },
      { label: "LYRP", href: "#lyrp" },
    ],
  },
  {
    label: "Studio",
    items: [{ label: "Luzi Studios", href: "#studio" }],
  },
] as const;

const allLinks = navGroups.flatMap((g) => g.items);

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

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className={cn(
        "rounded-full px-3 py-2 text-sm transition-colors hover:bg-secondary",
        active ? "bg-secondary text-foreground" : "text-muted-foreground",
      )}
    >
      {children}
    </a>
  );
}

export default function SiteHeader() {
  const ids = useMemo(() => allLinks.map((l) => l.href.slice(1)), []);
  const active = useActiveAnchor(ids);
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/70 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <a href="#top" className="flex items-center gap-3">
          <img
            src={luziPfp}
            alt="Luzi"
            className="h-9 w-9 rounded-full border-2 border-primary shadow-glow object-cover"
          />
          <div className="leading-tight">
            <div className="font-display text-sm font-semibold tracking-wide">Luzi</div>
            <div className="text-xs text-muted-foreground">Designs • Hydrox • Bayview</div>
          </div>
        </a>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {/* Work */}
          <NavLink href="#services" active={active === "services"}>
            Services
          </NavLink>
          <NavLink href="#gallery" active={active === "gallery"}>
            Gallery
          </NavLink>
          <NavLink href="#reviews" active={active === "reviews"}>
            Reviews
          </NavLink>

          <span className="mx-1 h-4 w-px bg-border" aria-hidden="true" />

          {/* Projects */}
          <NavLink href="#hydrox" active={active === "hydrox"}>
            Hydrox
          </NavLink>
          <NavLink href="#bayview" active={active === "bayview"}>
            Bayview
          </NavLink>
          <NavLink href="#koyosan" active={active === "koyosan"}>
            Koyosan
          </NavLink>

          <span className="mx-1 h-4 w-px bg-border" aria-hidden="true" />

          {/* Archive dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "group inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm transition-colors hover:bg-secondary",
                  active === "lgvrp" || active === "lyrp" ? "bg-secondary text-foreground" : "text-muted-foreground",
                )}
              >
                Archive
                <ChevronDown className="h-3.5 w-3.5 transition-transform group-data-[state=open]:rotate-180" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl border-border/70 bg-card/95 backdrop-blur-md">
              <DropdownMenuItem asChild>
                <a href="#lgvrp" className="cursor-pointer text-sm">
                  Ruralville
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="#lyrp" className="cursor-pointer text-sm">
                  Luzi's YSO Roleplay
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <span className="mx-1 h-4 w-px bg-border" aria-hidden="true" />

          {/* Studio */}
          <NavLink href="#studio" active={active === "studio"}>
            Luzi Studios
          </NavLink>
        </nav>

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

      {open && (
        <div className="border-t border-border/70 bg-background/70 md:hidden">
          <div className="container py-3">
            <div className="grid gap-4">
              {navGroups.map((group) => (
                <div key={group.label}>
                  <div className="px-3 pb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
                    {group.label}
                  </div>
                  <div className="grid gap-0.5">
                    {group.items.map((l) => (
                      <a
                        key={l.href}
                        href={l.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "rounded-xl px-3 py-2 text-sm transition-colors",
                          active === l.href.slice(1)
                            ? "bg-secondary text-foreground"
                            : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                        )}
                      >
                        {l.label}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
