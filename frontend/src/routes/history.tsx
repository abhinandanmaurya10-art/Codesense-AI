import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/dashboard-shell";
import { apiRequest } from "@/lib/api";
import { Link } from "@tanstack/react-router";

type ReviewSummary = {
  id: string;
  title: string;
  language: string;
  createdAt: string;
  status: string;
  overallScore: number | null;
  issueCount: number;
};

export const Route = createFileRoute("/history")({
  component: () => <DashboardShell><HistoryPage /></DashboardShell>,
});

function HistoryPage() {
  const [reviews, setReviews] = useState<ReviewSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    apiRequest<{ data?: { reviews: ReviewSummary[] }; reviews?: ReviewSummary[] }>(
      "/reviews?page=1&limit=20",
    )
    .then((payload) => {
      if (!mounted) return;
      setReviews(payload.data?.reviews ?? payload.reviews ?? []);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || "Failed to load reviews");
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    function handler(event: Event) {
      const newReview = (event as CustomEvent<{ review?: ReviewSummary }>).detail?.review;
      if (!newReview) return;
      setReviews((prev) => [newReview, ...prev]);
    }
    window.addEventListener("codesense:review-created", handler);
    return () => window.removeEventListener("codesense:review-created", handler);
  }, []);

  return (
    <div className="p-8">
      <h2 className="mb-4 text-2xl font-semibold">Review History</h2>
      {loading ? (
        <p>Loading…</p>
      ) : error ? (
        <p className="text-danger">{error}</p>
      ) : reviews.length === 0 ? (
        <p className="text-muted-foreground">No reviews yet. Create your first review.</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((r: any) => (
            <div key={r.id} className="rounded-xl border border-border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Link to="/reviews/$id" params={{ id: r.id }} className="font-semibold">
                    {r.title}
                  </Link>
                  <div className="text-sm text-muted-foreground">{r.language} · {new Date(r.createdAt).toLocaleString()}</div>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <div>{r.status}</div>
                  <div>{r.issueCount} findings{r.overallScore == null ? "" : ` · Score ${r.overallScore}/10`}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
