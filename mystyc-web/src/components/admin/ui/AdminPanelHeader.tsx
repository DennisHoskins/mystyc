import React from 'react';

import { IconComponent } from '@/components/ui/icons/Icon';
import Avatar from '@/components/ui/Avatar';
import Link from '@/components/ui/Link';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';

interface AdminPanelHeaderProps {
  icon: IconComponent | React.ReactNode;
  type?: string;
  typeHref?: string;
  heading?: string;
  href?: string;
  text?: string | null,
  tag?: React.ReactNode
}

export default function AdminPanelHeader({ icon, type, typeHref, heading, href, text, tag }: AdminPanelHeaderProps) {
  return(
    <div className="flex items-center">
      <div className='flex-1 flex space-x-1 items-center'>
        <Avatar size={'small'} icon={icon} />
        <div className='flex space-x-2 items-center'>
          {(type && typeHref) && (
            <>
              <Link href={typeHref}>
                <Heading level={5}>{type}</Heading>
              </Link>
              <span className='mr-1 text-gray-300'>/</span>
            </>
          )}
          {href
            ? <Link href={href} className="flex items-center space-x-2">
                <Heading level={5}>{heading}</Heading>
                {text && <Text variant='small'>{text}</Text>}
              </Link>
            : <div className="flex items-center space-x-2">
                <Heading level={5}>{heading}</Heading>
                {text && <Text variant='small'>{text}</Text>}
              </div>
          }
        </div>
      </div>
      <div className='-mt-1'>
        {tag}
      </div>          
    </div>
  );
}