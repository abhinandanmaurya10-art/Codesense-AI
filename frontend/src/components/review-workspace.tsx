import { useState } from "react";
import { AlertTriangle, CheckCircle2, Copy, Download, Play, ShieldAlert, Upload, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createReview, ReviewResult } from "@/lib/review";

const languageOptions = [
  { label: "JavaScript", value: "javascript" },
  { label: "TypeScript", value: "typescript" },
  { label: "Python", value: "python" },
  { label: "Go", value: "go" },
  { label: "Java", value: "java" },
  { label: "C#", value: "csharp" },
  { label: "Ruby", value: "ruby" },
  { label: "PHP", value: "php" },
  { label: "C++", value: "cpp" },
  { label: "Rust", value: "rust" },
  { label: "C", value: "c" },
  { label: "SQL", value: "sql" },
];

export function ReviewWorkspace() {
  const [language, setLanguage] = useState(languageOptions[0].value);
  const [code, setCode] = useState(`async function validateUser(token) {
  if (token == null) {
    eval(token);
  }
  const user = await db.query("SELECT * FROM users WHERE token='\${token}'");
  return user;
}`);
  const [reviewResult, setReviewResult] = useState<ReviewResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [source, setSource] = useState<'textarea' | 'uploaded'>('textarea');
  const [fileName, setFileName] = useState('');
  const [isMarked, setIsMarked] = useState(false);

  async function handleReview() {
    setError("");
    setBusy(true);
    try {
      const result = await createReview({ language, code, source, fileName: fileName || undefined, isMarked });
      setReviewResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Review failed");
    } finally {
      setBusy(false);
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCode(content);
      setSource('uploaded');
      setFileName(file.name);
    };
    reader.onerror = () => {
      setError('Failed to read file');
    };
    reader.readAsText(file);
  }

  const score = reviewResult?.overallScore ?? 63;
  const statusText = reviewResult ? "Good work" : "Needs Work";
  const statusStyle = reviewResult ? "text-success" : "text-warning";
  const [activeTab, setActiveTab] = useState<"syntax" | "logic" | "security">("syntax");

  return (
    <div className="grid min-h-[calc(100vh-1px)] lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.95fr)]">
      <section className="border-r border-border bg-panel">
        <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="h-11 rounded-xl border border-border bg-secondary px-4 font-semibold outline-none focus:ring-2 focus:ring-ring"
          >
            {languageOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <label>
            <input
              type="file"
              accept=".js,.ts,.py,.go,.rs,.java,.cpp,.cs,.rb,.php,.c,.sql,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button variant="outline" size="lg" asChild className="cursor-pointer">
              <span>
                <Upload className="w-4 h-4" />
                Upload File
              </span>
            </Button>
          </label>
          <Button 
            variant={isMarked ? "hero" : "outline"} 
            size="lg" 
            onClick={() => setIsMarked(!isMarked)}
            title={isMarked ? "Unmark review" : "Mark review for later"}
          >
            <Bookmark className="w-4 h-4" />
            {isMarked ? "Marked" : "Mark"}
          </Button>
          <Button variant="hero" size="lg" disabled={busy} onClick={handleReview}>
            <Play />
            {busy ? "Reviewing…" : "Review Code"}
          </Button>
        </div>
        <div className="p-7">
          {fileName && <p className="mb-2 text-sm text-muted-foreground">File: {fileName}</p>}
          <Textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            className="min-h-[24rem] w-full resize-none bg-panel border border-border font-mono text-sm leading-[1.75rem] sm:text-base"
          />
          {error && <p className="mt-4 text-sm text-danger">{error}</p>}
        </div>
        <div className="border-t border-border p-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Review Summary
            </p>
            <div className="flex gap-2">
              <Button variant="panel" size="sm" onClick={() => navigator.clipboard.writeText(code)}>
                <Copy />
                Copy
              </Button>
              <Button
                variant="panel"
                size="sm"
                onClick={() => alert("Download not yet implemented")}
              >
                <Download />
                Download
              </Button>
            </div>
          </div>
          <div className="rounded-xl bg-panel-deep p-5 text-sm leading-6 text-foreground">
            {reviewResult ? (
              <div>
                <p className="mb-3 font-medium">{reviewResult.summary}</p>
                {reviewResult.improvements.length > 0 && (
                  <div className="space-y-3">
                    {reviewResult.improvements.map((improvement, index) => (
                      <div key={index} className="rounded-xl border border-border p-3">
                        <p className="font-semibold">{improvement.title}</p>
                        <p className="text-muted-foreground">{improvement.description}</p>
                        {improvement.codeSnippet && (
                          <pre className="mt-3 overflow-x-auto rounded-xl bg-[#0f172a] p-3 text-xs text-slate-100">
                            {improvement.codeSnippet}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">
                Submit your code to get a review summary, security findings, and improvement
                suggestions.
              </p>
            )}
          </div>
        </div>
      </section>
      <aside className="bg-panel">
        <div className="flex items-center gap-6 border-b border-border p-6">
          <div className="grid size-24 place-items-center rounded-full bg-[conic-gradient(var(--primary)_63%,var(--secondary)_0)]">
            <div className="grid size-16 place-items-center rounded-full bg-panel text-2xl font-semibold">
              {score}
            </div>
          </div>
          <div>
            <p className="text-xl font-semibold">Quality Score</p>
            <p className={statusStyle}>{statusText}</p>
            <p className="text-sm text-muted-foreground">
              {reviewResult
                ? `${reviewResult.issues.filter((issue) => issue.severity === "critical").length} critical · ${reviewResult.issues.filter((issue) => issue.severity === "warning").length} warning`
                : "Ready for review"}
            </p>
          </div>
        </div>
        <div className="flex gap-2 border-b border-border p-4">
          <button
            onClick={() => setActiveTab("syntax")}
            className={`rounded-lg px-4 py-2 ${activeTab === "syntax" ? "bg-primary/15 text-primary" : "text-muted-foreground"}`}
          >
            Syntax
          </button>
          <button
            onClick={() => setActiveTab("logic")}
            className={`rounded-lg px-4 py-2 ${activeTab === "logic" ? "bg-primary/15 text-primary" : "text-muted-foreground"}`}
          >
            Logic
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`rounded-lg px-4 py-2 ${activeTab === "security" ? "bg-primary/15 text-primary" : "text-muted-foreground"}`}
          >
            Security
          </button>
        </div>
        <div className="space-y-3 p-5">
          {reviewResult?.issues.length ? (
            (() => {
              const securityKeywords = [
                "injection",
                "sql",
                "xss",
                "csrf",
                "eval",
                "token",
                "secret",
                "encrypt",
                "password",
                "auth",
                "sanitize",
                "sanitize",
              ];
              const logicKeywords = [
                "null",
                "undefined",
                "off by",
                "race",
                "concurr",
                "async",
                "await",
                "timeout",
                "performance",
                "leak",
              ];

              const filtered = reviewResult.issues.filter((issue) => {
                const text = `${issue.message} ${issue.suggestion}`.toLowerCase();
                if (activeTab === "security") {
                  return securityKeywords.some((k) => text.includes(k));
                }
                if (activeTab === "logic") {
                  return logicKeywords.some((k) => text.includes(k));
                }
                // syntax tab (default) shows all issues
                return true;
              });

              if (!filtered.length) {
                return (
                  <p className="text-sm text-muted-foreground">No findings in this category.</p>
                );
              }

              return filtered.map((issue, index) => (
                <Finding
                  key={`${issue.severity}-${index}-${issue.line}`}
                  icon={
                    issue.severity === "warning"
                      ? AlertTriangle
                      : issue.severity === "critical"
                        ? ShieldAlert
                        : CheckCircle2
                  }
                  title={issue.message}
                  detail={`Line ${issue.line ?? "?"}: ${issue.suggestion}`}
                  tone={
                    issue.severity === "critical"
                      ? "danger"
                      : issue.severity === "warning"
                        ? "warning"
                        : "success"
                  }
                />
              ));
            })()
          ) : (
            <p className="text-sm text-muted-foreground">
              No review results yet. Click Review Code to start.
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}

function Finding({
  icon: Icon,
  title,
  detail,
  tone,
}: {
  icon: typeof ShieldAlert;
  title: string;
  detail: string;
  tone: "danger" | "warning" | "success";
}) {
  return (
    <div
      className={`flex gap-3 rounded-xl border p-4 ${tone === "danger" ? "border-danger/40 bg-danger/10" : tone === "warning" ? "border-warning/40 bg-warning/10" : "border-success/40 bg-success/10"}`}
    >
      <Icon
        className={`size-5 shrink-0 ${tone === "danger" ? "text-danger" : tone === "warning" ? "text-warning" : "text-success"}`}
      />
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm leading-relaxed text-muted-foreground">{detail}</p>
      </div>
    </div>
  );
}
