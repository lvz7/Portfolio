CREATE TABLE public.admin_login_sessions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 ip_address text NOT NULL,
 login_kind text NOT NULL CHECK (login_kind IN ('real', 'decoy', 'failed')),
 token_hash text UNIQUE,
 created_at timestamptz NOT NULL DEFAULT now(),
 expires_at timestamptz NOT NULL DEFAULT now() + interval '2 hours'
);
GRANT ALL ON public.admin_login_sessions TO service_role;
REVOKE ALL ON public.admin_login_sessions FROM anon, authenticated;
ALTER TABLE public.admin_login_sessions ENABLE ROW LEVEL SECURITY;
CREATE INDEX admin_login_sessions_ip_created ON public.admin_login_sessions (ip_address, created_at DESC);