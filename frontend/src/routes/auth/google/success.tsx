import { useEffect } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { apiRequest, setAccessToken } from '@/lib/api';

export const Route = createFileRoute('/auth/google/success')({
  head: () => ({
    meta: [{ title: 'Google Login Success — CodeSense AI' }],
  }),
  component: GoogleSuccess,
});

function parseTokenFromHash(hash: string) {
  return new URLSearchParams(hash.slice(1)).get('token');
}

function GoogleSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = parseTokenFromHash(window.location.hash);
    if (!token) {
      navigate({ to: '/login' });
      return;
    }

    window.history.replaceState(null, '', window.location.pathname);
    setAccessToken(token);

    apiRequest('/auth/me', {
      method: 'GET',
    })
      .then(() => {
        navigate({ to: '/dashboard' });
      })
      .catch(() => {
        navigate({ to: '/login' });
      });
  }, [navigate]);

  return (
    <main className="grid min-h-screen place-items-center bg-background p-5">
      <div className="w-full max-w-md rounded-3xl border border-border bg-panel p-10 text-center shadow-2xl">
        <h1 className="text-2xl font-semibold">Signing you in…</h1>
        <p className="mt-4 text-sm text-muted-foreground">Completing Google login and redirecting to your dashboard.</p>
      </div>
    </main>
  );
}
