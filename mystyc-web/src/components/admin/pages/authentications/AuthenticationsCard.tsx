import { AuthEvent } from 'mystyc-common/schemas';
import AdminCard from '../../ui/AdminCard';
import Heading from '@/components/ui/Heading';
import Panel from '@/components/ui/Panel';
import Link from '@/components/ui/Link';
import AuthenticationIcon from '@/components/admin/ui/icons/AuthenticationIcon'
import Text from '@/components/ui/Text';
import { formatDateForComponent } from '@/util/dateTime';
import { formatStringForDisplay } from '@/util/util';

export default function AuthenticationsCard({ authEvents, total, href }: { authEvents: AuthEvent[], total?: number | null, href: string }) {
  return (
    <AdminCard
      icon={<AuthenticationIcon />}
      title='Auth Events'
      href={href}
      className='flex-1'
    >
      <>
        {total &&
          <div className='space-y-2'>
            {authEvents.map((authEvent) => (
              <Link 
                key={authEvent._id} 
                href={`/admin/authentication/${authEvent._id}`}
                className="flex !flex-row items-center space-x-4"
              > 
                <Panel padding={4} className='overflow-hidden'>
                  <Heading level={6}>{formatStringForDisplay(authEvent.type.replace("-", " "))} - {authEvent.deviceName}</Heading>
                  <Text variant='xs'>{formatDateForComponent(authEvent.timestamp)}</Text>
                </Panel>
              </Link>
            ))}
          </div>
        }
      </>
    </AdminCard>
  );
}