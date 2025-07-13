export interface DataItem {
  key: string;
  value: string;
}

export interface Content {
  _id?: string;
  date: string; // Format: "2025-07-07"

  // Schedule audit trail
  scheduleId?: string;
  executionId?: string;
  
  // Notification link
  notificationId?: string;
  
  // User link
  userId?: string;

  // OpenAI link
  openAIRequestId?: string;  
  
  // Core content
  title: string;
  message: string;
  
  imageUrl?: string;
  linkUrl?: string;
  linkText?: string;

  // Payload
  data: DataItem[];
  
  // Metadata
  sources: string[];
  status: 'pending' | 'generated' | 'failed' | 'fallback';
  error?: string;
  generatedAt: Date;
  generationDuration: number;
  
  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}