import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/dashboard-shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/settings")({
  component: () => (
    <DashboardShell>
      <SettingsPage />
    </DashboardShell>
  ),
});

type Settings = {
  preferredModel?: string;
  enableHeuristicFallback?: boolean;
};

const STORAGE_KEY = "codesense_settings";

function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({ preferredModel: "", enableHeuristicFallback: true });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (raw) setSettings(JSON.parse(raw));
  }, []);

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div className="p-8">
      <h2 className="mb-4 text-2xl font-semibold">Settings</h2>
      <div className="max-w-xl space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium">Preferred AI Model</label>
          <input
            value={settings.preferredModel}
            onChange={(e) => setSettings({ ...settings, preferredModel: e.target.value })}
            placeholder="e.g. models/gemini-2.5-flash"
            className="w-full rounded-xl border border-border px-3 py-2"
          />
          <p className="mt-2 text-sm text-muted-foreground">Note: model changes must also be set on the backend to take effect.</p>
        </div>

        <div>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={!!settings.enableHeuristicFallback}
              onChange={(e) => setSettings({ ...settings, enableHeuristicFallback: e.target.checked })}
            />
            <span className="text-sm">Enable heuristic offline fallback</span>
          </label>
          <p className="mt-2 text-sm text-muted-foreground">When enabled, the app will surface a best-effort analysis if the AI provider is unreachable.</p>
        </div>

        <div className="flex items-center gap-4">
          <Button onClick={save}>Save</Button>
          {saved && <span className="text-sm text-success">Saved</span>}
        </div>
      </div>
    </div>
  );
}
