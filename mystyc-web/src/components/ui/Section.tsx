interface SectionProps {
  children: React.ReactNode;
  className?: string;
  background?: 'white' | 'gray' | 'blue';
}

export default function Section({ children, className = '', background = 'white' }: SectionProps) {
  const backgrounds = {
    white: 'bg-white',
    gray: 'bg-gray-50', 
    blue: 'bg-blue-50'
  };

  return (
    <section className={`py-16 px-4 ${backgrounds[background]} ${className}`}>
      <div className="max-w-6xl mx-auto">
        {children}
      </div>
    </section>
  );
}