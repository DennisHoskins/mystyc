import Panel from '@/components/ui/Panel';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';

export default function WebsiteContent() {
  return (
    <div className='flex flex-col'>
      <Heading level={1} className="text-center mb-16">
        More Website Content
      </Heading>
      <Text  className="!text-gray-500 mb-10 text-lg text-center mx-auto">There will be a message here</Text>
      <div className='mt-8 flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[15em]'>
          <Panel>
            <Heading level={3}>Heading</Heading>
            <Text className='mt-2 !text-gray-500'>Description</Text>
          </Panel>
          <Panel>
            <Heading level={3}>Heading</Heading>
            <Text className='mt-2 !text-gray-500'>Description</Text>
          </Panel>
          <Panel>
            <Heading level={3}>Heading</Heading>
            <Text className='mt-2 !text-gray-500'>Description</Text>
          </Panel>
          <Panel>
            <Heading level={3}>Heading</Heading>
            <Text className='mt-2 !text-gray-500'>Description</Text>
          </Panel>
          <Panel>
            <Heading level={3}>Heading</Heading>
            <Text className='mt-2 !text-gray-500'>Description</Text>
          </Panel>
          <Panel>
            <Heading level={3}>Heading</Heading>
            <Text className='mt-2 !text-gray-500'>Description</Text>
          </Panel>
      </div>
    </div>
  );
}