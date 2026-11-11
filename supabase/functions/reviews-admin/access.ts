export function classifyLogin(password: string, real: string, decoy: string) {
  if (real && password === real) return "real";
  if (decoy && password === decoy) return "decoy";
  return "failed";
}

export function hasRealAccess(session: { login_kind: string; expires_at: string } | null, now = Date.now()) {
  return session?.login_kind === "real" && Date.parse(session.expires_at) > now;
}