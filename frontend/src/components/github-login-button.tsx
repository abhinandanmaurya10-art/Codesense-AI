import { Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getApiUrl } from '@/lib/api';

export function GitHubLoginButton() {
  return (
    <Button asChild variant="panel" size="lg" className="w-full">
      <a href={getApiUrl("/auth/github")}>
        <Github />
        Continue with GitHub
      </a>
    </Button>
  );
}
