export class OpenAIContextDto {
  requestType: 'website_content' | 'notification_content' | 'user_content';
  linkedEntityId: string;
}
