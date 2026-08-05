import { AlertTriangle, CheckCircle2, CircleAlert } from "lucide-react";

const findings = [
  {
    icon: CircleAlert,
    title: "Logic Error",
    detail: "Missing await — returns Promise",
    tone: "danger",
  },
  {
    icon: AlertTriangle,
    title: "Performance",
    detail: "No error handling on fetch",
    tone: "warning",
  },
  {
    icon: CheckCircle2,
    title: "Best Practice",
    detail: "Add try/catch + status check",
    tone: "success",
  },
] as const;

export function CodeReviewDemo() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-panel shadow-2xl shadow-panel-deep/40">
      <div className="flex items-center justify-between border-b border-border bg-panel-deep px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="size-3 rounded-full bg-danger" />
          <span className="size-3 rounded-full bg-warning" />
          <span className="size-3 rounded-full bg-success" />
          <span className="ml-3 text-sm text-muted-foreground">app.js — CodeSense AI</span>
        </div>
        <div className="hidden gap-2 sm:flex">
          <span className="rounded-md bg-primary/15 px-3 py-1 text-xs text-code-blue">
            JavaScript
          </span>
          <span className="rounded-md bg-success/15 px-3 py-1 text-xs text-success">Score: 87</span>
        </div>
      </div>
      <div className="grid md:grid-cols-2">
        <div className="code-grid min-h-80 border-b border-border p-6 font-mono text-sm leading-[2.35rem] md:border-r md:border-b-0 sm:text-base">
          <p>
            <span className="mr-5 text-muted-foreground">1</span>async{" "}
            <span className="text-code-blue">function</span>{" "}
            <span className="text-success">fetchUser</span>(id) &#123;
          </p>
          <p>
            <span className="mr-5 text-muted-foreground">2</span>&nbsp; const res = await
          </p>
          <p className="text-warning">
            &nbsp;&nbsp;&nbsp;&nbsp;fetch(`/api/users/$&#123;id&#125;`);
          </p>
          <p className="bg-danger/10">
            <span className="mr-5 text-muted-foreground">3</span>&nbsp; const data = res.json();{" "}
            <span className="text-danger">← missing await</span>
          </p>
          <p>
            <span className="mr-5 text-muted-foreground">4</span>&nbsp; return data;
          </p>
          <p>
            <span className="mr-5 text-muted-foreground">5</span>&#125;
          </p>
        </div>
        <div className="space-y-3 p-6">
          <p className="mb-4 text-sm font-medium uppercase tracking-wider text-muted-foreground">
            AI Review
          </p>
          {findings.map(({ icon: Icon, title, detail, tone }) => (
            <div
              key={title}
              className={`flex gap-3 rounded-xl border p-4 ${tone === "danger" ? "border-danger/40 bg-danger/10" : tone === "warning" ? "border-warning/40 bg-warning/10" : "border-success/40 bg-success/10"}`}
            >
              <Icon
                className={`mt-0.5 size-5 shrink-0 ${tone === "danger" ? "text-danger" : tone === "warning" ? "text-warning" : "text-success"}`}
              />
              <div>
                <p className="font-medium">{title}</p>
                <p className="text-sm text-muted-foreground">{detail}</p>
              </div>
            </div>
          ))}
          <div className="flex items-center gap-4 pt-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
              <div className="h-full w-[63%] bg-gradient-to-r from-primary to-code-purple" />
            </div>
            <span className="text-sm font-semibold">63/100</span>
          </div>
        </div>
      </div>
    </div>
  );
}
