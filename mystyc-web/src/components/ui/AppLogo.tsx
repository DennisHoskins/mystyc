'use client'

import IconEye from '@/components/ui/icons/IconEye';
import Sparkle from './sparkle/Sparkle';
import { AppUser } from '@/interfaces/app/app-user.interface';

type AppLogoProps = {
  orientation?: 'vertical' | 'horizontal';
  showText?: boolean;
  user?: AppUser | null;
  subheading?: string;
  scale?: number;
  className?: string;
};

export default function AppLogo({
  orientation = 'vertical',
  showText = true,
  user,
  subheading,
  scale = 1,
  className = '',
}: AppLogoProps) {
  const isVertical = orientation === 'vertical';
  const iconSize = 50 * scale;
  const titleSize = `${1.25 * scale}rem`; // roughly 20px base scaled
  const subSize = `${0.75 * scale}rem`; // roughly 12px base scaled

  return (
    <div className={`flex ${isVertical ? 'flex-col items-center' : 'flex-row items-center'} ${className}`}>
      <IconEye size={iconSize} className="text-gray-500" />
      {showText && (
        <div className={`${isVertical ? 'text-center' : 'ml-1'}`}>
          <div style={{ fontSize: titleSize }} className="font-bold tracking-wide text-gray-900 flex items-center">
            mystyc<Sparkle user={user} />
          </div>
          {subheading && (
            <div style={{ fontSize: subSize }} className="text-gray-500 mt-4">
              {subheading}
            </div>
          )}
        </div>
      )}
    </div>
  );
}