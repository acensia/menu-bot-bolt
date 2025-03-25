import { MessageHandler } from './types';

export class MinuteReminderHandler implements MessageHandler {
  getMessage(): string {
    const now = new Date();
    return `⏰ Time check: ${now.toLocaleTimeString('ko-KR')}`;
  }

  getCronPattern(): string {
    return '*/1 * * * *'; // Every minute
  }

  getTargetChannels(): string[] | undefined {
    return undefined; // Send to all accessible channels
  }
}
