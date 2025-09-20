'use client'

import { useEffect, useState } from "react";

import KeywordCloud, { Keyword } from "@/components/mystyc/ui/KeywordCloud";
import Panel from "@/components/ui/Panel";

export default function KeywordsPanel({ keywords }: { keywords: string[] }) {
  const [uniqueKeywords, setUniqueKeywords] = useState<Keyword[]>([]);

  useEffect(() => {
    if (!keywords) return;

    // Count frequencies
    const freq: Record<string, number> = {};
    keywords.forEach(k => {
      const key = k.trim();
      if (!key) return;
      freq[key] = (freq[key] || 0) + 1;
    });

    // Convert into array for the cloud
    const keywordArray: Keyword[] = Object.entries(freq).map(([text, value]) => ({
      text,
      value,
    }));

    setUniqueKeywords(keywordArray);
  }, [keywords]);

  if (!keywords || uniqueKeywords.length === 0) {
    return null;
  }

  return (
    <Panel padding={4}>
      <KeywordCloud words={uniqueKeywords} />
    </Panel>
  );
}
