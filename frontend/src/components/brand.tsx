import { Code2 } from "lucide-react";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3" aria-label="CodeSense AI">
      <span className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-code-purple text-primary-foreground shadow-lg">
        <Code2 className="size-5" aria-hidden="true" />
      </span>
      {!compact && (
        <span className="text-xl font-semibold tracking-tight">
          CodeSense <span className="text-primary">AI</span>
        </span>
      )}
    </div>
  );
}
