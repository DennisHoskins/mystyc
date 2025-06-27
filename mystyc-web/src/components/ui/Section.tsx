interface SectionProps {
  children: React.ReactNode;
  className?: string;
  background?: 'transparent' | 'white' | 'gray' | 'blue';
}

export default function Section({ children, className = '', background = 'transparent' }: SectionProps) {
  const backgrounds = {
    transparent: 'bg-transparent', 
    gray: 'bg-gray-50', 
    white: 'bg-white',
    blue: 'bg-blue-50'
  };

  return (
    <section className={`py-16 px-4 ${backgrounds[background]} ${className}`}>
      <div className="max-w-content mx-auto">
        {children}
      </div>
    </section>
  );
}