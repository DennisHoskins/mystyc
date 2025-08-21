interface SectionProps {
  children: React.ReactNode;
  className?: string;
  background?: 'transparent' | 'white' | 'gray' | 'blue' | 'purple';
}

export default function Section({ children, className = '', background = 'transparent' }: SectionProps) {
  const backgrounds = {
    transparent: 'bg-transparent', 
    gray: 'bg-gray-50', 
    white: 'bg-white',
    blue: 'bg-blue-950',
    purple: 'bg-[#2e0847]'
  };

  return (
    <section className={`w-full py-4 px-4 flex ${backgrounds[background]} ${className}`}>
      <div className="max-w-content mx-auto flex">
        {children}
      </div>
    </section>
  );
}