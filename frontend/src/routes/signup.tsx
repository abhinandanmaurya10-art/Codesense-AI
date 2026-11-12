import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { registerUser } from "@/lib/auth";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create an account — CodeSense AI" },
      {
        name: "description",
        content: "Create a CodeSense AI account with your email and password.",
      },
    ],
  }),
  component: Signup,
});

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "Use at least 8 characters").max(128),
});

function Signup() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);
    const result = schema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Check your details");
      return;
    }

    setBusy(true);
    try {
      await registerUser(result.data.email, result.data.password);
      navigate({ to: "/dashboard" });
    } catch (signupError) {
      setError(
        signupError instanceof Error ? signupError.message : "Unable to create your account",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-background p-5">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-border bg-panel shadow-2xl">
        <div className="border-b border-border bg-panel-deep p-6">
          <Brand />
        </div>
        <form onSubmit={submit} className="space-y-5 p-7">
          <div>
            <h1 className="text-3xl font-semibold">Create your account</h1>
            <p className="mt-1 text-muted-foreground">Sign up with your email and password</p>
          </div>
          <label className="block text-sm text-muted-foreground">
            Email
            <input
              name="email"
              type="email"
              autoComplete="email"
              placeholder="alex@example.com"
              required
              className="mt-2 h-12 w-full rounded-xl border border-border bg-secondary px-4 text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
            />
          </label>
          <label className="block text-sm text-muted-foreground">
            Password
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              minLength={8}
              maxLength={128}
              required
              className="mt-2 h-12 w-full rounded-xl border border-border bg-secondary px-4 text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
            />
          </label>
          {error && (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          )}
          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={busy}>
            {busy ? "Creating account…" : "Create account"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
