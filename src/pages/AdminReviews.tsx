import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useMemo, useState } from "react";
import { Lock, Check, X, Mail, MailOpen } from "lucide-react";

type PendingReview = {
  id: string;
  name: string;
  rating: number;
  design: string | null;
  body: string;
  created_at: string;
};

type ContactSubmission = {
  id: string;
  name: string;
  contact: string;
  details: string;
  created_at: string;
  read: boolean;
};

const fnUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/reviews-admin`;
const ADMIN_PASSWORD = "Luziishere";

async function postAdmin<T>(adminKey: string, body: unknown) {
  const res = await fetch(fnUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-admin-key": adminKey,
    },
    body: JSON.stringify(body),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.error ?? `Request failed (${res.status})`);
  }
  return json as T;
}

export default function AdminReviews() {
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminKey, setAdminKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState<PendingReview[]>([]);
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);

  const canUse = useMemo(() => adminKey.trim().length > 0, [adminKey]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      toast({ title: "Welcome!", description: "Access granted." });
    } else {
      toast({ title: "Invalid password", description: "Please try again.", variant: "destructive" });
    }
  };

  const loadPending = async () => {
    if (!canUse) return;
    setLoading(true);
    try {
      const data = await postAdmin<{ pending: PendingReview[] }>(adminKey.trim(), { action: "list_pending" });
      setReviews(data.pending ?? []);
    } catch (e: any) {
      toast({ title: "Admin error", description: e?.message ?? String(e), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const loadContacts = async () => {
    if (!canUse) return;
    setLoading(true);
    try {
      const data = await postAdmin<{ contacts: ContactSubmission[] }>(adminKey.trim(), { action: "list_contacts" });
      setContacts(data.contacts ?? []);
    } catch (e: any) {
      toast({ title: "Admin error", description: e?.message ?? String(e), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const approve = async (id: string) => {
    if (!canUse) return;
    setLoading(true);
    try {
      await postAdmin(adminKey.trim(), { action: "approve", id });
      setReviews((prev) => prev.filter((r) => r.id !== id));
      toast({ title: "Approved", description: "Review is now public." });
    } catch (e: any) {
      toast({ title: "Admin error", description: e?.message ?? String(e), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const reject = async (id: string) => {
    if (!canUse) return;
    setLoading(true);
    try {
      await postAdmin(adminKey.trim(), { action: "reject", id });
      setReviews((prev) => prev.filter((r) => r.id !== id));
      toast({ title: "Rejected", description: "Review has been deleted." });
    } catch (e: any) {
      toast({ title: "Admin error", description: e?.message ?? String(e), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id: string) => {
    if (!canUse) return;
    try {
      await postAdmin(adminKey.trim(), { action: "mark_read", id });
      setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, read: true } : c)));
    } catch (e: any) {
      toast({ title: "Admin error", description: e?.message ?? String(e), variant: "destructive" });
    }
  };

  // Password gate
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="container max-w-md">
          <form onSubmit={handleLogin} className="rounded-3xl border border-border/70 bg-card/70 p-8 shadow-elevated backdrop-blur-md">
            <div className="flex justify-center mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-hero shadow-glow">
                <Lock className="h-7 w-7 text-primary-foreground" />
              </div>
            </div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-center">Admin Access</h1>
            <p className="mt-2 text-sm text-muted-foreground text-center">
              Enter the password to access the admin panel.
            </p>
            <div className="mt-6 space-y-4">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="bg-background/40"
                autoFocus
              />
              <Button
                type="submit"
                className="w-full bg-hero text-primary-foreground shadow-glow hover:shadow-elevated hover:brightness-110"
              >
                Unlock
              </Button>
            </div>
            <div className="mt-6 text-center">
              <Button
                asChild
                variant="link"
                className="text-muted-foreground hover:text-foreground"
              >
                <a href="/">← Back to site</a>
              </Button>
            </div>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container py-12">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">Admin Dashboard</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Manage reviews and view contact form submissions.
            </p>
          </div>

          <Button
            asChild
            variant="outline"
            className="mt-4 bg-card/60 text-foreground shadow-elevated backdrop-blur-md border-border hover:bg-card/75 md:mt-0"
          >
            <a href="/">Back to site</a>
          </Button>
        </div>

        <div className="mt-8 rounded-3xl border border-border/70 bg-card/70 p-6 shadow-elevated backdrop-blur-md">
          <label className="text-sm text-muted-foreground" htmlFor="admin-key">
            Admin key
          </label>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <Input
              id="admin-key"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              placeholder="Enter your admin key"
              className="bg-background/40"
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">This key is not stored in the browser.</p>
        </div>

        <Tabs defaultValue="reviews" className="mt-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="contacts">Contact Forms</TabsTrigger>
          </TabsList>

          <TabsContent value="reviews" className="mt-4">
            <div className="rounded-3xl border border-border/70 bg-card/70 p-6 shadow-elevated backdrop-blur-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-semibold">Pending Reviews ({reviews.length})</h2>
                <Button
                  type="button"
                  onClick={loadPending}
                  disabled={!canUse || loading}
                  size="sm"
                  className="bg-hero text-primary-foreground shadow-glow hover:shadow-elevated hover:brightness-110"
                >
                  Load pending
                </Button>
              </div>

              <div className="grid gap-4">
                {loading ? (
                  <p className="text-sm text-muted-foreground">Loading…</p>
                ) : reviews.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No pending reviews. Click "Load pending" to refresh.</p>
                ) : (
                  reviews.map((r) => (
                    <article key={r.id} className="rounded-2xl border border-border/60 bg-background/40 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="font-medium">{r.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {r.design ? `${r.design} • ` : ""}{r.rating}/5 • {new Date(r.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            onClick={() => approve(r.id)}
                            disabled={loading}
                            size="sm"
                            className="bg-green-600 text-white hover:bg-green-700"
                          >
                            <Check className="h-4 w-4 mr-1" /> Approve
                          </Button>
                          <Button
                            type="button"
                            onClick={() => reject(r.id)}
                            disabled={loading}
                            size="sm"
                            variant="destructive"
                          >
                            <X className="h-4 w-4 mr-1" /> Reject
                          </Button>
                        </div>
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">{r.body}</p>
                    </article>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="contacts" className="mt-4">
            <div className="rounded-3xl border border-border/70 bg-card/70 p-6 shadow-elevated backdrop-blur-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-semibold">
                  Contact Submissions ({contacts.filter((c) => !c.read).length} unread)
                </h2>
                <Button
                  type="button"
                  onClick={loadContacts}
                  disabled={!canUse || loading}
                  size="sm"
                  className="bg-hero text-primary-foreground shadow-glow hover:shadow-elevated hover:brightness-110"
                >
                  Load contacts
                </Button>
              </div>

              <div className="grid gap-4">
                {loading ? (
                  <p className="text-sm text-muted-foreground">Loading…</p>
                ) : contacts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No contact submissions. Click "Load contacts" to refresh.</p>
                ) : (
                  contacts.map((c) => (
                    <article
                      key={c.id}
                      className={`rounded-2xl border p-4 ${
                        c.read
                          ? "border-border/40 bg-background/20"
                          : "border-border/60 bg-background/40"
                      }`}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-3">
                          {c.read ? (
                            <MailOpen className="h-5 w-5 text-muted-foreground mt-0.5" />
                          ) : (
                            <Mail className="h-5 w-5 text-primary mt-0.5" />
                          )}
                          <div>
                            <div className="font-medium">{c.name}</div>
                            <div className="text-sm text-primary">{c.contact}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(c.created_at).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        {!c.read && (
                          <Button
                            type="button"
                            onClick={() => markRead(c.id)}
                            size="sm"
                            variant="outline"
                            className="bg-card/60"
                          >
                            Mark read
                          </Button>
                        )}
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground whitespace-pre-wrap">{c.details}</p>
                    </article>
                  ))
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
