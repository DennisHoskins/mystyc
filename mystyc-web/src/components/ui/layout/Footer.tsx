import Text from '@/components/ui/Text';

export default function Footer({ children } : { children?: React.ReactNode | null }) {
  return (
    <footer className="flex w-full px-4 py-3 text-center text-sm">
      <div className="flex w-full max-w-content mx-auto justify-center items-center">
        <span>
          <Text variant='muted' className='opacity-50'>
            © {new Date().getFullYear()} mystyc
            {children}
          </Text>
        </span>
      </div>
    </footer>
  );
}