import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const reviewSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(60, "Keep name under 60 chars"),
  rating: z
    .number({ required_error: "Rating is required" })
    .int("Rating must be a whole number")
    .min(1)
    .max(5),
  design: z.string().trim().max(80, "Keep design under 80 chars").optional().or(z.literal("")),
  body: z.string().trim().min(1, "Review is required").max(800, "Keep review under 800 chars"),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

type PublicReview = {
  id: string;
  name: string;
  rating: number;
  design: string | null;
  body: string;
  created_at: string;
};

function Stars({ value }: { value: number }) {
  const stars = Array.from({ length: 5 }, (_, i) => i + 1);
  return (
    <div className="flex items-center gap-1" aria-label={`${value} out of 5 stars`}>
      {stars.map((s) => (
        <span
          key={s}
          className={
            s <= value
              ? "text-primary"
              : "text-muted-foreground"
          }
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function ReviewsSection() {
  const { toast } = useToast();

  const defaultValues = useMemo<ReviewFormValues>(
    () => ({ name: "", rating: 5, design: "", body: "" }),
    [],
  );

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues,
    mode: "onSubmit",
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["reviews", "approved"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("id,name,rating,design,body,created_at")
        .order("created_at", { ascending: false })
        .limit(12);
      if (error) throw error;
      return (data ?? []) as PublicReview[];
    },
  });

  const onSubmit = async (values: ReviewFormValues) => {
    const parsed = reviewSchema.safeParse(values);
    if (!parsed.success) return;

    const payload = {
      name: parsed.data.name,
      rating: parsed.data.rating,
      design: parsed.data.design ? parsed.data.design : null,
      body: parsed.data.body,
    };

    const { error } = await supabase.from("reviews").insert(payload);
    if (error) {
      toast({
        title: "Couldn’t submit review",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    form.reset(defaultValues);
    toast({
      title: "Review submitted",
      description: "Thanks! It will appear once approved.",
    });
    void refetch();
  };

  return (
    <section id="reviews" className="border-t border-border">
      <div className="container py-16 md:py-20">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">Reviews</h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Leave a quick review for your design. Reviews show up after I approve them.
            </p>
          </div>

          <Button
            asChild
            variant="outline"
            className="mt-4 bg-card/60 text-foreground shadow-elevated backdrop-blur-md border-border hover:bg-card/75 md:mt-0"
          >
            <a href="/admin">Admin approve</a>
          </Button>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-[1fr_1fr]">
          <form
            className="rounded-3xl border border-border/70 bg-card/70 p-6 shadow-elevated backdrop-blur-md"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <div className="grid gap-4">
              <div className="grid gap-2">
                <label className="text-sm text-muted-foreground" htmlFor="review-name">
                  Name
                </label>
                <Input id="review-name" className="bg-background/40" {...form.register("name")} />
                {form.formState.errors.name?.message ? (
                  <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <label className="text-sm text-muted-foreground" htmlFor="review-design">
                  Design (optional)
                </label>
                <Input
                  id="review-design"
                  placeholder="PFP / banner / pack"
                  className="bg-background/40"
                  {...form.register("design")}
                />
                {form.formState.errors.design?.message ? (
                  <p className="text-xs text-destructive">{form.formState.errors.design.message}</p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <label className="text-sm text-muted-foreground" htmlFor="review-rating">
                  Rating (1–5)
                </label>
                <Input
                  id="review-rating"
                  type="number"
                  min={1}
                  max={5}
                  className="bg-background/40"
                  {...form.register("rating", { valueAsNumber: true })}
                />
                {form.formState.errors.rating?.message ? (
                  <p className="text-xs text-destructive">{form.formState.errors.rating.message}</p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <label className="text-sm text-muted-foreground" htmlFor="review-body">
                  Review
                </label>
                <Textarea
                  id="review-body"
                  className="min-h-28 bg-background/40"
                  placeholder="What did you like? Turnaround, style, communication…"
                  {...form.register("body")}
                />
                {form.formState.errors.body?.message ? (
                  <p className="text-xs text-destructive">{form.formState.errors.body.message}</p>
                ) : null}
              </div>

              <Button
                type="submit"
                variant="default"
                className="bg-hero text-primary-foreground shadow-glow hover:shadow-elevated hover:brightness-110"
              >
                Submit review
              </Button>
              <p className="text-xs text-muted-foreground">No verification yet — keep it honest.</p>
            </div>
          </form>

          <div className="rounded-3xl border border-border/70 bg-card/70 p-6 shadow-elevated backdrop-blur-md">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold">Approved reviews</h3>
              <span className="text-xs text-muted-foreground">latest</span>
            </div>

            <div className="mt-5 grid gap-4">
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : (data?.length ?? 0) === 0 ? (
                <p className="text-sm text-muted-foreground">No approved reviews yet.</p>
              ) : (
                data?.map((r) => (
                  <article
                    key={r.id}
                    className="rounded-2xl border border-border/60 bg-background/40 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium">{r.name}</div>
                        {r.design ? (
                          <div className="text-xs text-muted-foreground">{r.design}</div>
                        ) : null}
                      </div>
                      <Stars value={r.rating} />
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">{r.body}</p>
                  </article>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
