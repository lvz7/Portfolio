import { describe, expect, it } from "vitest";
import { classifyLogin, hasRealAccess } from "../../supabase/functions/reviews-admin/access";

describe("admin access", () => {
  it("only the configured secret opens the real admin", () => {
    expect(classifyLogin("secret-fixture", "secret-fixture", "old-fixture")).toBe("real");
    expect(classifyLogin("wrong", "secret-fixture", "old-fixture")).toBe("failed");
    expect(classifyLogin("", "", "old-fixture")).toBe("failed");
  });
  it("the old password opens only the decoy", () => {
    expect(classifyLogin("old-fixture", "secret-fixture", "old-fixture")).toBe("decoy");
    expect(hasRealAccess({ login_kind: "decoy", expires_at: "2026-11-12T00:00:00Z" }, Date.parse("2026-11-11T17:46:00Z"))).toBe(false);
  });
  it("expired or missing sessions cannot access login IPs or admin data", () => {
    const now = Date.parse("2026-11-11T17:46:00Z");
    expect(hasRealAccess(null, now)).toBe(false);
    expect(hasRealAccess({ login_kind: "real", expires_at: "2026-11-11T17:45:00Z" }, now)).toBe(false);
    expect(hasRealAccess({ login_kind: "real", expires_at: "2026-11-11T19:46:00Z" }, now)).toBe(true);
  });
});