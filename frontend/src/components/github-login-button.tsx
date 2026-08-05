import { Github } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function GitHubLoginButton() {
  return (
    <Button asChild variant="panel" size="lg" className="w-full">
      <a href="/api/auth/github">
        <Github />
        Continue with GitHub
      </a>
    </Button>
  );
}
