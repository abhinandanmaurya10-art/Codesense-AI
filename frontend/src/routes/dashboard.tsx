import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock3, Code2 } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api";

type DashboardStats = {
  totalReviews: number;
  completedReviews: number;
  failedReviews: number;
  averageScore: number;
  criticalIssues: number;
  languageBreakdown: { language: string; count: number; averageScore: number | null }[];
  scoreTrend: { date: string; score: number | null }[];
  recentReviews: {
    id: string;
    title: string;
    language: string;
    createdAt: string;
    status: string;
    overallScore: number | null;
    issueCount: number;
  }[];
};

const EMPTY_STATS: DashboardStats = {
  totalReviews: 0,
  completedReviews: 0,
  failedReviews: 0,
  averageScore: 0,
  criticalIssues: 0,
  languageBreakdown: [],
  scoreTrend: [],
  recentReviews: [],
};

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
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    apiRequest<{ data: DashboardStats }>("/dashboard/stats")
      .then((response) => {
        if (active) setStats(response.data);
      })
      .catch((requestError: unknown) => {
        if (active) {
          setError(
            requestError instanceof Error ? requestError.message : "Unable to load dashboard",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <DashboardShell>
      <div className="mx-auto max-w-6xl p-5 md:p-8">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Your code review activity</p>
            <h1 className="text-3xl font-semibold">Dashboard</h1>
          </div>
          <Button asChild variant="hero">
            <Link to="/review">
              Review Code <ArrowRight />
            </Link>
          </Button>
        </header>
        {error && (
          <p role="alert" className="mb-5 text-sm text-danger">
            {error}
          </p>
        )}
        <div className="mb-7 grid grid-cols-2 gap-4 md:grid-cols-4">
          <Metric
            value={loading ? "…" : String(stats.totalReviews)}
            label="Reviews"
            tone="primary"
          />
          <Metric
            value={loading ? "…" : stats.totalReviews ? `${stats.averageScore}/10` : "—"}
            label="Average score"
            tone="success"
          />
          <Metric
            value={loading ? "…" : String(stats.languageBreakdown.length)}
            label="Languages reviewed"
            tone="purple"
          />
          <Metric
            value={loading ? "…" : String(stats.criticalIssues)}
            label="Critical findings"
            tone="warning"
          />
        </div>
        <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Recent reviews</h2>
              <Link to="/history" className="text-sm text-primary hover:underline">
                View history
              </Link>
            </div>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading your reviews…</p>
            ) : stats.recentReviews.length ? (
              <div className="space-y-3">
                {stats.recentReviews.map((review) => (
                  <Link
                    key={review.id}
                    to="/reviews/$id"
                    params={{ id: review.id }}
                    className="flex items-center gap-4 rounded-xl border border-border bg-panel p-4 hover:border-primary/60"
                  >
                    <Code2 className="size-5 text-primary" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{review.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {review.language} · {new Date(review.createdAt).toLocaleDateString()} ·{" "}
                        {review.issueCount} findings
                      </p>
                    </div>
                    <span className="rounded-lg bg-secondary px-3 py-1 text-sm">
                      {review.overallScore == null ? review.status : `${review.overallScore}/10`}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="rounded-xl border border-border bg-panel p-5 text-sm text-muted-foreground">
                No reviews yet. Create your first code review to see your activity here.
              </p>
            )}
          </div>
          <div className="rounded-2xl border border-border bg-panel p-6">
            <div className="mb-5 flex items-center gap-2">
              <Clock3 className="size-5 text-primary" />
              <h2 className="font-semibold">Quality trend</h2>
            </div>
            {stats.scoreTrend.length ? (
              <>
                <div className="flex h-48 items-end gap-3">
                  {stats.scoreTrend.map((point, index) => (
                    <div
                      key={`${point.date}-${index}`}
                      className="flex-1 rounded-t-md bg-primary/70"
                      title={`${new Date(point.date).toLocaleDateString()}: ${point.score ?? "N/A"}/10`}
                      style={{ height: `${Math.max(4, Math.min(100, (point.score ?? 0) * 10))}%` }}
                    />
                  ))}
                </div>
                <div className="mt-3 flex justify-between text-xs text-muted-foreground">
                  <span>{new Date(stats.scoreTrend[0].date).toLocaleDateString()}</span>
                  <span>
                    {new Date(
                      stats.scoreTrend[stats.scoreTrend.length - 1].date,
                    ).toLocaleDateString()}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Your quality trend will appear after you complete a review.
              </p>
            )}
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
