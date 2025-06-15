import { redirect } from 'next/navigation';

export function forceLogout(reason: string, context?: string) {
  console.log('Force logout triggered:', reason, context || '');
  redirect('/api/auth/logout');
}

// export async function forceLogout(reason: string, context?: string) {
//  console.log('Force logout triggered:', reason, context || '');
 
//  try {
//    const headersList = await headers();
//    const host = headersList.get('host') || 'localhost:3000';
//    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
   
//    const response = await fetch(`${protocol}://${host}/api/auth/logout`, {
//      method: 'POST',
//      headers: { 
//        'Content-Type': 'application/json',
//        'x-source': 'server-force-logout'
//      }
//    });
   
//    if (!response.ok) {
//      console.error('Force logout failed:', response.status);
//    }
//  } catch (error) {
//    console.error('Force logout error:', error);
//  }
// }