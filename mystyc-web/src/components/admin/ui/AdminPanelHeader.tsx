import { IconComponent } from '@/components/ui/icons/Icon';
import Avatar from '@/components/ui/Avatar';
import Link from '@/components/ui/Link';
import Heading from '@/components/ui/Heading';
import React from 'react';

interface AdminPanelHeaderProps {
  icon: IconComponent | React.ReactNode;
  type?: string;
  typeHref?: string;
  heading?: string;
  href?: string;
  tag?: React.ReactNode
}

export default function AdminPanelHeader({ icon, type, typeHref, heading, href, tag }: AdminPanelHeaderProps) {

console.log(tag);

  return(
    <>
      <div className="flex w-full items-center space-x-2">
        <Avatar size={'small'} icon={icon} />
        <div className='flex flex-row items-center flex-1 space-x-1'>
          {(type && typeHref) && (
            <>
              <Link href={typeHref}>
                <Heading level={3}>{type}</Heading>
              </Link>
              <span className='mr-1'>/</span>
            </>
          )}
          {href ? (
            <Link href={href}>
              <Heading level={3}>{heading}</Heading>
            </Link>
          ) : (
            <Heading level={3}>{heading}</Heading>
          )}
        </div>
        {tag}
      </div>
      <hr />
    </>
  );
}