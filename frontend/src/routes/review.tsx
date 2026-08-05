import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/dashboard-shell";
import { ReviewWorkspace } from "@/components/review-workspace";

export const Route = createFileRoute("/review")({
  head: () => ({
    meta: [
      { title: "New Code Review — CodeSense AI" },
      { name: "description", content: "Review code for logic, security, and performance issues." },
      { property: "og:title", content: "New Code Review — CodeSense AI" },
      {
        property: "og:description",
        content: "Review code for logic, security, and performance issues.",
      },
    ],
  }),
  component: () => (
    <DashboardShell>
      <ReviewWorkspace />
    </DashboardShell>
  ),
});
