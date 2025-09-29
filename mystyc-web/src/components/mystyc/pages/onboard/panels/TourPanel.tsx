import { ChevronRight } from 'lucide-react';

import { AppUser } from '@/interfaces/app/app-user.interface';
import { User } from 'mystyc-common';
import { useSetUser } from '@/components/ui/context/AppContext'; 
import TourPanelItem from './TourPanelItem';
import { BookHeart, CalendarDays, Drama, SunMoon } from 'lucide-react';
import UserStar from '@/components/ui/icons/UserStar';
import Form from '@/components/ui/form/Form';
import Button from '@/components/ui/Button';
import Text from '@/components/ui/Text';

interface TourPanelProps {
  user: AppUser;
  updatedUser: User | null;
}

export default function TourPanel({ user, updatedUser }: TourPanelProps) {
  const setUser = useSetUser();

  if (!updatedUser) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newUser = {
      ...user,
      userProfile: updatedUser.userProfile,
    };
    setUser(newUser);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Text variant='xs' className='-mt-4 mb-2 md:mb-4 block md:hidden'>
        You&apos;re all set. Here&apos;s a quick tour to help you find your way around:
      </Text>
      <Text variant='body' className='-mt-4 mb-2 md:mb-4 hidden md:block'>
        You&apos;re all set. Here&apos;s a quick tour to help you find your way around:
      </Text>

      <div className='flex flex-col mb-2 md:mb-6 mx-0 md:mx-10 space-y-2 md:space-y-4'>
        <TourPanelItem 
          label='Daily Insights' 
          icon={<SunMoon className='w-10 h-10 text-white' strokeWidth={1} />} 
          text='Your daily horoscope and cosmic energy analysis. Get practical insights and actionable advice about your mood, decision-making, and opportunities throughout the day.'
        />
        <TourPanelItem 
          label='Star Profile' 
          icon={<UserStar width={40} height={40} strokeWidth={1} className='text-white' />} 
          text='Explore your birth chart. Learn about your core identity, the way you express your emotions, and how the stars affect your interactions with others.'
        />
        <TourPanelItem 
          label='Relationships' 
          icon={<Drama className='w-10 h-10 text-white' strokeWidth={1} />} 
          text='Discover the dynamics and compare compatibility between star signs. Find out what works, what doesn&apos;t work, and how to leverage your keys to success.'
        />
        <TourPanelItem 
          label='Cosmic Calendar' 
          icon={<CalendarDays className='w-10 h-10 text-white' strokeWidth={1} />} 
          text='Stay informed about upcoming astrological events. Track lunar cycles, planetary retrogrades, and major transits that influence collective and personal energy.'
        />
        <TourPanelItem 
          label='Astrology Library' 
          icon={<BookHeart className='w-10 h-10 text-white' strokeWidth={1} />} 
          text='Access the comprehensive mystyc resource database. Learn about foundational astrological concepts, star signs, stellar houses, tarot meanings, and more.'
        />
      </div>

      <Button
        type="submit"
        autoFocus
        loadingContent="Working..."
        className="py-3 w-auto min-w-40 self-center flex items-center justify-center !rounded-full mb-4"
      >
        Enter
        <ChevronRight className='h-4 w-4 ml-2 -mr-1' strokeWidth={3} />
      </Button>
    </Form>
  );
}