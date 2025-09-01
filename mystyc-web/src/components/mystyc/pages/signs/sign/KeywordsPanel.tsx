'use client'

import { useEffect, useState } from "react";

import { SignComplete } from "mystyc-common";
import KeywordCloud, { Keyword } from "@/components/mystyc/ui/KeywordCloud";
import Panel from "@/components/ui/Panel";

export default function KeywordsPanel({ sign }: { sign: SignComplete }) {
  const [keywords, setKeywords] = useState<Keyword[]>([]);

  useEffect(() => {
    if (!sign) return;

    // Gather all keywords into one array
    const allKeywords = [
      ...(sign.keywords || []),
      ...(sign.houseData?.keywords || []),
      ...(sign.elementData?.keywords || []),
      ...(sign.modalityData?.keywords || []),
      ...(sign.polarityData?.keywords || []),
      ...(sign.energyTypeData?.keywords || []),
    ];

    // Count frequencies
    const freq: Record<string, number> = {};
    allKeywords.forEach(k => {
      const key = k.trim();
      if (!key) return;
      freq[key] = (freq[key] || 0) + 1;
    });

    // Convert into array for the cloud
    const keywordArray: Keyword[] = Object.entries(freq).map(([text, value]) => ({
      text,
      value,
    }));

    setKeywords(keywordArray);
  }, [sign]);

  if (!sign || keywords.length === 0) {
    return null;
  }

  return (
    <Panel>
      <KeywordCloud words={keywords} />
    </Panel>
  );
}
