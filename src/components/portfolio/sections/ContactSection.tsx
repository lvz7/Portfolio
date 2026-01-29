import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Send, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function ContactSection() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [details, setDetails] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!name.trim() || !contact.trim() || !details.trim()) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    if (name.length > 100 || contact.length > 200 || details.length > 2000) {
      toast({
        title: "Input too long",
        description: "Please shorten your input.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("contact_submissions").insert({
        name: name.trim(),
        contact: contact.trim(),
        details: details.trim(),
      });

      if (error) throw error;

      toast({
        title: "Message sent!",
        description: "Thanks for reaching out — I'll get back to you soon.",
      });

      // Clear form
      setName("");
      setContact("");
      setDetails("");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message ?? "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="border-t border-border">
      <div className="container py-16 md:py-20">
        <div className="grid gap-10 md:grid-cols-[1fr_1fr] md:items-start">
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">Contact</h2>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Tell me what you need (style, colors, theme, deadline). I'll reply with a quick plan.
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
                <li>• Deadline + where it's used</li>
              </ul>
            </div>
          </div>

          <form
            className="rounded-3xl border border-border/70 bg-card/70 p-6 shadow-elevated backdrop-blur-md"
            onSubmit={handleSubmit}
          >
            <div className="grid gap-4">
              <div className="grid gap-2">
                <label className="text-sm text-muted-foreground" htmlFor="name">
                  Name
                </label>
                <Input
                  id="name"
                  placeholder="Your name"
                  className="bg-background/40"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={100}
                  required
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm text-muted-foreground" htmlFor="contact">
                  Discord / Email
                </label>
                <Input
                  id="contact"
                  placeholder="@yourdiscord or you@email.com"
                  className="bg-background/40"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  maxLength={200}
                  required
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm text-muted-foreground" htmlFor="details">
                  What do you want?
                </label>
                <Textarea
                  id="details"
                  placeholder="Example: A neon banner for my server — purple + teal, with my logo centered."
                  className="min-h-28 bg-background/40"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  maxLength={2000}
                  required
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Button
                  type="submit"
                  variant="default"
                  disabled={loading}
                  className="flex-1 bg-hero text-primary-foreground shadow-glow hover:shadow-elevated hover:brightness-110 sm:flex-none"
                >
                  {loading ? "Sending…" : "Send"} <Send />
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="flex-1 bg-card/60 text-foreground shadow-elevated backdrop-blur-md border-border hover:bg-card/75 sm:flex-none"
                >
                  <a href="#top">Back to top</a>
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
