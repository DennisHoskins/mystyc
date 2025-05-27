'use client';

import { useCustomRouter } from '@/hooks/useCustomRouter';

import Button from '@/components/ui/Button';
import IconEye from '@/components/icons/IconEye';

export default function Header() {
  const router = useCustomRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    router.push('/');
  };

  const handleSignOut = () => {
    router.push('/logout');
  };

  return (
    <header className="w-full border-b bg-white px-4 py-3 shadow-sm animate-fade-in">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <a
          href="/"
          onClick={handleClick}
        >
          <IconEye size={70} className="text-indigo-600" />
        </a>
        <Button onClick={handleSignOut} size="sm">
          Sign Out
        </Button>
      </div>
    </header>
  );
}