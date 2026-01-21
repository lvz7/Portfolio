import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Send, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ContactSection() {
  const { toast } = useToast();

  return (
    <section id="contact" className="border-t border-border">
      <div className="container py-16 md:py-20">
        <div className="grid gap-10 md:grid-cols-[1fr_1fr] md:items-start">
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">Contact</h2>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Tell me what you need (style, colors, theme, deadline). I’ll reply with a quick plan.
            </p>

            <div className="mt-6 rounded-3xl border border-border/70 bg-card/70 p-6 shadow-elevated backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-hero shadow-glow">
                  <Sparkles className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <div className="font-display text-lg font-semibold">Quick start</div>
                  <div className="text-sm text-muted-foreground">Include these 3 things:</div>
                </div>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>• What you want (PFP / banner / server visual)</li>
                <li>• Your vibe (clean, neon, dark, pastel…)</li>
                <li>• Deadline + where it’s used</li>
              </ul>
            </div>
          </div>

          <form
            className="rounded-3xl border border-border/70 bg-card/70 p-6 shadow-elevated backdrop-blur-md"
            onSubmit={(e) => {
              e.preventDefault();
              toast({
                title: "Message drafted",
                description: "Hook this form to email/Discord later — for now it’s a styled template.",
              });
            }}
          >
            <div className="grid gap-4">
              <div className="grid gap-2">
                <label className="text-sm text-muted-foreground" htmlFor="name">
                  Name
                </label>
                <Input id="name" placeholder="Your name" className="bg-background/40" />
              </div>

              <div className="grid gap-2">
                <label className="text-sm text-muted-foreground" htmlFor="contact">
                  Discord / Email
                </label>
                <Input id="contact" placeholder="@yourdiscord or you@email.com" className="bg-background/40" />
              </div>

              <div className="grid gap-2">
                <label className="text-sm text-muted-foreground" htmlFor="details">
                  What do you want?
                </label>
                <Textarea
                  id="details"
                  placeholder="Example: A neon banner for my server — purple + teal, with my logo centered."
                  className="min-h-28 bg-background/40"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Button
                  type="submit"
                  variant="default"
                  className="flex-1 bg-hero text-primary-foreground shadow-glow hover:shadow-elevated hover:brightness-110 sm:flex-none"
                >
                  Send <Send />
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="flex-1 bg-card/60 text-foreground shadow-elevated backdrop-blur-md border-border hover:bg-card/75 sm:flex-none"
                >
                  <a href="#top">Back to top</a>
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                Tip: when you’re ready, we can connect this form to Lovable Cloud to send emails or store requests.
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
