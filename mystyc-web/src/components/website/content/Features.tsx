import Panel from '@/components/ui/Panel';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';

export default function Features() {
  return (
    <div className='flex flex-col'>
      <Heading level={1} className="text-center mb-8">
        Features
      </Heading>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Panel>
          <Heading level={2}>
            Insight Dashboard
          </Heading>
          <Text variant='body'>View personalized analytics about your habits, mood, and progress over time.</Text>
        </Panel>
        <Panel>
          <Heading level={2}>
            Guided Journal
          </Heading>
          <Text variant='body'>Write and reflect with prompts tailored to your goals and growth areas.</Text>
        </Panel>
        <Panel>
          <Heading level={2}>
            Community Forums
          </Heading>
          <Text variant='body'>Connect with others, share experiences, and learn from a supportive community.</Text>
        </Panel>
        <Panel>
          <Heading level={2}>
            Secure Cloud Storage
          </Heading>
          <Text variant='body'>All of your entries and data are encrypted and stored securely in the cloud.</Text>
        </Panel>
      </div>
    </div>
  );
}