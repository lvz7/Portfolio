import { Badge } from "@/components/ui/badge";
import bayviewLogo from "@/assets/bayview-logo.png";
import venturaLogo from "@/assets/ventura-logo.png";

const testing = [
  {
    id: "bayview-testing",
    name: "Bayview County",
    location: "Roblox",
    desc: "Bug tester for Bayview County.",
    logo: bayviewLogo,
    logoAlt: "Bayview County Logo",
    ringClass: "border-[hsl(var(--brand-bayview))]",
    badgeClass:
      "bg-[hsl(var(--brand-bayview-muted))] text-[hsl(var(--brand-bayview))] border-[hsl(var(--brand-bayview)/0.3)]",
  },
  {
    id: "ventura-testing",
    name: "Ventura",
    location: "Ventura, California",
    desc: "Bug tester for Ventura.",
    logo: venturaLogo,
    logoAlt: "Ventura Logo",
    ringClass: "border-[hsl(var(--brand-ventura))]",
    badgeClass:
      "bg-[hsl(var(--brand-ventura-muted))] text-[hsl(var(--brand-ventura))] border-[hsl(var(--brand-ventura)/0.3)]",
  },
] as const;

export default function BugTestingSection() {
  return (
    <section id="bug-testing" className="border-t border-border">
      <div className="container py-16 md:py-20">
        <div className="mb-8">
          <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">Bug Testing</h2>
          <p className="mt-2 text-sm text-muted-foreground">Projects I test for bugs.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {testing.map((t) => (
            <div
              key={t.id}
              id={t.id}
              className="flex items-center gap-4 rounded-3xl border border-border bg-card/70 p-5 shadow-elevated"
            >
              <img
                src={t.logo}
                alt={t.logoAlt}
                className={`h-14 w-14 shrink-0 rounded-full border-2 object-cover ${t.ringClass}`}
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-lg font-semibold">{t.name}</h3>
                  <Badge variant="secondary" className={`border ${t.badgeClass}`}>
                    Bug Tester
                  </Badge>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{t.location}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
