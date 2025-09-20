
import Link from '@/components/ui/Link';
import Heading from '@/components/ui/Heading';
import Capsule from '@/components/ui/Capsule';

interface AdminPanelLinksLinkProps {
  label: string;
  total?: number;
  href: string;
}

interface AdminPanelLinksSublinkProps {
  icon?: React.ReactNode | null;
  label: string;
  href: string;
}

interface AdminPanelLinksProps {
  label: string;
  total?: number;
  href: string;
  sublinks?: AdminPanelLinksSublinkProps[] | null;
  links?: AdminPanelLinksLinkProps[] | null;
}

export default function AdminPanelLink({ label, total, href, sublinks, links } :AdminPanelLinksProps ) {
  return (
    <div className='flex flex-col w-full space-y-2'>
      <Link href={href} className='flex items-baseline space-x-2'>
        <Heading size='md'>{label}</Heading>
        <Heading size='sm'>{total}</Heading>
      </Link>

      <div className='flex flex-wrap gap-2'>
        {sublinks && sublinks.map((sublink, index) => (
          <Capsule 
            key={'sublink-' + index}
            icon={sublink.icon}
            label={sublink.label}
            href={sublink.href}
          />
        ))}
      </div>

      {links && links.map((link, index) => (
        <Link key={'link-' + index} href={link.href} className='flex items-baseline space-x-2'>
          <Heading size='xs'>{link.label}</Heading>
          <Heading size='xs'>{link.total}</Heading>
        </Link>
      ))}
    </div>
  );
}