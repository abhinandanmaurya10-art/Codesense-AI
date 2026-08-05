import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock3, Code2 } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — CodeSense AI" },
      {
        name: "description",
        content: "View code review activity and quality scores in CodeSense AI.",
      },
      { property: "og:title", content: "Dashboard — CodeSense AI" },
      {
        property: "og:description",
        content: "View code review activity and quality scores in CodeSense AI.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  return (
    <DashboardShell>
      <div className="mx-auto max-w-6xl p-5 md:p-8">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Welcome back, Alex</p>
            <h1 className="text-3xl font-semibold">Dashboard</h1>
          </div>
          <Button asChild variant="hero">
            <Link to="/review">
              Review Code <ArrowRight />
            </Link>
          </Button>
        </header>
        <div className="mb-7 grid grid-cols-2 gap-4 md:grid-cols-4">
          <Metric value="24" label="Reviews" tone="primary" />
          <Metric value="82" label="Avg Score" tone="success" />
          <Metric value="10" label="Languages" tone="purple" />
          <Metric value="3" label="This Week" tone="warning" />
        </div>
        <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Recent reviews</h2>
              <span className="text-sm text-muted-foreground">Last 30 days</span>
            </div>
            <div className="space-y-3">
              {[
                ["auth.js", "42", "danger"],
                ["parser.py", "91", "success"],
                ["server.go", "76", "warning"],
              ].map(([file, score, tone]) => (
                <Link
                  key={file}
                  to="/review"
                  className="flex items-center gap-4 rounded-xl border border-border bg-panel p-4 hover:border-primary/60"
                >
                  <Code2 className="size-5 text-primary" />
                  <div className="flex-1">
                    <p className="font-medium">{file}</p>
                    <p className="text-sm text-muted-foreground">Reviewed today · 4 findings</p>
                  </div>
                  <span
                    className={`rounded-lg px-3 py-1 text-sm ${tone === "danger" ? "bg-danger/15 text-danger" : tone === "success" ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}
                  >
                    {score}
                  </span>
                </Link>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-panel p-6">
            <div className="mb-5 flex items-center gap-2">
              <Clock3 className="size-5 text-primary" />
              <h2 className="font-semibold">Quality trend</h2>
            </div>
            <div className="flex h-48 items-end gap-3">
              {["h-[44%]", "h-[61%]", "h-[53%]", "h-[74%]", "h-[68%]", "h-[82%]", "h-[78%]"].map(
                (height, i) => (
                  <div key={i} className={`flex-1 rounded-t-md bg-primary/70 ${height}`} />
                ),
              )}
            </div>
            <div className="mt-3 flex justify-between text-xs text-muted-foreground">
              <span>Mon</span>
              <span>Today</span>
            </div>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}

function Metric({ value, label, tone }: { value: string; label: string; tone: string }) {
  return (
    <div className="rounded-2xl border border-border bg-panel p-5">
      <p
        className={`text-3xl font-semibold ${tone === "success" ? "text-success" : tone === "purple" ? "text-code-purple" : tone === "warning" ? "text-warning" : "text-primary"}`}
      >
        {value}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
