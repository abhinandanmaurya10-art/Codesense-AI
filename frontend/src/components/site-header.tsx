import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="mx-auto mt-5 flex max-w-7xl items-center justify-between rounded-2xl border border-border bg-panel/90 px-5 py-4 backdrop-blur md:px-7">
      <Link to="/" aria-label="CodeSense AI home">
        <Brand />
      </Link>
      <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
        <Link to="/" hash="features" className="transition-colors hover:text-foreground">
          Features
        </Link>
        <span>Pricing</span>
        <span>Docs</span>
      </nav>
      <div className="hidden gap-2 md:flex">
        <Button asChild variant="nav">
          <Link to="/login">Log in</Link>
        </Button>
        <Button asChild variant="hero">
          <Link to="/dashboard">Get Started</Link>
        </Button>
      </div>
      <Button asChild variant="panel" size="icon" className="md:hidden">
        <Link to="/login" aria-label="Open login">
          <Menu />
        </Link>
      </Button>
    </header>
  );
}
