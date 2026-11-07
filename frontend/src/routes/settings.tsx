import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/settings")({
  component: () => (
    <DashboardShell>
      <SettingsPage />
    </DashboardShell>
  ),
});

function SettingsPage() {
  return (
    <div className="p-5 md:p-8">
      <h1 className="mb-4 text-2xl font-semibold">Settings</h1>
      <section className="max-w-2xl rounded-2xl border border-border bg-panel p-6">
        <div className="mb-4 flex items-center gap-3">
          <ShieldCheck className="size-6 text-primary" />
          <h2 className="text-lg font-semibold">AI review configuration</h2>
        </div>
        <p className="text-muted-foreground">
          The AI provider, model, and fallback behavior are managed by the backend deployment. They
          cannot be changed from this browser. API keys stay on the server and are never stored in
          your account settings.
        </p>
        <Button asChild variant="hero" className="mt-6">
          <Link to="/review">
            Start a code review <ArrowRight />
          </Link>
        </Button>
      </section>
    </div>
  );
}
