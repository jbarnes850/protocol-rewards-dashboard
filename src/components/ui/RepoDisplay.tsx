import { useUser } from '@clerk/clerk-react';
import { Github } from 'lucide-react';

interface TrackedRepository {
  name: string;
}

export function RepoDisplay() {
  const { user, isLoaded } = useUser();
  const githubUser = user?.externalAccounts.find(account => account.provider === 'github');
  const trackedRepository = user?.publicMetadata.trackedRepository as TrackedRepository | undefined;

  if (!isLoaded || !githubUser || !trackedRepository) {
    return null;
  }

  return (
    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-near-purple/5 border border-near-purple/10 rounded-lg">
      <Github className="w-4 h-4 text-near-purple" />
      <span className="text-sm text-near-purple font-medium">{trackedRepository.name}</span>
    </div>
  );
}
