import { useEffect } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { setAccessToken } from '@/lib/auth';
import { apiRequest } from '@/lib/api';

export const Route = createFileRoute('/auth/github/success')({
  head: () => ({
    meta: [{ title: 'GitHub Login Success — CodeSense AI' }],
  }),
  component: GitHubSuccess,
});

function parseTokenFromSearch(search) {
  return new URLSearchParams(search).get('token');
}

function GitHubSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = parseTokenFromSearch(window.location.search);
    if (!token) {
      navigate({ to: '/login' });
      return;
    }

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
        <p className="mt-4 text-sm text-muted-foreground">Completing GitHub login and redirecting to your dashboard.</p>
      </div>
    </main>
  );
}
