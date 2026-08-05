import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Bug, Github, Gauge, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CodeReviewDemo } from "@/components/code-review-demo";
import { SiteHeader } from "@/components/site-header";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CodeSense AI — AI Code Review" },
      {
        name: "description",
        content:
          "Review, debug, and improve code with instant AI-powered security and quality insights.",
      },
      { property: "og:title", content: "CodeSense AI — AI Code Review" },
      {
        property: "og:description",
        content:
          "Review, debug, and improve code with instant AI-powered security and quality insights.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen overflow-hidden bg-background px-4 pb-10">
      <SiteHeader />
      <main className="mx-auto max-w-7xl">
        <section className="mx-auto max-w-4xl py-20 text-center md:py-28">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-code-purple/50 bg-code-purple/10 px-4 py-2 text-sm font-medium text-code-purple">
            <ShieldCheck className="size-4" />
            Powered by advanced AI
          </div>
          <h1 className="text-balance text-4xl font-medium leading-tight tracking-tight md:text-6xl">
            Review, Debug, and Improve
            <br />
            <span className="text-primary">Your Code with AI</span>
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-muted-foreground">
            Instantly analyze code quality, catch security vulnerabilities, and get AI-powered fixes
            — in seconds, not hours.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Button asChild variant="hero" size="lg">
              <a href="/review">
                Start Reviewing <ArrowRight />
              </a>
            </Button>
            <Button asChild variant="panel" size="lg">
              <a href="https://github.com" target="_blank" rel="noreferrer">
                <Github />
                View on GitHub
              </a>
            </Button>
          </div>
        </section>
        <CodeReviewDemo />
        <section className="grid gap-5 py-16 sm:grid-cols-3">
          {[
            ["2.4M+", "Reviews Generated", "primary"],
            ["10", "Languages Supported", "purple"],
            ["98.2%", "Accuracy Rate", "success"],
          ].map(([value, label, tone]) => (
            <div key={label} className="rounded-2xl border border-border bg-panel p-8 text-center">
              <p
                className={`text-4xl font-medium ${tone === "success" ? "text-success" : tone === "purple" ? "text-code-purple" : "text-primary"}`}
              >
                {value}
              </p>
              <p className="mt-3 text-muted-foreground">{label}</p>
            </div>
          ))}
        </section>
        <section id="features" className="grid gap-5 pb-16 md:grid-cols-3">
          <Feature icon={Bug} title="Error Detection">
            Catch syntax errors, logic bugs, and runtime exceptions before they reach production.
          </Feature>
          <Feature icon={ShieldCheck} title="Security Scanning">
            Identify SQL injection, XSS, insecure auth, and OWASP vulnerabilities instantly.
          </Feature>
          <Feature icon={Gauge} title="Performance Insights">
            Get suggestions on time complexity, memory usage, and inefficient patterns.
          </Feature>
        </section>
      </main>
      <footer className="mx-auto max-w-7xl border-t border-border pt-7 text-center text-sm uppercase tracking-widest text-muted-foreground">
        CodeSense AI — Smarter code reviews
      </footer>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Bug;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <article className="rounded-2xl border border-border bg-panel p-7">
      <div className="mb-5 grid size-12 place-items-center rounded-xl bg-primary/15 text-primary">
        <Icon />
      </div>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-3 leading-7 text-muted-foreground">{children}</p>
    </article>
  );
}
