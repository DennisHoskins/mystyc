export interface DataItem {
  key: string;
  value: string;
}

export interface Content {
  _id?: string;
  date: string; // Format: "2025-07-07"
  
  // Core content
  title: string;
  message: string;
  imageUrl: string;
  linkUrl?: string;
  linkText?: string;

  // Payload
  data: DataItem[];
  
  // Metadata
  sources: string[];
  status: 'generated' | 'failed' | 'fallback';
  error?: string;
  generatedAt: Date;
  generationDuration: number;
  
  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}
