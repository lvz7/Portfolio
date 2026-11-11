# Architecture
- Validate admin credentials server-side using project secrets and issue expiring hashed session tokens; never authorize dashboard actions from browser state or a shared key.
- Store admin login records in a service-role-only RLS table; decoy sessions must never authorize real data access.