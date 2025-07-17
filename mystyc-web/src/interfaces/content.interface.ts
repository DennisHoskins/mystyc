export interface DataItem {
  key: string;
  value: string;
}

export interface OpenAIData {
  prompt?: string;
  model?: string;
  inputTokens?: number;
  outputTokens?: number;
  cost?: number;
  retryCount?: number;
}

export interface Content {
  _id?: string;
  date: string; // Format: "2025-07-07"

  type: 'notification_content' | 'website_content' | 'user_content' | 'plus_content' | 'pro_content' | 'blog_content';

  // Schedule audit trail
  scheduleId?: string;
  executionId?: string;
  
  // Notification link
  notificationId?: string;
  
  // User link
  userId?: string;

  // OpenAI link
  openAIData?: OpenAIData;
  
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