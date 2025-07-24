import UsersPage from '@/components/admin/pages/users/UsersPage';

export default async function Page({ 
  searchParams 
}: { 
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> 
}) {
  return <UsersPage searchParams={await searchParams} />
}