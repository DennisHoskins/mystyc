'use client'

import { useEffect, useState } from "react";

import { SignInteractionComplete } from "mystyc-common";
import KeywordCloud, { Keyword } from "@/components/mystyc/ui/KeywordCloud";
import Panel from "@/components/ui/Panel";

export default function KeywordsPanel({ interaction }: { interaction: SignInteractionComplete | null | undefined }) {
  const [keywords, setKeywords] = useState<Keyword[]>([]);

  useEffect(() => {
    // Gather all keywords into one array
    const allKeywords = [
      ...(interaction?.keywords || []),
      ...(interaction?.dynamicData?.keywords || []),
      ...(interaction?.elementInteractionData?.keywords || []),
      ...(interaction?.modalityInteractionData?.keywords || []),
      ...(interaction?.polarityInteractionData?.keywords || []),
      ...(interaction?.energyTypeData?.keywords || []),
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
  }, [interaction]);

  return (
    <Panel padding={4}>
      <KeywordCloud words={keywords} />
    </Panel>
  );
}
