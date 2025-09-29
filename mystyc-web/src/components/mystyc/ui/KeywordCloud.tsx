import React from "react";
import { WordCloud } from '@isoterik/react-word-cloud';

export interface Keyword {
  text: string;
  value: number;
}

export default function KeywordCloud({ words }: { words: Keyword[] }) {
  const fontSize = (word: Keyword) => Math.log2(word.value + 1) * 25;

  return (
    <WordCloud
      words={words}
      font={'Google Sans Text, Google Sans, Roboto, Arial, sans-serif'}
      fontSize={fontSize}
      rotate={() => 0}
      padding={2}
      width={600}
      height={300}
    />
  );
}
