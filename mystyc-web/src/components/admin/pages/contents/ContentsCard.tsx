import { Content } from 'mystyc-common/schemas';
import Text from '@/components/ui/Text';
import Heading from '@/components/ui/Heading';
import Panel from '@/components/ui/Panel';
import Link from '@/components/ui/Link';
import ContentIcon from '@/components/admin/ui/icons/ContentIcon'
import { formatDateForComponent } from '@/util/dateTime';
import { formatStringForDisplay } from '@/util/util';
import AdminCard from '../../ui/AdminCard';

export default function ContentsCard({ content, total, href, className }: { 
  content?: Content[] | null, 
  total?: number | null, 
  href: string,
  className?: string
}) {
  return (
    <AdminCard
      icon={<ContentIcon />}
      title='Content'
      href={href}
      className={className}
    >
      <>
        {total &&
          <div className='flex flex-col space-y-2'>
            {content && content.map((content) => (
              <Link 
                key={content._id} 
                href={`/admin/content/${content._id}`}
                className="flex !flex-row items-center space-x-4"
              >
                <Panel className='overflow-hidden'>
                  <Heading level={6}>{formatStringForDisplay(content.type.replace("_content", ""))} - {content.title}</Heading>
                  <Text variant='xs'>{formatDateForComponent(content.generatedAt)}</Text>
                </Panel>
              </Link>
            ))}
          </div>
       }
      </>
    </AdminCard>
  );
}