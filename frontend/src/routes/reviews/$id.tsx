import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/dashboard-shell";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/reviews/$id")({
  component: ({ params }) => (
    <DashboardShell>
      <ReviewDetail id={params.id} />
    </DashboardShell>
  ),
});

function ReviewDetail({ id }: { id: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [review, setReview] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    apiRequest<any>(`/reviews/${id}`)
      .then((payload) => {
        if (!mounted) return;
        setReview(payload.review ?? payload.data?.review ?? null);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || "Failed to load review");
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [id]);

  if (loading) return <div className="p-8">Loading…</div>;
  if (error) return <div className="p-8 text-danger">{error}</div>;
  if (!review) return <div className="p-8">Review not found.</div>;

  return (
    <div className="p-8">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">{review.title}</h2>
          <div className="text-sm text-muted-foreground">{review.language} · {new Date(review.createdAt).toLocaleString()}</div>
        </div>
        <div>
          <Button variant="ghost">Download</Button>
        </div>
      </div>

      <section className="mb-6">
        <h3 className="mb-2 font-semibold">Code</h3>
        <pre className="rounded-xl bg-[#0f172a] p-4 text-sm text-slate-100 overflow-x-auto">{review.code}</pre>
      </section>

      <section>
        <h3 className="mb-2 font-semibold">AI Review</h3>
        {review.result ? (
          <div className="space-y-4">
            <p className="font-medium">{review.result.summary}</p>
            {review.result.improvements?.map((imp: any, i: number) => (
              <div key={i} className="rounded-xl border border-border p-3">
                <p className="font-semibold">{imp.title}</p>
                <p className="text-sm text-muted-foreground">{imp.description}</p>
                {imp.codeSnippet && <pre className="mt-2 overflow-x-auto rounded-xl bg-[#0f172a] p-3 text-xs text-slate-100">{imp.codeSnippet}</pre>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No AI result available for this review.</p>
        )}
      </section>
    </div>
  );
}
