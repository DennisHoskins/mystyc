import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = `Calendar | mystyc` + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import CalendarPage from '@/components/mystyc/pages/calendar/CalendarPage';

export default async function Page() {
  return <CalendarPage />;
}