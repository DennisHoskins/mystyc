'use client';

import { useEffect, useState, useRef } from 'react';

import Heading from '@/components/ui/Heading';
import Button from '@/components/ui/Button';
import TextInput from '@/components/ui/form/TextInput';

interface Message {
  question: string;
  answer: string;
}

export default function AnswersPage() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleAsk = () => {
    if (!input.trim()) return;
    const question = input.trim();
    const answer = `Mock answer for: "${question}"`;
    setMessages((prev) => [...prev, { question, answer }]);
    setInput('');
  };

  return (
    <>
      <div className="flex flex-col h-full">
        <div className="px-4 py-4 text-center">
          <Heading level={2}>Ask the AI anything</Heading>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-100">
          <div
            ref={containerRef}
            className="px-4 py-4 max-w-2xl w-full mx-auto space-y-6"
          >
            {messages.map((msg, idx) => (
              <div key={idx} className="space-y-2">
                <Heading level={4} className="text-gray-800">
                  Q: {msg.question}
                </Heading>
                <div className="bg-white p-3 rounded">
                  <p className="text-gray-700">A: {msg.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-shrink-0 bg-white px-4 py-4 border-t">
          <div className="max-w-2xl mx-auto space-y-2">
            <TextInput
              id="question"
              name="question"
              type="text"
              placeholder="Type your question here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full"
            />
            <Button variant="primary" onClick={handleAsk} className="w-full">
              Ask
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}