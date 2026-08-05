import { apiRequest } from "./api";

export interface ReviewIssue {
  severity: "critical" | "warning" | "info";
  line: number | null;
  message: string;
  suggestion: string;
}

export interface ReviewResult {
  overallScore: number;
  summary: string;
  issues: ReviewIssue[];
  improvements: Array<{ title: string; description: string; codeSnippet?: string }>;
  strengths: string[];
}

export async function createReview(payload: {
  language: string;
  code: string;
  title?: string;
  context?: string;
  source?: 'textarea' | 'uploaded' | 'marked';
  fileName?: string;
  isMarked?: boolean;
}) {
  const response = await apiRequest<any>("/reviews", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  // Support both backend response shapes:
  // - { review: { result: ReviewResult } }
  // - { data: { review: { result: ReviewResult } } }
  const reviewObj = response.review ?? response.data?.review ?? response.data ?? response;

  // If the server returned a created review document, emit an event so UI can update history live.
  try {
    const createdReview = reviewObj && typeof reviewObj === "object" ? reviewObj : null;
    const result = createdReview?.result ?? reviewObj;

    const summary = createdReview
      ? {
          _id: createdReview._id ?? createdReview.id,
          title: createdReview.title,
          language: createdReview.language,
          createdAt: createdReview.createdAt ?? new Date().toISOString(),
          status: createdReview.status ?? "completed",
          summary: createdReview.result?.summary ?? (result?.summary ?? null),
        }
      : null;

    if (typeof window !== "undefined" && summary) {
      window.dispatchEvent(new CustomEvent("codesense:review-created", { detail: { review: summary } }));
    }

    return result;
  } catch (e) {
    return reviewObj?.result ?? reviewObj;
  }
}
