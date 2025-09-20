import { Notification } from 'mystyc-common/schemas';
import AdminCard from '../../ui/AdminCard';
import Panel from '@/components/ui/Panel';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import Link from '@/components/ui/Link';
import NotificationIcon from '@/components/admin/ui/icons/NotificationIcon'
import { formatDateForComponent } from '@/util/dateTime';
import { formatStringForDisplay } from '@/util/util';

export default function NotificationsCard({ notifications, total, href, className }: { 
  notifications?: Notification[] | null, 
  total?: number | null, 
  href: string,
  className?: string
}) {
  return (
    <AdminCard
      icon={<NotificationIcon />}
      title='Notifications'
      className={className}
      href={href}
    >
      <>
        {total &&
          <div className='flex flex-col space-y-2'>
            {notifications && notifications.map((notification) => (
              <Link 
                key={notification._id} 
                href={`/admin/notifications/${notification._id}`}
                className="flex !flex-row items-center space-x-4"
              >
                <Panel padding={4} className='overflow-hidden'>
                  <Heading level={6}>{formatStringForDisplay(notification.type)} - {notification.title}</Heading>
                  <Text variant='xs'>{formatDateForComponent(notification.sentAt ? notification.sentAt : notification.createdAt)}</Text>
                </Panel>
              </Link>
            ))}
          </div>
        }
      </>
    </AdminCard>
  );
}