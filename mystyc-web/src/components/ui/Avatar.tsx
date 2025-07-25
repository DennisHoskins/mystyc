import React from 'react';

import { IconComponent } from '@/components/ui/icons/Icon';

type AvatarSize = 'small' | 'medium' | 'large';

interface AvatarProps {
  icon: IconComponent | React.ReactNode;
  size?: AvatarSize;
  className?: string;
}

const sizeMap = {
  small: { avatar: 6, icon: 3, padding: 'p-1.5' },
  medium: { avatar: 8, icon: 3, padding: 'p-2' },
  large: { avatar: 12, icon: 4, padding: 'p-2.5' }
};

export default function Avatar({ icon, size = 'medium', className }: AvatarProps) {
  const { avatar: avatarSize, icon: iconSize, padding } = sizeMap[size];

  return (
    <div className="flex-shrink-0">
      <div className={`w-${avatarSize} h-${avatarSize} bg-gray-200 rounded-full flex items-center justify-center ${padding} ${className}`}>
        {React.isValidElement(icon) 
          ? React.cloneElement(icon, { size: iconSize } as any)
          : typeof icon === 'function'
          ? React.createElement(icon, { size: iconSize })
          : icon
        }
      </div>
    </div>
  );
}