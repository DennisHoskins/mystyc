export interface OpenAIRequest {
  _id?: string;
  prompt: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  requestType: 'website_content' | 'notification_content' | 'user_content';
  linkedEntityId: string;
  model: string;
  retryCount: number;
  error?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
