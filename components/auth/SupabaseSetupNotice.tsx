/** Shown when .env.local has no Supabase keys yet, instead of a broken form. */
export function SupabaseSetupNotice() {
  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm leading-6 text-amber-100">
      <p className="font-medium">Supabase is not configured yet.</p>
      <p className="mt-1 text-amber-100/80">
        Add <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
        <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to{" "}
        <code className="font-mono text-xs">.env.local</code>, then restart the dev
        server. See <code className="font-mono text-xs">.env.example</code>.
      </p>
    </div>
  );
}
