import Card from '@/components/ui/Card';
import AdminPanelHeader from './AdminPanelHeader';

export default function AdminCard({ icon, title, text, tag, href, className, children }: { 
  icon: React.ReactNode,
  title: string,
  text?: string | null,
  tag?: React.ReactNode;
  href?: string,
  className?: string,
  children?: React.ReactNode | null,
}) {
  return (
    <Card padding={4} className={`flex flex-col ${className}`}>
      <AdminPanelHeader
        icon={icon}
        heading={title}
        href={href}
        text={text}
        tag={tag}
      />
      {children}
    </Card>
  );
}