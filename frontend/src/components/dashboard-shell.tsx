import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BarChart3, Clock3, FilePlus2, LogOut, Settings, UserRound } from "lucide-react";
import { Brand } from "@/components/brand";
import { logoutUser, type AuthUser } from "@/lib/auth";
import { apiRequest, getAccessToken, refreshAccessToken } from "@/lib/api";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      try {
        if (!getAccessToken() && !(await refreshAccessToken())) {
          throw new Error("Session expired");
        }
        const response = await apiRequest<{ data?: { user: AuthUser }; user?: AuthUser }>(
          "/auth/me",
        );
        const currentUser = response.data?.user ?? response.user;
        if (!currentUser) throw new Error("Unable to load your account");
        if (active) {
          setUser(currentUser);
          setAuthenticated(true);
        }
      } catch {
        if (active) navigate({ to: "/login", replace: true });
      }
    }

    void restoreSession();
    return () => {
      active = false;
    };
  }, [navigate]);

  async function handleLogout() {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logoutUser();
      await navigate({ to: "/login", replace: true });
    } catch {
      window.location.assign(
        `/login?error=${encodeURIComponent("You were signed out on this device, but the server could not confirm logout. Please try again.")}`,
      );
    }
  }

  const displayName = user?.name || "Account";
  const initials = displayName
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (!authenticated) {
    return (
      <main className="grid min-h-screen place-items-center bg-background p-5 text-muted-foreground">
        Restoring your secure session…
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[17rem_1fr]">
      <header className="flex items-center justify-between border-b border-border bg-panel-deep p-4 lg:hidden">
        <Brand />
        <button
          onClick={handleLogout}
          title={isLoggingOut ? "Logging out…" : "Log out"}
          aria-label={isLoggingOut ? "Logging out" : "Log out"}
          aria-busy={isLoggingOut}
          disabled={isLoggingOut}
          className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-wait disabled:opacity-60"
          type="button"
        >
          <LogOut className="size-4" />
        </button>
      </header>
      <nav className="flex gap-2 overflow-x-auto border-b border-border p-3 text-sm text-muted-foreground lg:hidden">
        <NavLink to="/dashboard" icon={BarChart3}>
          Dashboard
        </NavLink>
        <NavLink to="/review" icon={FilePlus2}>
          New Review
        </NavLink>
        <NavLink to="/history" icon={Clock3}>
          History
        </NavLink>
        <NavLink to="/settings" icon={Settings}>
          Settings
        </NavLink>
      </nav>
      <aside className="hidden min-h-screen border-r border-border bg-panel-deep lg:flex lg:flex-col">
        <div className="border-b border-border p-6">
          <Brand />
        </div>
        <nav className="space-y-2 p-4 text-muted-foreground">
          <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-widest">Navigation</p>
          <NavLink to="/dashboard" icon={BarChart3}>
            Dashboard
          </NavLink>
          <NavLink to="/review" icon={FilePlus2}>
            New Review
          </NavLink>
          <NavLink to="/history" icon={Clock3}>
            History
          </NavLink>
          <NavLink to="/settings" icon={Settings}>
            Settings
          </NavLink>
        </nav>
        <div className="mt-auto flex items-center gap-3 border-t border-border p-5">
          <div className="grid size-11 place-items-center rounded-full bg-gradient-to-br from-primary to-code-purple font-semibold">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{displayName}</p>
            <p className="truncate text-sm text-muted-foreground">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            title={isLoggingOut ? "Logging out…" : "Log out"}
            aria-label={isLoggingOut ? "Logging out" : "Log out"}
            aria-busy={isLoggingOut}
            disabled={isLoggingOut}
            className="flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg px-3 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-wait disabled:opacity-60"
            type="button"
          >
            <LogOut className="size-4" />
            <span className="text-sm">Log out</span>
          </button>
        </div>
      </aside>
      <main>{children}</main>
    </div>
  );
}

function NavLink({
  to,
  icon: Icon,
  children,
}: {
  to: string;
  icon: typeof UserRound;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      activeProps={{ className: "bg-primary/15 text-primary" }}
      className="flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-secondary hover:text-foreground"
    >
      <Icon className="size-5" />
      {children}
    </Link>
  );
}
