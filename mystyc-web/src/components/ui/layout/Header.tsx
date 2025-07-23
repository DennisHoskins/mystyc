import AppLogo from '@/components/ui/AppLogo';
import Link from '@/components/ui/Link';

interface HeaderProps {
  children: React.ReactNode;
  isPlus?: boolean;
  isFullWidth?: boolean;
}

export default function Header({ children, isPlus = false, isFullWidth = false }: HeaderProps) {
  return (
    <header className="flex w-full bg-white px-4 py-3 shadow-sm relative z-[70]">

      <nav className={`flex w-full ${!isFullWidth ? 'max-w-content' : ''} mx-auto items-center`}>
        <Link 
          href="/"
          className="flex items-center"
        >
          <AppLogo orientation="horizontal" showText isPlus={isPlus} />
        </Link>

        <div className="flex space-x-4 ml-auto">
          {children}
        </div>
      </nav>

    </header>
  );
}